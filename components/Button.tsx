import { Ionicons } from "@expo/vector-icons";
import { useState, type ComponentProps } from "react";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  Text,
  type ViewStyle,
} from "react-native";

import { radii, spacing } from "@/constants/theme";
import { useAppTheme } from "@/providers/ThemeProvider";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  fullWidth?: boolean;
  icon?: ComponentProps<typeof Ionicons>["name"];
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  title: string;
  variant?: ButtonVariant;
}

export function Button({
  disabled,
  fullWidth = false,
  icon,
  loading = false,
  style,
  title,
  variant = "primary",
  ...pressableProps
}: ButtonProps) {
  const { colors } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isDisabled = disabled || loading;

  const palette = {
    primary: {
      background: colors.primary,
      border: colors.primary,
      foreground: colors.primaryForeground,
    },
    secondary: {
      background: hovered ? colors.accent : colors.surface,
      border: colors.borderStrong,
      foreground: colors.foreground,
    },
    ghost: {
      background: hovered ? colors.accent : "transparent",
      border: "transparent",
      foreground: colors.foregroundMuted,
    },
    danger: {
      background: colors.danger,
      border: colors.danger,
      foreground: "#FFFFFF",
    },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        {
          minHeight: 44,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: spacing.xs,
          paddingHorizontal: spacing.md,
          paddingVertical: 10,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: focused ? colors.focusRing : palette.border,
          backgroundColor: palette.background,
          opacity: isDisabled ? 0.55 : pressed ? 0.82 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
          ...(fullWidth ? { width: "100%" } : null),
        },
        style,
      ]}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={palette.foreground} size="small" />
      ) : (
        <>
          {icon ? (
            <Ionicons name={icon} size={18} color={palette.foreground} />
          ) : null}
          <Text
            style={{
              color: palette.foreground,
              fontSize: 14,
              fontWeight: "600",
              lineHeight: 20,
            }}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}
