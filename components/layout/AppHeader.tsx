import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconButton } from "@/components/ui/IconButton";
import { layout, spacing } from "@/constants/theme";
import { useAppShell } from "@/context/AppShellContext";
import { useAuth } from "@/providers/AuthProvider";
import { useAppTheme } from "@/providers/ThemeProvider";

interface AppHeaderProps {
  onMenuPress: () => void;
  title: string;
}

function getInitial(email?: string): string {
  return email?.trim().charAt(0).toUpperCase() || "U";
}

export function AppHeader({ onMenuPress, title }: AppHeaderProps) {
  const { colors, resolvedTheme, toggleTheme } = useAppTheme();
  const { desktopCollapsed, isDesktop } = useAppShell();
  const { user } = useAuth();

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ backgroundColor: colors.surface }}
    >
      <View
        accessibilityRole="toolbar"
        style={{
          minHeight: layout.headerHeight,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingHorizontal: isDesktop ? spacing.xl : spacing.md,
        }}
      >
        <View
          style={{
            minWidth: 0,
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <IconButton
            icon={
              isDesktop
                ? desktopCollapsed
                  ? "chevron-forward-outline"
                  : "chevron-back-outline"
                : "menu-outline"
            }
            label={isDesktop ? "Collapse or expand sidebar" : "Open navigation menu"}
            onPress={onMenuPress}
          />
          {isDesktop ? (
            <>
              <Text style={{ color: colors.foregroundMuted, fontSize: 13 }}>
                Workspace
              </Text>
              <Text style={{ color: colors.foregroundSubtle, fontSize: 13 }}>
                /
              </Text>
            </>
          ) : null}
          <Text
            numberOfLines={1}
            style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}
          >
            {title}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
          <IconButton
            icon={resolvedTheme === "dark" ? "sunny-outline" : "moon-outline"}
            label={
              resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"
            }
            onPress={toggleTheme}
          />
          <View
            accessibilityLabel={user?.email ? `Signed in as ${user.email}` : "User account"}
            accessibilityRole="image"
            style={{
              width: 34,
              height: 34,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 17,
              backgroundColor: colors.primary,
            }}
          >
            <Text
              style={{
                color: colors.primaryForeground,
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              {getInitial(user?.email)}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
