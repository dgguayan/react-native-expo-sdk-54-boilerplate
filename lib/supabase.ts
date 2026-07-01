import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
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
