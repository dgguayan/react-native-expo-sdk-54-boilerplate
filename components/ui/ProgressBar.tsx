import { View } from "react-native";

import { useAppTheme } from "@/providers/ThemeProvider";

interface ProgressBarProps {
  color?: string;
  value: number;
}

export function ProgressBar({ color, value }: ProgressBarProps) {
  const { colors, tokens } = useAppTheme();
  const normalizedValue = Math.min(100, Math.max(0, value));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: normalizedValue }}
      style={{
        height: 7,
        overflow: "hidden",
        borderRadius: tokens.radii.full,
        backgroundColor: colors.accent,
      }}
    >
      <View
        style={{
          width: `${normalizedValue}%`,
          height: "100%",
          borderRadius: tokens.radii.full,
          backgroundColor: color ?? colors.brand,
        }}
      />
    </View>
  );
}
