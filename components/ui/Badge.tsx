import { Text, View } from "react-native";

import { radii } from "@/constants/theme";
import { useAppTheme } from "@/providers/ThemeProvider";

type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger";

export function Badge({ label, tone = "neutral" }: { label: string; tone?: BadgeTone }) {
  const { colors } = useAppTheme();
  const palette = {
    neutral: { background: colors.accent, foreground: colors.foregroundMuted },
    brand: { background: colors.brandSoft, foreground: colors.brand },
    success: { background: colors.successSoft, foreground: colors.success },
    warning: { background: colors.warningSoft, foreground: colors.warning },
    danger: { background: colors.dangerSoft, foreground: colors.danger },
  }[tone];

  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: radii.full,
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
