import { Link } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAppTheme } from "@/providers/ThemeProvider";

export default function NotFoundScreen() {
  const { colors } = useAppTheme();
  const responsive = useResponsiveLayout();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        padding: responsive.isCompact ? spacing.md : spacing.xl,
      }}
    >
      <Text style={{ color: colors.foregroundSubtle, fontSize: 13, fontWeight: "700" }}>
        404
      </Text>
      <Text
        accessibilityRole="header"
        style={{ marginTop: spacing.sm, color: colors.foreground, fontSize: responsive.isCompact ? 23 : 26, fontWeight: "700", textAlign: "center" }}
      >
        Page not found
      </Text>
      <Text
        style={{
          maxWidth: 440,
          marginTop: spacing.xs,
          color: colors.foregroundMuted,
          fontSize: 14,
          lineHeight: 21,
          textAlign: "center",
        }}
      >
        The page may have moved, or the link is no longer available.
      </Text>
      <Link href="/" asChild>
        <Button title="Return home" style={{ marginTop: spacing.lg }} />
      </Link>
    </SafeAreaView>
  );
}
