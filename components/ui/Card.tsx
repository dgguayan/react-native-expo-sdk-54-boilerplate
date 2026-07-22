import type { PropsWithChildren } from "react";
import { type StyleProp, View, type ViewProps, type ViewStyle } from "react-native";

import { radii, spacing, surfaceShadow } from "@/constants/theme";
import { useAppTheme } from "@/providers/ThemeProvider";

interface CardProps extends ViewProps {
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Card({
  children,
  padded = true,
  style,
  ...viewProps
}: PropsWithChildren<CardProps>) {
  const { colors, resolvedTheme } = useAppTheme();

  return (
    <View
      style={[
        {
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          padding: padded ? spacing.lg : 0,
        },
        surfaceShadow(resolvedTheme),
        style,
      ]}
      {...viewProps}
    >
      {children}
    </View>
  );
}
