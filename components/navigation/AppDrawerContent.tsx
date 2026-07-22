import { Ionicons } from "@expo/vector-icons";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppLogo } from "@/components/AppLogo";
import {
  mainNavigation,
  settingsNavigation,
  type NavigationItem,
} from "@/constants/navigation";
import { radii, spacing } from "@/constants/theme";
import { useAppShell } from "@/context/AppShellContext";
import { useAuth } from "@/providers/AuthProvider";
import { useAppTheme } from "@/providers/ThemeProvider";

interface NavigationRowProps {
  collapsed: boolean;
  isActive: boolean;
  item: NavigationItem;
  onPress: () => void;
}

function NavigationRow({
  collapsed,
  isActive,
  item,
  onPress,
}: NavigationRowProps) {
  const { colors } = useAppTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ position: "relative" }}>
      <Pressable
        accessibilityHint={item.description}
        accessibilityLabel={item.label}
        accessibilityRole="link"
        accessibilityState={{ selected: isActive }}
        onBlur={() => setFocused(false)}
        onFocus={() => setFocused(true)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onPress={onPress}
        style={({ pressed }) => ({
          minHeight: 44,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: spacing.sm,
          borderWidth: 1,
          borderColor: focused ? colors.focusRing : "transparent",
          borderRadius: radii.md,
          backgroundColor: isActive
            ? colors.accent
            : hovered || pressed
              ? colors.surfaceMuted
              : "transparent",
          paddingHorizontal: collapsed ? 0 : spacing.sm,
          opacity: pressed ? 0.72 : 1,
        })}
      >
        {isActive ? (
          <View
            style={{
              position: "absolute",
              left: collapsed ? -7 : -9,
              width: 3,
              height: 22,
              borderRadius: 2,
              backgroundColor: colors.foreground,
            }}
          />
        ) : null}
        <Ionicons
          name={item.icon}
          size={20}
          color={isActive ? colors.foreground : colors.foregroundMuted}
        />
        {!collapsed ? (
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              color: isActive ? colors.foreground : colors.foregroundMuted,
              fontSize: 14,
              fontWeight: isActive ? "600" : "500",
            }}
          >
            {item.label}
          </Text>
        ) : null}
      </Pressable>

      {collapsed && hovered ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 58,
            top: 7,
            zIndex: 100,
            borderRadius: radii.sm,
            backgroundColor: colors.primary,
            paddingHorizontal: spacing.sm,
            paddingVertical: 6,
          }}
        >
          <Text
            style={{
              color: colors.primaryForeground,
              fontSize: 12,
              fontWeight: "500",
            }}
          >
            {item.label}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function getInitial(email?: string): string {
  return email?.trim().charAt(0).toUpperCase() || "U";
}

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useAppTheme();
  const { desktopCollapsed, isDesktop } = useAppShell();
  const { signOut, user } = useAuth();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const collapsed = isDesktop && desktopCollapsed;

  const navigate = (item: NavigationItem) => {
    router.navigate(item.href);
    if (!isDesktop) props.navigation.closeDrawer();
  };

  const isActive = (item: NavigationItem) =>
    pathname === `/${item.name}` || pathname.startsWith(`/${item.name}/`);

  const handleLogout = async () => {
    setLogoutError(null);
    setLoggingOut(true);
    const { error } = await signOut();
    setLoggingOut(false);
    if (error) setLogoutError(error);
  };

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, overflow: "visible", backgroundColor: colors.surface }}
    >
      <View
        style={{
          minHeight: 68,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingHorizontal: collapsed ? spacing.sm : spacing.md,
        }}
      >
        <AppLogo compact={collapsed} />
      </View>

      <ScrollView
        contentContainerStyle={{
          gap: spacing.xxs,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        {!collapsed ? (
          <Text
            style={{
              marginBottom: spacing.xs,
              paddingHorizontal: spacing.sm,
              color: colors.foregroundSubtle,
              fontSize: 11,
              fontWeight: "600",
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
          >
            Platform
          </Text>
        ) : null}
        {mainNavigation.map((item) => (
          <NavigationRow
            key={item.name}
            collapsed={collapsed}
            isActive={isActive(item)}
            item={item}
            onPress={() => navigate(item)}
          />
        ))}
      </ScrollView>

      <View
        style={{
          gap: spacing.xs,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          padding: spacing.sm,
        }}
      >
        <NavigationRow
          collapsed={collapsed}
          isActive={isActive(settingsNavigation)}
          item={settingsNavigation}
          onPress={() => navigate(settingsNavigation)}
        />

        {!collapsed ? (
          <View
            style={{
              marginTop: spacing.xs,
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.sm,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              paddingHorizontal: spacing.xs,
              paddingTop: spacing.md,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: radii.full,
                backgroundColor: colors.brandSoft,
              }}
            >
              <Text style={{ color: colors.brand, fontSize: 13, fontWeight: "700" }}>
                {getInitial(user?.email)}
              </Text>
            </View>
            <View style={{ minWidth: 0, flex: 1 }}>
              <Text
                numberOfLines={1}
                style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}
              >
                Account
              </Text>
              <Text
                numberOfLines={1}
                style={{ marginTop: 2, color: colors.foregroundMuted, fontSize: 11 }}
              >
                {user?.email ?? "Signed in"}
              </Text>
            </View>
          </View>
        ) : null}

        <Pressable
          accessibilityLabel="Log out"
          accessibilityRole="button"
          accessibilityState={{ busy: loggingOut }}
          disabled={loggingOut}
          onPress={handleLogout}
          style={({ pressed }) => ({
            minHeight: 44,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: spacing.sm,
            borderRadius: radii.md,
            backgroundColor: pressed ? colors.dangerSoft : "transparent",
            paddingHorizontal: collapsed ? 0 : spacing.sm,
            opacity: loggingOut ? 0.5 : pressed ? 0.72 : 1,
          })}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          {!collapsed ? (
            <Text style={{ color: colors.danger, fontSize: 14, fontWeight: "500" }}>
              {loggingOut ? "Logging out…" : "Log out"}
            </Text>
          ) : null}
        </Pressable>
        {logoutError && !collapsed ? (
          <Text
            accessibilityLiveRegion="polite"
            style={{ color: colors.danger, fontSize: 11, lineHeight: 15 }}
          >
            {logoutError}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
