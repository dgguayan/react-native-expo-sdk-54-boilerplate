import { Ionicons } from "@expo/vector-icons";
import { useState, type ComponentProps } from "react";
import { Pressable, type PressableProps } from "react-native";

import { radii } from "@/constants/theme";
import { useAppTheme } from "@/providers/ThemeProvider";

interface IconButtonProps extends Omit<PressableProps, "children"> {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  selected?: boolean;
  size?: number;
}

export function IconButton({
  icon,
  label,
  selected = false,
  size = 20,
  ...pressableProps
}: IconButtonProps) {
  const { colors } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={6}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: focused ? colors.focusRing : "transparent",
        backgroundColor:
          selected || hovered || pressed ? colors.accent : "transparent",
        opacity: pressableProps.disabled ? 0.45 : pressed ? 0.7 : 1,
      })}
      {...pressableProps}
    >
      <Ionicons
        name={icon}
        size={size}
        color={selected ? colors.foreground : colors.foregroundMuted}
      />
    </Pressable>
  );
}
