import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { usePathname, useRouter } from "expo-router";
import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  type ViewStyle,
} from "react-native";
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

type InteractiveViewStyle = ViewStyle & {
  transitionDuration?: string;
  transitionProperty?: string;
  transitionTimingFunction?: string;
};

const webInteractionStyle: InteractiveViewStyle | undefined =
  Platform.OS === "web"
    ? {
        transitionDuration: "160ms",
        transitionProperty: "background-color, border-color, opacity, transform",
        transitionTimingFunction: "ease-out",
      }
    : undefined;

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
  const foreground = isActive ? colors.brand : colors.foregroundMuted;

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
            minHeight: responsive.isCompact
              ? 52
              : responsive.isMobile
                ? 54
                : 48,
            justifyContent: collapsed ? "center" : "flex-start",
            gap: spacing.sm,
            borderWidth: 1,
            borderColor: focused
              ? colors.focusRing
              : isActive
                ? colors.brand
                : hovered
                  ? colors.borderStrong
                  : "transparent",
            borderRadius: radii.lg,
            backgroundColor: isActive
              ? colors.brandSoft
              : hovered || pressed
                ? colors.surfaceMuted
                : "transparent",
            paddingHorizontal: collapsed
              ? 0
              : responsive.isCompact
                ? spacing.sm
                : responsive.isPhone
                  ? spacing.md
                  : spacing.sm,
            opacity: pressed ? 0.76 : 1,
            transform: [{ scale: pressed ? 0.992 : 1 }],
            ...webInteractionStyle,
          },
        ]}
      >
        {isActive ? (
          <View
            style={{
              position: "absolute",
              left: collapsed ? -7 : -9,
              width: 4,
              height: responsive.isMobile ? 26 : 24,
              borderRadius: 2,
              backgroundColor: colors.brand,
            }}
          />
        ) : null}
        {collapsed ? (
          <InlineIcon color={foreground} name={item.icon} size={20} />
        ) : (
          <InlineIconLabel
            color={foreground}
            fill
            gap={spacing.sm}
            icon={item.icon}
            iconSize={20}
            label={item.label}
            labelStyle={{
              fontSize: 14,
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
  const sidebarHorizontalPadding =
    responsive.isPhone && !responsive.isCompact ? spacing.md : spacing.sm;

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
          gap: spacing.xs,
          paddingHorizontal: sidebarHorizontalPadding,
          paddingVertical: responsive.isMobile ? spacing.md : spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        {!collapsed ? (
          <Text
            style={{
              marginBottom: spacing.sm,
              paddingHorizontal:
                responsive.isPhone && !responsive.isCompact ? spacing.md : spacing.sm,
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
          paddingHorizontal: sidebarHorizontalPadding,
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
