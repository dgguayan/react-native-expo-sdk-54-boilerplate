import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { Text, View } from "react-native";

import { radii, spacing } from "@/constants/theme";
import { useAppTheme } from "@/providers/ThemeProvider";

interface StateViewProps {
  action?: ReactNode;
  description: string;
  icon?: ComponentProps<typeof Ionicons>["name"];
  title: string;
  tone?: "neutral" | "danger";
}

export function StateView({
  action,
  description,
  icon = "file-tray-outline",
  title,
  tone = "neutral",
}: StateViewProps) {
  const { colors } = useAppTheme();
  const isDanger = tone === "danger";

  return (
    <View
      accessibilityRole={isDanger ? "alert" : undefined}
      style={{
        alignItems: "center",
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: isDanger ? colors.danger : colors.borderStrong,
        borderRadius: radii.lg,
        backgroundColor: isDanger ? colors.dangerSoft : colors.surface,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing["3xl"],
      }}
    >
      <View
        style={{
          width: 46,
          height: 46,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: radii.full,
          backgroundColor: isDanger ? colors.dangerSoft : colors.accent,
        }}
      >
        <Ionicons
          name={icon}
          size={22}
          color={isDanger ? colors.danger : colors.foregroundMuted}
        />
      </View>
      <Text
        style={{
          marginTop: spacing.md,
          color: colors.foreground,
          fontSize: 16,
          fontWeight: "600",
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          maxWidth: 420,
          marginTop: spacing.xs,
          color: colors.foregroundMuted,
          fontSize: 14,
          lineHeight: 20,
          textAlign: "center",
        }}
      >
        {description}
      </Text>
      {action ? <View style={{ marginTop: spacing.lg }}>{action}</View> : null}
    </View>
  );
}
