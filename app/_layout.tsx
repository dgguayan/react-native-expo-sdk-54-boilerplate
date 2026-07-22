import "../global.css";

import { Stack, type ErrorBoundaryProps } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import { AppLoadingScreen } from "@/components/feedback/AppLoadingScreen";
import { colorPalettes, radii, spacing } from "@/constants/theme";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { AppThemeProvider, useAppTheme } from "@/providers/ThemeProvider";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";

function RootNavigator() {
  const { loading, session } = useAuth();
  const { resolvedTheme } = useAppTheme();

  if (loading) return <AppLoadingScreen />;

  return (
    <>
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Protected guard={!session}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={Boolean(session)}>
          <Stack.Screen name="(protected)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </AppThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const scheme = useColorScheme() ?? "light";
  const colors = colorPalettes[scheme];
  const responsive = useResponsiveLayout();

  return (
    <SafeAreaView
      accessibilityRole="alert"
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        padding: responsive.isCompact ? spacing.md : spacing.xl,
      }}
    >
      <Text
        style={{ color: colors.foreground, fontSize: responsive.isCompact ? 20 : 22, fontWeight: "700", textAlign: "center" }}
      >
        Something went wrong
      </Text>
      <Text
        style={{
          maxWidth: 460,
          marginTop: spacing.sm,
          color: colors.foregroundMuted,
          fontSize: 14,
          lineHeight: 21,
          textAlign: "center",
        }}
      >
        {error.message || "An unexpected error interrupted this screen."}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={retry}
        style={({ pressed }) => ({
          minHeight: 44,
          marginTop: spacing.lg,
          justifyContent: "center",
          borderRadius: radii.md,
          backgroundColor: colors.primary,
          paddingHorizontal: spacing.lg,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={{ color: colors.primaryForeground, fontSize: 14, fontWeight: "600" }}>
          Try again
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
