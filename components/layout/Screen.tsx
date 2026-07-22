import type { PropsWithChildren, ReactNode } from "react";
import {
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";

import { layout, spacing } from "@/constants/theme";
import { useAppTheme } from "@/providers/ThemeProvider";

interface ScreenProps {
  action?: ReactNode;
  contentStyle?: ViewStyle;
  description?: string;
  title: string;
}

export function Screen({
  action,
  children,
  contentStyle,
  description,
  title,
}: PropsWithChildren<ScreenProps>) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const horizontalPadding = width < layout.mobileBreakpoint ? spacing.md : spacing.xl;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        maxWidth: layout.contentMaxWidth,
        alignSelf: "center",
        paddingHorizontal: horizontalPadding,
        paddingTop: width < layout.mobileBreakpoint ? spacing.xl : spacing["2xl"],
        paddingBottom: spacing["4xl"],
        ...contentStyle,
      }}
    >
      <View
        style={{
          flexDirection: width < 560 ? "column" : "row",
          alignItems: width < 560 ? "stretch" : "flex-start",
          justifyContent: "space-between",
          gap: spacing.md,
          marginBottom: spacing.xl,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            accessibilityRole="header"
            style={{
              color: colors.foreground,
              fontSize: width < layout.mobileBreakpoint ? 25 : 29,
              fontWeight: "700",
              letterSpacing: -0.6,
              lineHeight: 36,
            }}
          >
            {title}
          </Text>
          {description ? (
            <Text
              style={{
                marginTop: spacing.xs,
                maxWidth: 680,
                color: colors.foregroundMuted,
                fontSize: 14,
                lineHeight: 21,
              }}
            >
              {description}
            </Text>
          ) : null}
        </View>
        {action}
      </View>
      {children}
    </ScrollView>
  );
}
