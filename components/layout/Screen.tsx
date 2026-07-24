import type { PropsWithChildren, ReactNode } from "react";
import {
  ScrollView,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { layout } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
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
  const { colors, tokens } = useAppTheme();
  const { spacing } = tokens;
  const insets = useSafeAreaInsets();
  const responsive = useResponsiveLayout();
  const stackHeader = responsive.frameWidth < 520;

  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      contentInsetAdjustmentBehavior="never"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        width: "100%",
        maxWidth: layout.contentMaxWidth,
        alignSelf: "center",
        paddingHorizontal: responsive.pageHorizontalPadding,
        paddingTop: responsive.pageTopPadding,
        paddingBottom: Math.max(
          responsive.pageBottomPadding,
          insets.bottom + spacing.sm,
        ),
        ...contentStyle,
      }}
    >
      <View
        style={{
          flexDirection: stackHeader ? "column" : "row",
          alignItems: stackHeader ? "stretch" : "flex-start",
          justifyContent: "space-between",
          gap: responsive.isCompact ? spacing.sm : spacing.md,
          marginBottom: responsive.isCompact
            ? spacing.md
            : responsive.isMobile
              ? spacing.lg
              : spacing.xl,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            accessibilityRole="header"
            style={{
              color: colors.foreground,
              fontSize: responsive.titleFontSize,
              fontWeight: "700",
              letterSpacing: -0.6,
              lineHeight: responsive.titleLineHeight,
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
