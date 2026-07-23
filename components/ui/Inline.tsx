import { Ionicons } from "@expo/vector-icons";
import type { PropsWithChildren, ComponentProps } from "react";
import {
  StyleSheet,
  Text,
  type TextProps,
  type TextStyle,
  View,
  type ViewProps,
  type ViewStyle,
  type StyleProp,
} from "react-native";

import { spacing } from "@/constants/theme";

export const inlineStyles = StyleSheet.create({
  content: {
    minWidth: 0,
    flexShrink: 1,
  },
  fill: {
    minWidth: 0,
    flex: 1,
  },
  icon: {
    flexGrow: 0,
    flexShrink: 0,
  },
  label: {
    minWidth: 0,
    flexShrink: 1,
  },
  row: {
    minWidth: 0,
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
  },
});

interface InlineProps extends ViewProps {
  gap?: number;
  style?: StyleProp<ViewStyle>;
}

export function Inline({
  children,
  gap = spacing.xs,
  style,
  ...viewProps
}: PropsWithChildren<InlineProps>) {
  return (
    <View style={[inlineStyles.row, { gap }, style]} {...viewProps}>
      {children}
    </View>
  );
}

interface InlineIconProps {
  color: string;
  name: ComponentProps<typeof Ionicons>["name"];
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function InlineIcon({
  color,
  name,
  size = 18,
  style,
}: InlineIconProps) {
  return (
    <View accessible={false} style={[inlineStyles.icon, style]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

interface InlineIconLabelProps {
  color: string;
  containerStyle?: StyleProp<ViewStyle>;
  fill?: boolean;
  gap?: number;
  icon: ComponentProps<typeof Ionicons>["name"];
  iconSize?: number;
  label: string;
  labelStyle?: StyleProp<TextStyle>;
  numberOfLines?: TextProps["numberOfLines"];
}

export function InlineIconLabel({
  color,
  containerStyle,
  fill = false,
  gap = spacing.xs,
  icon,
  iconSize = 18,
  label,
  labelStyle,
  numberOfLines = 1,
}: InlineIconLabelProps) {
  return (
    <Inline
      gap={gap}
      style={[fill ? inlineStyles.fill : undefined, containerStyle]}
    >
      <InlineIcon color={color} name={icon} size={iconSize} />
      <Text
        ellipsizeMode="tail"
        numberOfLines={numberOfLines}
        style={[
          inlineStyles.label,
          fill ? inlineStyles.fill : undefined,
          { color },
          labelStyle,
        ]}
      >
        {label}
      </Text>
    </Inline>
  );
}
