import type { PropsWithChildren } from "react";
import { type StyleProp, View, type ViewProps, type ViewStyle } from "react-native";

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
  const { colors, shadows, tokens } = useAppTheme();
  const responsive = useResponsiveLayout();

  return (
    <View
      style={[
        {
          borderRadius: tokens.radii.lg,
          borderWidth: tokens.borders.thin,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          padding: padded ? responsive.cardPadding : 0,
        },
        shadows.surface,
        style,
      ]}
      {...viewProps}
    >
      {children}
    </View>
  );
}
