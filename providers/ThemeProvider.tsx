import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
  type Theme as NavigationTheme,
} from "@react-navigation/native";
import * as SystemUI from "expo-system-ui";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, Platform } from "react-native";

import {
  type AppColors,
  type AppThemeTokens,
  type ResolvedTheme,
  type ThemeMode,
  surfaceShadow,
} from "@/constants/theme";
import {
  DEFAULT_THEME_PRESET_ID,
  themePresets,
  type ThemePresetId,
} from "@/constants/theme-presets";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  fetchApplicationThemePreset,
  getCachedThemePreset,
  initialThemeSyncState,
  saveApplicationThemePreset,
  subscribeToApplicationTheme,
  syncingThemeState,
  type ThemeSyncState,
} from "@/lib/theme-settings";

const THEME_STORAGE_KEY = "app-theme-preference";
const THEME_SYNC_RETRY_BASE_MS = 1_500;
const THEME_SYNC_RETRY_MAX_MS = 60_000;
const THEME_SYNC_MAX_AUTOMATIC_RETRIES = 6;

export interface AppThemeContextValue {
  activePresetId: ThemePresetId;
  colors: AppColors;
  isReady: boolean;
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  savePreset: (
    presetId: ThemePresetId,
  ) => Promise<{ error: string | null }>;
  setMode: (mode: ThemeMode) => void;
  shadows: {
    surface: ReturnType<typeof surfaceShadow>;
  };
  retryThemeSync: () => void;
  syncState: ThemeSyncState;
  tokens: AppThemeTokens;
  toggleTheme: () => void;
}

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

