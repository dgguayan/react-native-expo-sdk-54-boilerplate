import type { PropsWithChildren, ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppLogo } from "@/components/AppLogo";
import { IconButton } from "@/components/ui/IconButton";
import { Card } from "@/components/ui/Card";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAppTheme } from "@/providers/ThemeProvider";

interface AuthScaffoldProps {
  footer?: ReactNode;
  subtitle: string;
  title: string;
}

export function AuthScaffold({
  children,
  footer,
  subtitle,
  title,
}: PropsWithChildren<AuthScaffoldProps>) {
  const { colors, resolvedTheme, toggleTheme, tokens } = useAppTheme();
  const { radii, spacing } = tokens;
  const responsive = useResponsiveLayout();
  const showBrandPanel = responsive.width >= 960;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, flexDirection: "row" }}>
          {showBrandPanel ? (
            <View
              style={{
                width: "42%",
                overflow: "hidden",
                justifyContent: "space-between",
                backgroundColor: colors.primary,
                padding: spacing["3xl"],
              }}
            >
              <View
                style={{
                  position: "absolute",
                  right: -130,
                  top: -90,
                  width: 360,
                  height: 360,
                  borderWidth: 80,
                  borderColor: colors.heroDecoration,
                  borderRadius: 180,
                }}
              />
              <AppLogo inverse />
              <View style={{ maxWidth: 440 }}>
                <Text
                  style={{
                    color: colors.primaryForeground,
                    fontSize: 34,
                    fontWeight: "700",
                    letterSpacing: -1.1,
                    lineHeight: 42,
                  }}
                >
                  Bring projects, people, and progress into focus.
                </Text>
                <Text
                  style={{
                    marginTop: spacing.md,
                    color: colors.heroMuted,
                    fontSize: 15,
                    lineHeight: 23,
                  }}
                >
                  A focused workspace for planning meaningful work and keeping every team aligned.
                </Text>
              </View>
              <Text
                style={{
                  color: colors.heroSubtle,
                  fontSize: 12,
                }}
              >
                Secure authentication powered by Supabase
              </Text>
            </View>
          ) : null}

          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: responsive.isCompact ? spacing.sm : spacing.md,
              paddingVertical: responsive.isCompact
                ? spacing.sm
                : responsive.isMobile
                  ? spacing.xl
                  : spacing["4xl"],
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            <View style={{ width: "100%", maxWidth: 430 }}>
              {!showBrandPanel ? (
                <View
                  style={{
                    alignItems: "center",
                    marginBottom: responsive.isCompact ? spacing.md : spacing.xl,
                  }}
                >
                  <AppLogo />
                </View>
              ) : null}
              <Card
                style={{
                  borderRadius: responsive.isMobile ? radii.lg : radii.xl,
                  padding: responsive.isMobile
                    ? responsive.cardPadding
                    : spacing["2xl"],
                }}
              >
                <Text
                  accessibilityRole="header"
                  style={{
                    color: colors.foreground,
                    fontSize: responsive.isCompact ? 23 : 25,
                    fontWeight: "700",
                    letterSpacing: -0.5,
                    lineHeight: responsive.isCompact ? 29 : 32,
                  }}
                >
                  {title}
                </Text>
                <Text
                  style={{
                    marginTop: spacing.xs,
                    color: colors.foregroundMuted,
                    fontSize: 14,
                    lineHeight: 21,
                  }}
                >
                  {subtitle}
                </Text>
                <View
                  style={{
                    gap: responsive.isCompact ? spacing.sm : spacing.md,
                    marginTop: responsive.isCompact ? spacing.md : spacing.xl,
                  }}
                >
                  {children}
                </View>
                {footer ? (
                  <View
                    style={{
                      marginTop: responsive.isCompact ? spacing.lg : spacing.xl,
                    }}
                  >
                    {footer}
                  </View>
                ) : null}
              </Card>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      <View style={{ position: "absolute", right: spacing.md, top: spacing.md, zIndex: 2 }}>
        <IconButton
          icon={resolvedTheme === "dark" ? "sunny-outline" : "moon-outline"}
          label={
            resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"
          }
          onPress={toggleTheme}
        />
      </View>
    </SafeAreaView>
  );
}
