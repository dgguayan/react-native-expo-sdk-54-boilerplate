import { Platform, type TextStyle, type ViewStyle } from "react-native";

export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = Exclude<ThemeMode, "system">;

const lightColors = {
  background: "#F7F7F8",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  surfaceMuted: "#F4F4F5",
  foreground: "#18181B",
  foregroundMuted: "#71717A",
  foregroundSubtle: "#A1A1AA",
  border: "#E4E4E7",
  borderStrong: "#D4D4D8",
  input: "#FFFFFF",
  primary: "#18181B",
  primaryForeground: "#FAFAFA",
  accent: "#F4F4F5",
  accentForeground: "#27272A",
  brand: "#4F46E5",
  brandSoft: "#EEF2FF",
  success: "#15803D",
  successSoft: "#F0FDF4",
  warning: "#B45309",
  warningSoft: "#FFFBEB",
  danger: "#DC2626",
  dangerSoft: "#FEF2F2",
  focusRing: "#818CF8",
  overlay: "rgba(9, 9, 11, 0.45)",
  skeleton: "#E4E4E7",
} as const;

const darkColors: AppColors = {
  background: "#09090B",
  surface: "#111113",
  surfaceElevated: "#18181B",
  surfaceMuted: "#202023",
  foreground: "#FAFAFA",
  foregroundMuted: "#A1A1AA",
  foregroundSubtle: "#71717A",
  border: "#27272A",
  borderStrong: "#3F3F46",
  input: "#18181B",
  primary: "#FAFAFA",
  primaryForeground: "#18181B",
  accent: "#27272A",
  accentForeground: "#FAFAFA",
  brand: "#818CF8",
  brandSoft: "#25244A",
  success: "#4ADE80",
  successSoft: "#102A1B",
  warning: "#FBBF24",
  warningSoft: "#2A2110",
  danger: "#F87171",
  dangerSoft: "#321515",
  focusRing: "#A5B4FC",
  overlay: "rgba(0, 0, 0, 0.7)",
  skeleton: "#27272A",
};

export type AppColors = {
  [Key in keyof typeof lightColors]: string;
};

export const colorPalettes: Record<ResolvedTheme, AppColors> = {
  light: lightColors,
  dark: darkColors,
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
} as const;

export const radii = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 18,
  full: 999,
} as const;

export const layout = {
  compactBreakpoint: 380,
  phoneBreakpoint: 600,
  mobileBreakpoint: 768,
  desktopBreakpoint: 1180,
  sidebarExpanded: 272,
  sidebarCollapsed: 80,
  drawerMaxWidth: 304,
  contentMaxWidth: 1440,
  headerHeight: 64,
} as const;

export const typography = {
  family: Platform.select({
    web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    default: "System",
  }),
  mono: Platform.select({
    web: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    ios: "Menlo",
    default: "monospace",
  }),
} satisfies Record<string, TextStyle["fontFamily"]>;

export function surfaceShadow(theme: ResolvedTheme): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme === "dark" ? 0.25 : 0.07,
      shadowRadius: 14,
    },
    android: { elevation: theme === "dark" ? 2 : 3 },
    web: {
      boxShadow:
        theme === "dark"
          ? "0 10px 30px rgba(0, 0, 0, 0.2)"
          : "0 10px 30px rgba(24, 24, 27, 0.06)",
    },
    default: {},
  })!;
}

// Kept as a small compatibility surface for Expo-style components.
export const Colors = {
  light: {
    text: lightColors.foreground,
    background: lightColors.background,
    tint: lightColors.brand,
    icon: lightColors.foregroundMuted,
    tabIconDefault: lightColors.foregroundSubtle,
    tabIconSelected: lightColors.brand,
  },
  dark: {
    text: darkColors.foreground,
    background: darkColors.background,
    tint: darkColors.brand,
    icon: darkColors.foregroundMuted,
    tabIconDefault: darkColors.foregroundSubtle,
    tabIconSelected: darkColors.brand,
  },
};

export const Fonts = {
  sans: typography.family,
  serif: Platform.select({ web: "Georgia, serif", default: "serif" }),
  rounded: typography.family,
  mono: typography.mono,
};
