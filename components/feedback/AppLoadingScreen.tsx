import { useEffect, useRef } from "react";
import { Animated, View, type DimensionValue } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppLogo } from "@/components/AppLogo";
import { radii, spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAppTheme } from "@/providers/ThemeProvider";

export function AppLoadingScreen() {
  const { colors } = useAppTheme();
  const responsive = useResponsiveLayout();
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 520,
          alignSelf: "center",
          justifyContent: "center",
          padding: responsive.isCompact ? spacing.md : spacing.xl,
        }}
      >
        <View
          style={{
            alignItems: "center",
            marginBottom: responsive.isCompact ? spacing.xl : spacing["2xl"],
          }}
        >
          <AppLogo />
        </View>
        <Animated.View style={{ gap: spacing.sm, opacity }}>
          {(["68%", "100%", "86%"] satisfies DimensionValue[]).map((width, index) => (
            <View
              key={width}
              style={{
                width,
                height: index === 0 ? 18 : 12,
                alignSelf: index === 0 ? "center" : "flex-start",
                borderRadius: radii.full,
                backgroundColor: colors.skeleton,
              }}
            />
          ))}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
