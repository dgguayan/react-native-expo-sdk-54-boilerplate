import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DEFAULT_THEME_PRESET_ID,
  isThemePresetId,
  type ThemePresetId,
} from "@/constants/theme-presets";
import { supabase } from "@/lib/supabase";

export const APPLICATION_THEME_SETTING_KEY = "theme";
const APPLICATION_THEME_CACHE_KEY = "application-theme-preset";
const THEME_SETTING_VERSION = 1;
const THEME_SYNC_REQUEST_TIMEOUT_MS = 10_000;

interface ThemeSettingValue {
  preset: ThemePresetId;
  version: number;
}

interface AppSettingRow {
  key: string;
  value: unknown;
}

interface ErrorLike {
  code?: string;
  details?: string | null;
  hint?: string | null;
  message?: string;
}

export type ThemeSyncStatus =
  | "idle"
  | "syncing"
  | "synced"
  | "missing"
  | "invalid"
  | "unconfigured"
  | "forbidden"
  | "offline"
  | "error";

export interface ThemeSyncState {
  message: string | null;
  retryable: boolean;
  status: ThemeSyncStatus;
}

export interface ThemeSettingResult {
  presetId: ThemePresetId;
  syncState: ThemeSyncState;
}

export interface ThemeSaveResult {
  error: string | null;
  syncState: ThemeSyncState;
}

export const initialThemeSyncState: ThemeSyncState = {
  message: null,
  retryable: false,
  status: "idle",
};

export const syncingThemeState: ThemeSyncState = {
  message: null,
  retryable: false,
  status: "syncing",
};

let inFlightThemeFetch: Promise<ThemeSettingResult> | null = null;

function developmentLog(
  message: string,
  details?: Record<string, unknown>,
): void {
  if (!__DEV__) return;
  console.info(`[theme-sync] ${message}`, details ?? {});
}

function parseThemeSetting(value: unknown): ThemePresetId | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const preset = (value as Partial<ThemeSettingValue>).preset;
  return isThemePresetId(preset) ? preset : null;
}

function classifySyncError(error: ErrorLike): ThemeSyncState {
  const code = error.code?.toUpperCase() ?? "";
  const rawMessage = error.message ?? "Unknown theme synchronization error.";
  const normalizedMessage = rawMessage.toLowerCase();

  if (code === "PGRST205" || code === "42P01") {
    return {
      message:
        "Theme storage is not provisioned. Apply the app_settings Supabase migration, then retry synchronization.",
      retryable: false,
      status: "unconfigured",
    };
  }

  if (
    code === "42501" ||
    code === "PGRST301" ||
    normalizedMessage.includes("permission denied") ||
    normalizedMessage.includes("row-level security")
  ) {
    return {
      message:
        "Supabase denied access to theme settings. Verify the app_settings RLS policies and the user's Admin role assignment.",
      retryable: false,
      status: "forbidden",
    };
  }

  if (
    normalizedMessage.includes("failed to fetch") ||
    normalizedMessage.includes("load failed") ||
    normalizedMessage.includes("network") ||
    normalizedMessage.includes("offline") ||
    normalizedMessage.includes("timeout") ||
    normalizedMessage.includes("abort")
  ) {
    return {
      message:
        "Theme synchronization is offline. The cached theme remains active while the application reconnects.",
      retryable: true,
      status: "offline",
    };
  }

  return {
    message:
      "Theme synchronization failed. The cached theme remains active and synchronization will retry.",
    retryable: true,
    status: "error",
  };
}

function logSyncFailure(operation: "fetch" | "save", error: ErrorLike): void {
  developmentLog(`Supabase ${operation} failed.`, {
    code: error.code ?? "unknown",
    details: error.details ?? null,
    hint: error.hint ?? null,
    message: error.message ?? "Unknown error",
    schema: "public",
    settingKey: APPLICATION_THEME_SETTING_KEY,
    table: "app_settings",
  });
}

export async function getCachedThemePreset(): Promise<ThemePresetId> {
  try {
    const cached = await AsyncStorage.getItem(APPLICATION_THEME_CACHE_KEY);
    if (!cached) return DEFAULT_THEME_PRESET_ID;
    if (isThemePresetId(cached)) return cached;

    developmentLog("Discarded an invalid cached theme preset.", {
      cachedValue: cached,
    });
    await AsyncStorage.removeItem(APPLICATION_THEME_CACHE_KEY).catch(
      () => undefined,
    );
  } catch (error) {
    developmentLog("Unable to read the cached theme preset.", {
      message: error instanceof Error ? error.message : String(error),
    });
  }

  return DEFAULT_THEME_PRESET_ID;
}

export async function cacheThemePreset(
  presetId: ThemePresetId,
): Promise<void> {
  if (!isThemePresetId(presetId)) {
    throw new Error(`Cannot cache unknown theme preset: ${String(presetId)}`);
  }
  await AsyncStorage.setItem(APPLICATION_THEME_CACHE_KEY, presetId);
}

