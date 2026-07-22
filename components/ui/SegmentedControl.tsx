import { Pressable, Text, View } from "react-native";

import { radii, spacing } from "@/constants/theme";
import { useAppTheme } from "@/providers/ThemeProvider";

export interface SegmentOption<Value extends string> {
  label: string;
  value: Value;
}

interface SegmentedControlProps<Value extends string> {
  accessibilityLabel: string;
  onChange: (value: Value) => void;
  options: readonly SegmentOption<Value>[];
  value: Value;
}

export function SegmentedControl<Value extends string>({
  accessibilityLabel,
  onChange,
  options,
  value,
}: SegmentedControlProps<Value>) {
  const { colors } = useAppTheme();

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="tablist"
      style={{
        alignSelf: "flex-start",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.xxs,
        borderRadius: radii.md,
        backgroundColor: colors.surfaceMuted,
        padding: spacing.xxs,
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => ({
              minHeight: 36,
              justifyContent: "center",
              borderWidth: 1,
              borderColor: selected ? colors.border : "transparent",
              borderRadius: radii.sm,
              backgroundColor: selected ? colors.surface : "transparent",
              paddingHorizontal: spacing.md,
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <Text
              style={{
                color: selected ? colors.foreground : colors.foregroundMuted,
                fontSize: 13,
                fontWeight: selected ? "600" : "500",
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
