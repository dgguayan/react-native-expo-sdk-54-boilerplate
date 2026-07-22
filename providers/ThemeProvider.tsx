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
  useState,
} from "react";
import { Platform } from "react-native";

import {
  colorPalettes,
  type AppColors,
  type ResolvedTheme,
  type ThemeMode,
} from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const THEME_STORAGE_KEY = "app-theme-preference";

interface AppThemeContextValue {
  colors: AppColors;
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
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

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((storedMode) => {
        if (
          isMounted &&
          (storedMode === "system" ||
            storedMode === "light" ||
            storedMode === "dark")
        ) {
          setModeState(storedMode);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  const resolvedTheme: ResolvedTheme =
    mode === "system" ? systemTheme : mode;
  const colors = colorPalettes[resolvedTheme];

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.documentElement.style.colorScheme = resolvedTheme;
      document.body.style.backgroundColor = colors.background;
      return;
    }

    SystemUI.setBackgroundColorAsync(colors.background).catch(() => undefined);
  }, [colors.background, resolvedTheme]);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode).catch(() => undefined);
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setMode]);

  const value = useMemo<AppThemeContextValue>(
    () => ({ colors, mode, resolvedTheme, setMode, toggleTheme }),
    [colors, mode, resolvedTheme, setMode, toggleTheme],
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
