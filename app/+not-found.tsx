import { Link } from "expo-router";
import { Text, View } from "react-native";

import { Button } from "@/components/Button";
import { spacing } from "@/constants/theme";
import { useAppTheme } from "@/providers/ThemeProvider";

export default function NotFoundScreen() {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        padding: spacing.xl,
      }}
    >
      <Text style={{ color: colors.foregroundSubtle, fontSize: 13, fontWeight: "700" }}>
        404
      </Text>
      <Text
        accessibilityRole="header"
        style={{ marginTop: spacing.sm, color: colors.foreground, fontSize: 26, fontWeight: "700" }}
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
    </View>
  );
}
