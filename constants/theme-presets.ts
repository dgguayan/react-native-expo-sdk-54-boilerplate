import {
  colorPalettes,
  defaultThemeTokens,
  type AppColors,
  type AppThemeTokens,
  type ResolvedTheme,
} from "@/constants/theme";

export interface ThemePreset {
  colors: Record<ResolvedTheme, AppColors>;
  description: string;
  id: string;
  label: string;
  preview: readonly [string, string, string];
  tokens: AppThemeTokens;
}

function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function createPalette(
  base: AppColors,
  overrides: Partial<AppColors>,
): AppColors {
  const merged = { ...base, ...overrides };

  return {
    ...merged,
    sidebar: overrides.sidebar ?? merged.surface,
    sidebarForeground: overrides.sidebarForeground ?? merged.foreground,
    sidebarMuted: overrides.sidebarMuted ?? merged.foregroundMuted,
    sidebarActive: overrides.sidebarActive ?? merged.brandSoft,
    sidebarActiveForeground:
      overrides.sidebarActiveForeground ?? merged.brand,
    sidebarBorder: overrides.sidebarBorder ?? merged.border,
    navbar: overrides.navbar ?? merged.surface,
    navbarForeground: overrides.navbarForeground ?? merged.foreground,
    navbarBorder: overrides.navbarBorder ?? merged.border,
    buttonPrimary: overrides.buttonPrimary ?? merged.brand,
    buttonPrimaryForeground:
      overrides.buttonPrimaryForeground ?? merged.onBrand,
    buttonSecondary: overrides.buttonSecondary ?? merged.surface,
    buttonSecondaryForeground:
      overrides.buttonSecondaryForeground ?? merged.foreground,
    link: overrides.link ?? merged.brand,
    selection: overrides.selection ?? withAlpha(merged.brand, 0.22),
  };
}

const modernColors: ThemePreset["colors"] = {
  light: createPalette(colorPalettes.light, {
    background: "#F6F8FC",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    surfaceMuted: "#EFF4FC",
    foreground: "#0F172A",
    foregroundMuted: "#64748B",
    foregroundSubtle: "#94A3B8",
    border: "#DCE5F1",
    borderStrong: "#C6D3E3",
    input: "#FFFFFF",
    primary: "#172554",
    primaryForeground: "#F8FAFC",
    secondary: "#E0E7FF",
    secondaryForeground: "#1E1B4B",
    accent: "#EFF6FF",
    accentForeground: "#1E3A8A",
    brand: "#2563EB",
    brandSoft: "#DBEAFE",
    info: "#0284C7",
    infoSoft: "#E0F2FE",
    focusRing: "#60A5FA",
    skeleton: "#DCE5F1",
    onBrand: "#FFFFFF",
    onDanger: "#FFFFFF",
    heroDecoration: "rgba(96, 165, 250, 0.18)",
    heroMuted: "rgba(248, 250, 252, 0.72)",
    heroSubtle: "rgba(248, 250, 252, 0.52)",
    shadow: "#0F172A",
  }),
  dark: createPalette(colorPalettes.dark, {
    background: "#080F1F",
    surface: "#0F172A",
    surfaceElevated: "#172033",
    surfaceMuted: "#172554",
    foreground: "#F8FAFC",
    foregroundMuted: "#CBD5E1",
    foregroundSubtle: "#7C8BA1",
    border: "#22304A",
    borderStrong: "#334563",
    input: "#111C30",
    primary: "#DBEAFE",
    primaryForeground: "#0F172A",
    secondary: "#243452",
    secondaryForeground: "#F8FAFC",
    accent: "#172554",
    accentForeground: "#DBEAFE",
    brand: "#60A5FA",
    brandSoft: "#172B4D",
    info: "#38BDF8",
    infoSoft: "#0C314A",
    focusRing: "#93C5FD",
    skeleton: "#22304A",
    onBrand: "#0F172A",
    onDanger: "#1F0A0A",
    heroDecoration: "rgba(37, 99, 235, 0.2)",
    heroMuted: "rgba(15, 23, 42, 0.7)",
    heroSubtle: "rgba(15, 23, 42, 0.52)",
    shadow: "#000000",
  }),
};

const corporateColors: ThemePreset["colors"] = {
  light: createPalette(colorPalettes.light, {
    background: "#F4F7F8",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    surfaceMuted: "#EEF3F4",
    foreground: "#102A3A",
    foregroundMuted: "#526875",
    foregroundSubtle: "#82949E",
    border: "#D6E0E4",
    borderStrong: "#BECBD1",
    input: "#FFFFFF",
    primary: "#123047",
    primaryForeground: "#F8FAFC",
    secondary: "#DCE8E9",
    secondaryForeground: "#173A3B",
    accent: "#E8F3F1",
    accentForeground: "#134E4A",
    brand: "#0F766E",
    brandSoft: "#CCFBF1",
    success: "#15803D",
    successSoft: "#DCFCE7",
    info: "#0369A1",
    infoSoft: "#E0F2FE",
    focusRing: "#2DD4BF",
    skeleton: "#D6E0E4",
    onBrand: "#FFFFFF",
    onDanger: "#FFFFFF",
    heroDecoration: "rgba(45, 212, 191, 0.14)",
    heroMuted: "rgba(248, 250, 252, 0.7)",
    heroSubtle: "rgba(248, 250, 252, 0.5)",
    shadow: "#102A3A",
  }),
  dark: createPalette(colorPalettes.dark, {
    background: "#091216",
    surface: "#0E1B20",
    surfaceElevated: "#14262C",
    surfaceMuted: "#173037",
    foreground: "#F0FDFA",
    foregroundMuted: "#A7C2C4",
    foregroundSubtle: "#66858A",
    border: "#203A41",
    borderStrong: "#31515A",
    input: "#12242A",
    primary: "#CCFBF1",
    primaryForeground: "#102A2C",
    secondary: "#26454C",
    secondaryForeground: "#F0FDFA",
    accent: "#153A38",
    accentForeground: "#CCFBF1",
    brand: "#5EEAD4",
    brandSoft: "#123B37",
    success: "#4ADE80",
    successSoft: "#123522",
    info: "#38BDF8",
    infoSoft: "#0C3142",
    focusRing: "#99F6E4",
    skeleton: "#203A41",
    onBrand: "#102A2C",
    onDanger: "#240A0A",
    heroDecoration: "rgba(15, 118, 110, 0.2)",
    heroMuted: "rgba(16, 42, 44, 0.7)",
    heroSubtle: "rgba(16, 42, 44, 0.52)",
    shadow: "#000000",
  }),
};

