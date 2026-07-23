import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AccountMenu } from "@/components/account/AccountMenu";
import { AppLogo } from "@/components/AppLogo";
import {
  InlineIcon,
  InlineIconLabel,
  inlineStyles,
} from "@/components/ui/Inline";
import { mainNavigation, type NavigationItem } from "@/constants/navigation";
import { radii, spacing } from "@/constants/theme";
import { useAppShell } from "@/context/AppShellContext";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
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
  const responsive = useResponsiveLayout();
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
        style={({ pressed }) => [
          inlineStyles.row,
          {
            minHeight: 44,
            justifyContent: collapsed ? "center" : "flex-start",
            gap: responsive.isCompact ? spacing.xs : spacing.sm,
            borderWidth: 1,
            borderColor: focused ? colors.focusRing : "transparent",
            borderRadius: radii.md,
            backgroundColor: isActive
              ? colors.accent
              : hovered || pressed
                ? colors.surfaceMuted
                : "transparent",
            paddingHorizontal: collapsed
              ? 0
              : responsive.isCompact
                ? spacing.xs
                : spacing.sm,
            opacity: pressed ? 0.72 : 1,
          },
        ]}
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
        {collapsed ? (
          <InlineIcon
            color={isActive ? colors.foreground : colors.foregroundMuted}
            name={item.icon}
            size={responsive.isCompact ? 19 : 20}
          />
        ) : (
          <InlineIconLabel
            color={isActive ? colors.foreground : colors.foregroundMuted}
            fill
            gap={responsive.isCompact ? spacing.xs : spacing.sm}
            icon={item.icon}
            iconSize={responsive.isCompact ? 19 : 20}
            label={item.label}
            labelStyle={{
              fontSize: responsive.isCompact ? 13 : 14,
              fontWeight: isActive ? "600" : "500",
            }}
          />
        )}
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

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useAppTheme();
  const { desktopCollapsed, isDesktop } = useAppShell();
  const responsive = useResponsiveLayout();
  const collapsed = isDesktop && desktopCollapsed;

  const navigate = (item: NavigationItem) => {
    router.navigate(item.href);
    if (!isDesktop) props.navigation.closeDrawer();
  };

  const isActive = (item: NavigationItem) =>
    pathname === `/${item.name}` || pathname.startsWith(`/${item.name}/`);

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, overflow: "visible", backgroundColor: colors.surface }}
    >
      <View
        style={{
          minHeight: isDesktop ? 68 : responsive.isCompact ? 58 : 62,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingHorizontal: collapsed
            ? spacing.sm
            : responsive.isCompact
              ? spacing.sm
              : spacing.md,
        }}
      >
        <AppLogo compact={collapsed} />
      </View>

      <ScrollView
        contentContainerStyle={{
          gap: spacing.xxs,
          paddingHorizontal: spacing.sm,
          paddingVertical: responsive.isCompact
            ? spacing.sm
            : responsive.isMobile
              ? spacing.md
              : spacing.lg,
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
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingHorizontal: spacing.sm,
          paddingVertical: responsive.isCompact ? spacing.xs : spacing.sm,
        }}
      >
        <AccountMenu
          collapsed={collapsed}
          onNavigate={() => {
            if (!isDesktop) props.navigation.closeDrawer();
          }}
        />
      </View>
    </SafeAreaView>
  );
}
