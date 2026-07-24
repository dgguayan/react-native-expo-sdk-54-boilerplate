import { Text, View } from "react-native";

import { useAppTheme } from "@/providers/ThemeProvider";

type BadgeTone =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info";

export function Badge({ label, tone = "neutral" }: { label: string; tone?: BadgeTone }) {
  const { colors, tokens } = useAppTheme();
  const palette = {
    neutral: { background: colors.accent, foreground: colors.foregroundMuted },
    brand: { background: colors.brandSoft, foreground: colors.brand },
    success: { background: colors.successSoft, foreground: colors.success },
    warning: { background: colors.warningSoft, foreground: colors.warning },
    danger: { background: colors.dangerSoft, foreground: colors.danger },
    info: { background: colors.infoSoft, foreground: colors.info },
  }[tone];

  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: tokens.radii.full,
        backgroundColor: palette.background,
        paddingHorizontal: 9,
        paddingVertical: 4,
      }}
    >
      <Text
        style={{
          color: palette.foreground,
          fontSize: 12,
          fontWeight: "600",
          lineHeight: 16,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