const minimalColors: ThemePreset["colors"] = {
  light: createPalette(colorPalettes.light, {
    background: "#FAFAFA",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    surfaceMuted: "#F5F5F5",
    foreground: "#171717",
    foregroundMuted: "#737373",
    foregroundSubtle: "#A3A3A3",
    border: "#E5E5E5",
    borderStrong: "#D4D4D4",
    input: "#FFFFFF",
    primary: "#171717",
    primaryForeground: "#FAFAFA",
    secondary: "#E5E5E5",
    secondaryForeground: "#262626",
    accent: "#F5F5F5",
    accentForeground: "#262626",
    brand: "#171717",
    brandSoft: "#E5E5E5",
    focusRing: "#737373",
    skeleton: "#E5E5E5",
    onBrand: "#FAFAFA",
    onDanger: "#FFFFFF",
    heroDecoration: "rgba(255, 255, 255, 0.08)",
    heroMuted: "rgba(250, 250, 250, 0.68)",
    heroSubtle: "rgba(250, 250, 250, 0.5)",
    shadow: "#171717",
  }),
  dark: createPalette(colorPalettes.dark, {
    background: "#0A0A0A",
    surface: "#111111",
    surfaceElevated: "#191919",
    surfaceMuted: "#1F1F1F",
    foreground: "#FAFAFA",
    foregroundMuted: "#A3A3A3",
    foregroundSubtle: "#737373",
    border: "#292929",
    borderStrong: "#404040",
    input: "#171717",
    primary: "#FAFAFA",
    primaryForeground: "#171717",
    secondary: "#333333",
    secondaryForeground: "#FAFAFA",
    accent: "#262626",
    accentForeground: "#FAFAFA",
    brand: "#FAFAFA",
    brandSoft: "#292929",
    focusRing: "#A3A3A3",
    skeleton: "#292929",
    onBrand: "#171717",
    onDanger: "#171717",
    heroDecoration: "rgba(255, 255, 255, 0.12)",
    heroMuted: "rgba(23, 23, 23, 0.68)",
    heroSubtle: "rgba(23, 23, 23, 0.5)",
    shadow: "#000000",
  }),
};

export const themePresets = {
  default: {
    id: "default",
    label: "Default",
    description: "Balanced neutral surfaces with a focused indigo accent.",
    preview: ["#4F46E5", "#18181B", "#F7F7F8"],
    colors: colorPalettes,
    tokens: defaultThemeTokens,
  },
  modern: {
    id: "modern",
    label: "Modern",
    description: "Crisp blue accents, airy surfaces, and generous rounding.",
    preview: ["#2563EB", "#172554", "#F6F8FC"],
    colors: modernColors,
    tokens: {
      ...defaultThemeTokens,
      radii: {
        sm: 10,
        md: 12,
        lg: 16,
        xl: 22,
        full: 999,
      },
      shadows: {
        ...defaultThemeTokens.shadows,
        elevation: 4,
        offsetY: 5,
        radius: 18,
      },
    },
  },
  corporate: {
    id: "corporate",
    label: "Corporate",
    description: "Structured navy and teal styling for operational clarity.",
    preview: ["#0F766E", "#123047", "#F4F7F8"],
    colors: corporateColors,
    tokens: {
      ...defaultThemeTokens,
      radii: {
        sm: 6,
        md: 8,
        lg: 12,
        xl: 16,
        full: 999,
      },
      shadows: {
        ...defaultThemeTokens.shadows,
        elevation: 2,
        offsetY: 3,
        radius: 10,
      },
    },
  },
  minimal: {
    id: "minimal",
    label: "Minimal",
    description: "Quiet monochrome contrast with restrained shape and depth.",
    preview: ["#171717", "#737373", "#FAFAFA"],
    colors: minimalColors,
    tokens: {
      ...defaultThemeTokens,
      radii: {
        sm: 4,
        md: 6,
        lg: 10,
        xl: 12,
        full: 999,
      },
      shadows: {
        ...defaultThemeTokens.shadows,
        elevation: 1,
        offsetY: 2,
        opacityDark: 0.18,
        opacityLight: 0.04,
        radius: 8,
      },
    },
  },
} as const satisfies Record<string, ThemePreset>;

export type ThemePresetId = keyof typeof themePresets;

export const DEFAULT_THEME_PRESET_ID: ThemePresetId = "default";

export const themePresetList = Object.values(themePresets);

export function isThemePresetId(value: unknown): value is ThemePresetId {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(themePresets, value)
  );
}
