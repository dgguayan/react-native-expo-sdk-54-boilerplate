import type { PropsWithChildren } from "react";
import { type StyleProp, View, type ViewProps, type ViewStyle } from "react-native";

import { radii, surfaceShadow } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
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
  const responsive = useResponsiveLayout();

  return (
    <View
      style={[
        {
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          padding: padded ? responsive.cardPadding : 0,
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
