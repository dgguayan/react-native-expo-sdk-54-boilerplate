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
  secondary: "#E4E4E7",
  secondaryForeground: "#27272A",
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
  info: "#0369A1",
  infoSoft: "#F0F9FF",
  focusRing: "#818CF8",
  overlay: "rgba(9, 9, 11, 0.45)",
  skeleton: "#E4E4E7",
  sidebar: "#FFFFFF",
  sidebarForeground: "#18181B",
  sidebarMuted: "#71717A",
  sidebarActive: "#EEF2FF",
  sidebarActiveForeground: "#4F46E5",
  sidebarBorder: "#E4E4E7",
  navbar: "#FFFFFF",
  navbarForeground: "#18181B",
  navbarBorder: "#E4E4E7",
  buttonPrimary: "#4F46E5",
  buttonPrimaryForeground: "#FFFFFF",
  buttonSecondary: "#FFFFFF",
  buttonSecondaryForeground: "#18181B",
  link: "#4F46E5",
  onBrand: "#FFFFFF",
  onDanger: "#FFFFFF",
  controlThumb: "#FFFFFF",
  heroDecoration: "rgba(255, 255, 255, 0.08)",
  heroMuted: "rgba(250, 250, 250, 0.68)",
  heroSubtle: "rgba(250, 250, 250, 0.5)",
  selection: "rgba(79, 70, 229, 0.2)",
  shadow: "#18181B",
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
  secondary: "#3F3F46",
  secondaryForeground: "#FAFAFA",
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
  info: "#38BDF8",
  infoSoft: "#082F49",
  focusRing: "#A5B4FC",
  overlay: "rgba(0, 0, 0, 0.7)",
  skeleton: "#27272A",
  sidebar: "#111113",
  sidebarForeground: "#FAFAFA",
  sidebarMuted: "#A1A1AA",
  sidebarActive: "#25244A",
  sidebarActiveForeground: "#A5B4FC",
  sidebarBorder: "#27272A",
  navbar: "#111113",
  navbarForeground: "#FAFAFA",
  navbarBorder: "#27272A",
  buttonPrimary: "#818CF8",
  buttonPrimaryForeground: "#18181B",
  buttonSecondary: "#18181B",
  buttonSecondaryForeground: "#FAFAFA",
  link: "#A5B4FC",
  onBrand: "#18181B",
  onDanger: "#18181B",
  controlThumb: "#FFFFFF",
  heroDecoration: "rgba(129, 140, 248, 0.16)",
  heroMuted: "rgba(24, 24, 27, 0.65)",
  heroSubtle: "rgba(24, 24, 27, 0.5)",
  selection: "rgba(129, 140, 248, 0.28)",
  shadow: "#000000",
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

export type AppSpacing = {
  [Key in keyof typeof spacing]: number;
};

export const radii = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 18,
  full: 999,
} as const;

export type AppRadii = {
  [Key in keyof typeof radii]: number;
};

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

export interface AppBorderTokens {
  strong: number;
  thin: number;
}

export interface AppShadowTokens {
  elevation: number;
  offsetY: number;
  opacityDark: number;
  opacityLight: number;
  radius: number;
}

export interface AppThemeTokens {
  borders: AppBorderTokens;
  radii: AppRadii;
  shadows: AppShadowTokens;
  spacing: AppSpacing;
  typography: typeof typography;
}

export const defaultThemeTokens: AppThemeTokens = {
  borders: {
    thin: 1,
    strong: 2,
  },
  radii,
  shadows: {
    elevation: 3,
    offsetY: 4,
    opacityDark: 0.25,
    opacityLight: 0.07,
    radius: 14,
  },
  spacing,
  typography,
};

export function surfaceShadow(
  theme: ResolvedTheme,
  color = colorPalettes[theme].shadow,
  tokens = defaultThemeTokens.shadows,
): ViewStyle {
  const opacity =
    theme === "dark" ? tokens.opacityDark : tokens.opacityLight;

  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: tokens.offsetY },
      shadowOpacity: opacity,
      shadowRadius: tokens.radius,
    },
    android: { elevation: Math.max(1, tokens.elevation - (theme === "dark" ? 1 : 0)) },
    web: {
      boxShadow: `0 ${tokens.offsetY + 6}px ${tokens.radius * 2}px ${color}${Math.round(
        opacity * 255,
      )
        .toString(16)
        .padStart(2, "0")}`,
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