async function performThemePresetFetch(): Promise<ThemeSettingResult> {
  const fallbackPresetId = await getCachedThemePreset();
  const abortController = new AbortController();
  const timeout = setTimeout(
    () => abortController.abort(),
    THEME_SYNC_REQUEST_TIMEOUT_MS,
  );
  let response;

  try {
    response = await supabase
      .schema("public")
      .from("app_settings")
      .select("key,value")
      .eq("key", APPLICATION_THEME_SETTING_KEY)
      .abortSignal(abortController.signal)
      .maybeSingle();
  } catch (caughtError: unknown) {
    const error: ErrorLike = {
      message:
        caughtError instanceof Error
          ? caughtError.message
          : String(caughtError),
    };
    logSyncFailure("fetch", error);
    return {
      presetId: fallbackPresetId,
      syncState: classifySyncError(error),
    };
  } finally {
    clearTimeout(timeout);
  }

  const { data, error } = response;

  if (error) {
    logSyncFailure("fetch", error);
    return {
      presetId: fallbackPresetId,
      syncState: classifySyncError(error),
    };
  }

  const row = data as AppSettingRow | null;
  if (!row) {
    await cacheThemePreset(DEFAULT_THEME_PRESET_ID).catch(() => undefined);
    developmentLog("The theme row is missing; using the default preset.", {
      settingKey: APPLICATION_THEME_SETTING_KEY,
    });
    return {
      presetId: DEFAULT_THEME_PRESET_ID,
      syncState: {
        message:
          "No shared theme setting exists yet. The Default preset is active; an administrator can save it to create the setting.",
        retryable: false,
        status: "missing",
      },
    };
  }

  const presetId = parseThemeSetting(row.value);
  if (!presetId) {
    await cacheThemePreset(DEFAULT_THEME_PRESET_ID).catch(() => undefined);
    developmentLog("The database theme value is invalid; using Default.", {
      settingKey: APPLICATION_THEME_SETTING_KEY,
      value: row.value,
    });
    return {
      presetId: DEFAULT_THEME_PRESET_ID,
      syncState: {
        message:
          "The shared theme value is invalid. The Default preset is active; save a valid preset to repair it.",
        retryable: false,
        status: "invalid",
      },
    };
  }

  await cacheThemePreset(presetId).catch((cacheError: unknown) => {
    developmentLog("The synchronized theme could not be cached.", {
      message:
        cacheError instanceof Error
          ? cacheError.message
          : String(cacheError),
    });
  });

  return {
    presetId,
    syncState: {
      message: null,
      retryable: false,
      status: "synced",
    },
  };
}

export function fetchApplicationThemePreset(): Promise<ThemeSettingResult> {
  if (inFlightThemeFetch) return inFlightThemeFetch;

  inFlightThemeFetch = performThemePresetFetch().finally(() => {
    inFlightThemeFetch = null;
  });
  return inFlightThemeFetch;
}

export async function saveApplicationThemePreset(
  presetId: ThemePresetId,
): Promise<ThemeSaveResult> {
  if (!isThemePresetId(presetId)) {
    const syncState: ThemeSyncState = {
      message: "The selected theme preset is invalid.",
      retryable: false,
      status: "invalid",
    };
    return { error: syncState.message, syncState };
  }

  const value: ThemeSettingValue = {
    preset: presetId,
    version: THEME_SETTING_VERSION,
  };
  const { error } = await supabase
    .schema("public")
    .from("app_settings")
    .upsert(
      {
        key: APPLICATION_THEME_SETTING_KEY,
        value,
      },
      { onConflict: "key" },
    );

  if (error) {
    logSyncFailure("save", error);
    const syncState = classifySyncError(error);
    return { error: syncState.message, syncState };
  }

  await cacheThemePreset(presetId).catch((cacheError: unknown) => {
    developmentLog("The saved theme could not be cached.", {
      message:
        cacheError instanceof Error
          ? cacheError.message
          : String(cacheError),
    });
  });

  return {
    error: null,
    syncState: {
      message: null,
      retryable: false,
      status: "synced",
    },
  };
}

type ThemeRealtimeStatus = "connected" | "disconnected";

export function subscribeToApplicationTheme(
  onThemeChange: (presetId: ThemePresetId) => void,
  onConnectionChange?: (status: ThemeRealtimeStatus) => void,
): () => void {
  let closed = false;
  const channel = supabase
    .channel("application-theme-setting")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "app_settings",
        filter: `key=eq.${APPLICATION_THEME_SETTING_KEY}`,
      },
      (payload) => {
        const presetId = parseThemeSetting(
          (payload.new as Partial<AppSettingRow> | null)?.value,
        );
        if (!presetId) {
          developmentLog("Ignored an invalid realtime theme payload.");
          return;
        }

        cacheThemePreset(presetId).catch((cacheError: unknown) => {
          developmentLog("A realtime theme could not be cached.", {
            message:
              cacheError instanceof Error
                ? cacheError.message
                : String(cacheError),
          });
        });
        onThemeChange(presetId);
      },
    )
    .subscribe((status, error) => {
      if (closed) return;
      if (status === "SUBSCRIBED") {
        onConnectionChange?.("connected");
        return;
      }
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        developmentLog("Realtime theme subscription disconnected.", {
          message: error?.message ?? status,
          status,
        });
        onConnectionChange?.("disconnected");
      }
    });

  return () => {
    closed = true;
    supabase.removeChannel(channel).catch(() => undefined);
  };
}