function createNavigationTheme(
  resolvedTheme: ResolvedTheme,
  colors: AppColors,
): NavigationTheme {
  const baseTheme = resolvedTheme === "dark" ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.brand,
      background: colors.background,
      card: colors.surface,
      text: colors.foreground,
      border: colors.border,
      notification: colors.danger,
    },
  };
}

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemTheme = useColorScheme() ?? "light";
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [activePresetId, setActivePresetId] = useState<ThemePresetId>(
    DEFAULT_THEME_PRESET_ID,
  );
  const [isReady, setIsReady] = useState(false);
  const [syncState, setSyncState] = useState<ThemeSyncState>(
    initialThemeSyncState,
  );
  const [syncRevision, setSyncRevision] = useState(0);
  const hasCompletedInitialSync = useRef(false);
  const updateSyncState = useCallback((nextState: ThemeSyncState) => {
    setSyncState((currentState) =>
      currentState.status === nextState.status &&
      currentState.message === nextState.message &&
      currentState.retryable === nextState.retryable
        ? currentState
        : nextState,
    );
  }, []);

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      AsyncStorage.getItem(THEME_STORAGE_KEY),
      getCachedThemePreset(),
    ])
      .then(([storedModeResult, cachedPresetResult]) => {
        if (!isMounted) return;

        const storedMode =
          storedModeResult.status === "fulfilled"
            ? storedModeResult.value
            : null;
        if (
          storedMode === "system" ||
          storedMode === "light" ||
          storedMode === "dark"
        ) {
          setModeState(storedMode);
        } else if (storedMode) {
          if (__DEV__) {
            console.warn("[theme] Discarded an invalid display mode.", {
              storedMode,
            });
          }
          AsyncStorage.removeItem(THEME_STORAGE_KEY).catch(() => undefined);
        }
        if (cachedPresetResult.status === "fulfilled") {
          setActivePresetId(cachedPresetResult.value);
        }

        if (__DEV__ && storedModeResult.status === "rejected") {
          console.warn("[theme] Failed to restore the display mode.", {
            message:
              storedModeResult.reason instanceof Error
                ? storedModeResult.reason.message
                : String(storedModeResult.reason),
          });
        }
      })
      .finally(() => {
        if (isMounted) setIsReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const resolvedTheme: ResolvedTheme =
    mode === "system" ? systemTheme : mode;
  const preset = themePresets[activePresetId];
  const colors = preset.colors[resolvedTheme];
  const tokens = preset.tokens;

  const retryThemeSync = useCallback(() => {
    setSyncRevision((revision) => revision + 1);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    // Transient failures use capped exponential backoff. Schema and policy
    // failures are intentionally not polled; they resume on app focus, browser
    // connectivity, or the explicit retry action in Theme Settings.
    let cancelled = false;
    let inFlight = false;
    let retryAttempt = 0;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const clearRetryTimer = () => {
      if (!retryTimer) return;
      clearTimeout(retryTimer);
      retryTimer = null;
    };

    const synchronize = async (showProgress: boolean) => {
      if (cancelled || inFlight) return;
      inFlight = true;
      clearRetryTimer();

      if (showProgress && !hasCompletedInitialSync.current) {
        updateSyncState(syncingThemeState);
      }

      try {
        const result = await fetchApplicationThemePreset();
        if (cancelled) return;

        hasCompletedInitialSync.current = true;
        setActivePresetId(result.presetId);
        updateSyncState(result.syncState);

        if (
          result.syncState.retryable &&
          retryAttempt < THEME_SYNC_MAX_AUTOMATIC_RETRIES
        ) {
          const delay = Math.min(
            THEME_SYNC_RETRY_BASE_MS * 2 ** retryAttempt,
            THEME_SYNC_RETRY_MAX_MS,
          );
          retryAttempt += 1;
          retryTimer = setTimeout(() => {
            void synchronize(false);
          }, delay);
        } else {
          retryAttempt = 0;
        }
      } catch (error: unknown) {
        if (cancelled) return;

        hasCompletedInitialSync.current = true;
        updateSyncState({
          message:
            "Theme synchronization failed unexpectedly. The cached theme remains active while the application retries.",
          retryable: true,
          status: "error",
        });
        if (__DEV__) {
          console.warn("[theme-sync] Unexpected synchronization error.", {
            message: error instanceof Error ? error.message : String(error),
          });
        }

        if (retryAttempt < THEME_SYNC_MAX_AUTOMATIC_RETRIES) {
          const delay = Math.min(
            THEME_SYNC_RETRY_BASE_MS * 2 ** retryAttempt,
            THEME_SYNC_RETRY_MAX_MS,
          );
          retryAttempt += 1;
          retryTimer = setTimeout(() => {
            void synchronize(false);
          }, delay);
        }
      } finally {
        inFlight = false;
      }
    };

    const synchronizeNow = () => {
      retryAttempt = 0;
      clearRetryTimer();
      void synchronize(false);
    };

    void synchronize(true);

    const appStateSubscription =
      Platform.OS === "web"
        ? null
        : AppState.addEventListener("change", (nextState) => {
            if (nextState === "active") synchronizeNow();
          });

    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.addEventListener("online", synchronizeNow);
    }

    return () => {
      cancelled = true;
      clearRetryTimer();
      appStateSubscription?.remove();
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.removeEventListener("online", synchronizeNow);
      }
    };
  }, [isReady, syncRevision, updateSyncState]);

  useEffect(() => {
    const canSubscribe =
      syncState.status === "synced" ||
      syncState.status === "missing" ||
      syncState.status === "invalid";
    if (!isReady || !canSubscribe) return;

    return subscribeToApplicationTheme(
      (presetId) => {
        setActivePresetId(presetId);
        updateSyncState({
          message: null,
          retryable: false,
          status: "synced",
        });
      },
      (connectionStatus) => {
        if (connectionStatus === "connected") return;
        updateSyncState({
          message:
            "Realtime theme updates disconnected. The active theme remains available while the application reconnects.",
          retryable: true,
          status: "offline",
        });
        retryThemeSync();
      },
    );
  }, [
    isReady,
    retryThemeSync,
    syncState.status,
    updateSyncState,
  ]);

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = activePresetId;
      root.dataset.colorMode = resolvedTheme;
      Object.entries(colors).forEach(([name, value]) => {
        root.style.setProperty(
          `--color-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`,
          value,
        );
      });
      Object.entries(tokens.spacing).forEach(([name, value]) => {
        root.style.setProperty(`--space-${name}`, `${value}px`);
      });
      Object.entries(tokens.radii).forEach(([name, value]) => {
        root.style.setProperty(`--radius-${name}`, `${value}px`);
      });
      root.style.setProperty("--font-sans", tokens.typography.family ?? "system-ui");
      root.style.setProperty("--font-mono", tokens.typography.mono ?? "monospace");
      document.documentElement.style.colorScheme = resolvedTheme;
      document.body.style.backgroundColor = colors.background;
      document.body.style.color = colors.foreground;
      return;
    }

    SystemUI.setBackgroundColorAsync(colors.background).catch(() => undefined);
  }, [activePresetId, colors, resolvedTheme, tokens]);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode).catch(
      (error: unknown) => {
        if (__DEV__) {
          console.warn("[theme] Failed to persist the display mode.", {
            message: error instanceof Error ? error.message : String(error),
          });
        }
      },
    );
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setMode]);

  const savePreset = useCallback(async (presetId: ThemePresetId) => {
    const result = await saveApplicationThemePreset(presetId);
    updateSyncState(result.syncState);
    if (result.error) {
      return result;
    }

    setActivePresetId(presetId);
    return result;
  }, [updateSyncState]);

  const shadows = useMemo(
    () => ({
      surface: surfaceShadow(resolvedTheme, colors.shadow, tokens.shadows),
    }),
    [colors.shadow, resolvedTheme, tokens.shadows],
  );

  const value = useMemo<AppThemeContextValue>(
    () => ({
      activePresetId,
      colors,
      isReady,
      mode,
      resolvedTheme,
      retryThemeSync,
      savePreset,
      setMode,
      shadows,
      syncState,
      tokens,
      toggleTheme,
    }),
    [
      activePresetId,
      colors,
      isReady,
      mode,
      resolvedTheme,
      retryThemeSync,
      savePreset,
      setMode,
      shadows,
      syncState,
      tokens,
      toggleTheme,
    ],
  );
  const navigationTheme = useMemo(
    () => createNavigationTheme(resolvedTheme, colors),
    [colors, resolvedTheme],
  );

  return (
    <AppThemeContext.Provider value={value}>
      <NavigationThemeProvider value={navigationTheme}>
        {children}
      </NavigationThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme(): AppThemeContextValue {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }

  return context;
}

export function useOptionalAppTheme(): AppThemeContextValue | null {
  return useContext(AppThemeContext);
}
