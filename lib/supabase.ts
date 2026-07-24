import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

function requirePublicEnvironmentValue(
  name: string,
  value: string | undefined,
): string {
  const normalizedValue = value?.trim();
  if (!normalizedValue) {
    throw new Error(
      `${name} is required. Add it to .env.local and restart Expo.`,
    );
  }
  return normalizedValue;
}

function validateSupabaseUrl(value: string): string {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("Unsupported protocol");
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new Error(
      "EXPO_PUBLIC_SUPABASE_URL must be a valid HTTP(S) Supabase project URL.",
    );
  }
}

const supabaseUrl = validateSupabaseUrl(
  requirePublicEnvironmentValue(
    "EXPO_PUBLIC_SUPABASE_URL",
    process.env.EXPO_PUBLIC_SUPABASE_URL,
  ),
);
const supabaseAnonKey = requirePublicEnvironmentValue(
  "EXPO_PUBLIC_SUPABASE_ANON_KEY",
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
);
const isWebServer = Platform.OS === "web" && typeof window === "undefined";

type SupabaseStorage = {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
  isServer?: boolean;
};

const serverStorage: SupabaseStorage = {
  isServer: true,
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

const storage: SupabaseStorage = isWebServer ? serverStorage : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: !isWebServer,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
