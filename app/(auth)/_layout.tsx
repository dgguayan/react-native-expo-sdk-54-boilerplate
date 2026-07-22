import { Stack } from "expo-router";

import { useAppTheme } from "@/providers/ThemeProvider";

export default function AuthLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
