import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { profileNavigation, settingsNavigation } from "@/constants/navigation";
import { radii, spacing, surfaceShadow } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { getUserDisplayName, getUserRole } from "@/lib/user-profile";
import { useAuth } from "@/providers/AuthProvider";
import { useAppTheme } from "@/providers/ThemeProvider";

import { UserAvatar } from "./UserAvatar";

const TRIGGER_ID = "account-menu-trigger";
const PROFILE_ITEM_ID = "account-menu-profile";
const SETTINGS_ITEM_ID = "account-menu-settings";
const LOGOUT_ITEM_ID = "account-menu-logout";
const MENU_ITEM_IDS = [PROFILE_ITEM_ID, SETTINGS_ITEM_ID, LOGOUT_ITEM_ID];

interface AnchorRect {
  height: number;
  width: number;
  x: number;
  y: number;
}

interface AccountMenuProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

interface AccountMenuItemProps {
  destructive?: boolean;
  description: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  loading?: boolean;
  nativeID: string;
  onPress: () => void;
}

function AccountMenuItem({
  destructive = false,
  description,
  icon,
  label,
  loading = false,
  nativeID,
  onPress,
}: AccountMenuItemProps) {
  const { colors } = useAppTheme();
  const responsive = useResponsiveLayout();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const foreground = destructive ? colors.danger : colors.foreground;

  return (
    <Pressable
      accessibilityHint={description}
      accessibilityLabel={label}
      accessibilityRole="menuitem"
      accessibilityState={{ busy: loading, disabled: loading }}
      disabled={loading}
      nativeID={nativeID}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: responsive.isCompact ? 48 : responsive.isMobile ? 50 : 52,
        flexDirection: "row",
        alignItems: "center",
        gap: responsive.isCompact ? spacing.xs : spacing.sm,
        borderWidth: 1,
        borderColor: focused ? colors.focusRing : "transparent",
        borderRadius: radii.md,
        backgroundColor:
          hovered || pressed
            ? destructive
              ? colors.dangerSoft
              : colors.surfaceMuted
            : "transparent",
        paddingHorizontal: spacing.sm,
        opacity: loading ? 0.55 : pressed ? 0.78 : 1,
        transform: [{ scale: pressed ? 0.988 : 1 }],
      })}
    >
      <View
        style={{
          width: responsive.isCompact ? 30 : 32,
          height: responsive.isCompact ? 30 : 32,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: radii.sm,
          backgroundColor: destructive ? colors.dangerSoft : colors.accent,
        }}
      >
        {loading ? (
          <ActivityIndicator color={colors.danger} size="small" />
        ) : (
          <Ionicons name={icon} size={18} color={foreground} />
        )}
      </View>
      <View style={{ minWidth: 0, flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{ color: foreground, fontSize: 14, fontWeight: "600" }}
        >
          {loading ? "Logging out…" : label}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            marginTop: 2,
            color: destructive ? colors.danger : colors.foregroundMuted,
            fontSize: 11,
          }}
        >
          {description}
        </Text>
      </View>
      {!loading && !destructive ? (
        <Ionicons
          name="chevron-forward"
          size={15}
          color={colors.foregroundSubtle}
        />
      ) : null}
    </Pressable>
  );
}

interface AccountMenuContentProps {
  logoutError: string | null;
  loggingOut: boolean;
  nativeSheet: boolean;
  onClose: () => void;
  onLogout: () => void;
  onProfile: () => void;
  onSettings: () => void;
}

function AccountMenuContent({
  logoutError,
  loggingOut,
  nativeSheet,
  onClose,
  onLogout,
  onProfile,
  onSettings,
}: AccountMenuContentProps) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const responsive = useResponsiveLayout();
  const displayName = getUserDisplayName(user);
  const role = getUserRole(user);

  return (
    <ScrollView
      accessibilityRole="menu"
      bounces={false}
      contentContainerStyle={{ flexGrow: 0 }}
      showsVerticalScrollIndicator={false}
    >
      {nativeSheet ? (
        <>
          <View
            style={{
              width: 36,
              height: 4,
              alignSelf: "center",
              marginTop: 7,
              borderRadius: radii.full,
              backgroundColor: colors.borderStrong,
            }}
          />
          <View
            style={{
              minHeight: responsive.isCompact ? 46 : 50,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: spacing.md,
            }}
          >
            <Text
              accessibilityRole="header"
              style={{ color: colors.foreground, fontSize: 16, fontWeight: "700" }}
            >
              Account
            </Text>
            <Pressable
              accessibilityLabel="Close account menu"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClose}
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: radii.full,
                backgroundColor: pressed ? colors.accent : "transparent",
                opacity: pressed ? 0.72 : 1,
              })}
            >
              <Ionicons name="close" size={21} color={colors.foregroundMuted} />
            </Pressable>
          </View>
        </>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          paddingHorizontal: responsive.isCompact ? spacing.sm : spacing.md,
          paddingTop: nativeSheet
            ? spacing.xs
            : responsive.isCompact
              ? spacing.sm
              : spacing.md,
          paddingBottom: responsive.isCompact ? spacing.sm : spacing.md,
        }}
      >
        <UserAvatar showStatus size={responsive.isCompact ? 40 : 44} />
        <View style={{ minWidth: 0, flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{ color: colors.foreground, fontSize: 14, fontWeight: "700" }}
          >
            {displayName}
          </Text>
          <Text
            numberOfLines={1}
            style={{ marginTop: 2, color: colors.foregroundMuted, fontSize: 12 }}
          >
            {user?.email ?? "Signed in"}
          </Text>
          <View
            style={{
              marginTop: 7,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <View
              style={{
                borderRadius: radii.full,
                backgroundColor: colors.brandSoft,
                paddingHorizontal: 7,
                paddingVertical: 2,
              }}
            >
              <Text style={{ color: colors.brand, fontSize: 10, fontWeight: "700" }}>
                {role}
              </Text>
            </View>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: radii.full,
                backgroundColor: colors.success,
              }}
            />
            <Text style={{ color: colors.foregroundMuted, fontSize: 10 }}>
              Online
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          height: 1,
          marginHorizontal: spacing.sm,
          backgroundColor: colors.border,
        }}
      />

      <View style={{ gap: 2, padding: spacing.xs }}>
        <AccountMenuItem
          description="Personal details"
          icon="person-outline"
          label="Profile"
          nativeID={PROFILE_ITEM_ID}
          onPress={onProfile}
        />
        <AccountMenuItem
          description="Appearance and preferences"
          icon="settings-outline"
          label="Settings"
          nativeID={SETTINGS_ITEM_ID}
          onPress={onSettings}
        />
        <View
          style={{
            height: 1,
            marginHorizontal: spacing.xs,
            marginVertical: 4,
            backgroundColor: colors.border,
          }}
        />
        <AccountMenuItem
          destructive
          description="End your current session"
          icon="log-out-outline"
          label="Log out"
          loading={loggingOut}
          nativeID={LOGOUT_ITEM_ID}
          onPress={onLogout}
        />
        {logoutError ? (
          <Text
            accessibilityLiveRegion="polite"
            style={{
              paddingHorizontal: spacing.sm,
              paddingBottom: spacing.xs,
              color: colors.danger,
              fontSize: 11,
              lineHeight: 16,
            }}
          >
            {logoutError}
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

export function AccountMenu({ collapsed = false, onNavigate }: AccountMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const { colors, resolvedTheme } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const responsive = useResponsiveLayout();
  const triggerRef = useRef<View>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const [anchor, setAnchor] = useState<AnchorRect | null>(null);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const isWeb = Platform.OS === "web";
  const accountRouteActive =
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/");

  const focusTrigger = useCallback(() => {
    if (!isWeb || typeof document === "undefined") return;
    globalThis.setTimeout(() => document.getElementById(TRIGGER_ID)?.focus(), 0);
  }, [isWeb]);

  const closeMenu = useCallback(
    (afterClose?: () => void) => {
      Animated.timing(progress, {
        duration: 140,
        toValue: 0,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) return;
        setMounted(false);
        setAnchor(null);
        afterClose?.();
        focusTrigger();
      });
    },
    [focusTrigger, progress],
  );

  const animateOpen = useCallback(() => {
    progress.stopAnimation();
    progress.setValue(0);
    setMounted(true);
    requestAnimationFrame(() => {
      Animated.spring(progress, {
        bounciness: 2,
        speed: 22,
        toValue: 1,
        useNativeDriver: true,
      }).start();
    });
  }, [progress]);

  const openMenu = useCallback(() => {
    setLogoutError(null);

    if (isWeb) {
      triggerRef.current?.measureInWindow((x, y, measuredWidth, measuredHeight) => {
        setAnchor({ x, y, width: measuredWidth, height: measuredHeight });
        animateOpen();
      });
      return;
    }

    animateOpen();
  }, [animateOpen, isWeb]);

  const toggleMenu = () => {
    if (mounted) closeMenu();
    else openMenu();
  };

  const navigateTo = useCallback(
    (href: typeof profileNavigation.href | typeof settingsNavigation.href) => {
      closeMenu(() => {
        router.navigate(href);
        onNavigate?.();
      });
    },
    [closeMenu, onNavigate, router],
  );

  const handleLogout = useCallback(async () => {
    setLogoutError(null);
    setLoggingOut(true);
    const { error } = await signOut();
    setLoggingOut(false);

    if (error) {
      setLogoutError(error);
      return;
    }

    closeMenu(onNavigate);
  }, [closeMenu, onNavigate, signOut]);

  useEffect(() => {
    if (!mounted || !isWeb || typeof document === "undefined") return;

    const focusTimer = globalThis.setTimeout(
      () => document.getElementById(PROFILE_ITEM_ID)?.focus(),
      110,
    );
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      const enabledItems = MENU_ITEM_IDS.map((id) => document.getElementById(id)).filter(
        (element): element is HTMLElement => Boolean(element),
      );
      if (enabledItems.length === 0) return;

      const currentIndex = enabledItems.findIndex(
        (element) => element === document.activeElement,
      );
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const nextIndex =
          currentIndex < 0
            ? direction > 0
              ? 0
              : enabledItems.length - 1
            : (currentIndex + direction + enabledItems.length) % enabledItems.length;
        enabledItems[nextIndex]?.focus();
      }

      if (event.key === "Tab") {
        const firstItem = enabledItems[0];
        const lastItem = enabledItems.at(-1);
        if (event.shiftKey && document.activeElement === firstItem) {
          event.preventDefault();
          lastItem?.focus();
        } else if (!event.shiftKey && document.activeElement === lastItem) {
          event.preventDefault();
          firstItem?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      globalThis.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, isWeb, mounted]);

  const menuWidth = Math.min(292, width - spacing.xl);
  const popoverPosition = useMemo(() => {
    const target = anchor ?? { x: spacing.sm, y: height, width: 0, height: 0 };
    return {
      bottom: Math.max(spacing.sm, height - target.y + spacing.xs),
      left: Math.min(
        Math.max(spacing.sm, target.x),
        Math.max(spacing.sm, width - menuWidth - spacing.sm),
      ),
    };
  }, [anchor, height, menuWidth, width]);

  const menuContent = (
    <AccountMenuContent
      logoutError={logoutError}
      loggingOut={loggingOut}
      nativeSheet={!isWeb}
      onClose={() => closeMenu()}
      onLogout={handleLogout}
      onProfile={() => navigateTo(profileNavigation.href)}
      onSettings={() => navigateTo(settingsNavigation.href)}
    />
  );

  return (
    <>
      <View collapsable={false} ref={triggerRef} style={{ position: "relative" }}>
        <Pressable
          accessibilityHint="Open profile, settings, and logout actions"
          accessibilityLabel="Open account menu"
          accessibilityRole="button"
          accessibilityState={{ expanded: mounted, selected: accountRouteActive }}
          nativeID={TRIGGER_ID}
          onBlur={() => setFocused(false)}
          onFocus={() => setFocused(true)}
          onHoverIn={() => setHovered(true)}
          onHoverOut={() => setHovered(false)}
          onPress={toggleMenu}
          style={({ pressed }) => ({
            minHeight: collapsed
              ? 48
              : responsive.isCompact
                ? 52
                : responsive.isMobile
                  ? 54
                  : 58,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: spacing.sm,
            borderWidth: 1,
            borderColor: focused ? colors.focusRing : "transparent",
            borderRadius: radii.md,
            backgroundColor:
              mounted || accountRouteActive
                ? colors.accent
                : hovered || pressed
                  ? colors.surfaceMuted
                  : "transparent",
            paddingHorizontal: collapsed ? 0 : spacing.xs,
            opacity: pressed ? 0.78 : 1,
            transform: [{ scale: pressed ? 0.992 : 1 }],
          })}
        >
          {accountRouteActive ? (
            <View
              style={{
                position: "absolute",
                left: collapsed ? -7 : -9,
                width: 3,
                height: 24,
                borderRadius: 2,
                backgroundColor: colors.foreground,
              }}
            />
          ) : null}
          <UserAvatar
            showStatus
            size={collapsed ? 34 : responsive.isCompact ? 34 : 38}
          />
          {!collapsed ? (
            <>
              <View style={{ minWidth: 0, flex: 1 }}>
                <Text
                  numberOfLines={1}
                  style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}
                >
                  {getUserDisplayName(user)}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{ marginTop: 2, color: colors.foregroundMuted, fontSize: 11 }}
                >
                  {user?.email ?? "Account"}
                </Text>
              </View>
              <Ionicons
                name={mounted ? "chevron-down" : "chevron-up"}
                size={16}
                color={colors.foregroundSubtle}
              />
            </>
          ) : null}
        </Pressable>

        {collapsed && hovered && !mounted ? (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 58,
              top: 9,
              zIndex: 100,
              borderRadius: radii.sm,
              backgroundColor: colors.primary,
              paddingHorizontal: spacing.sm,
              paddingVertical: 6,
            }}
          >
            <Text
              style={{ color: colors.primaryForeground, fontSize: 12, fontWeight: "500" }}
            >
              Account
            </Text>
          </View>
        ) : null}
      </View>

      <Modal
        animationType="none"
        hardwareAccelerated
        onRequestClose={() => closeMenu()}
        statusBarTranslucent
        transparent
        visible={mounted}
      >
        <View
          accessibilityViewIsModal
          onAccessibilityEscape={() => closeMenu()}
          style={{ flex: 1, justifyContent: isWeb ? "flex-start" : "flex-end" }}
        >
          <Animated.View
            pointerEvents="none"
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: colors.overlay,
              opacity: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, isWeb ? 0.18 : 1],
              }),
            }}
          />
          <Pressable
            accessibilityLabel="Close account menu"
            accessible={false}
            onPress={() => closeMenu()}
            style={StyleSheet.absoluteFill}
          />

          {isWeb ? (
            <Animated.View
              style={[
                {
                  position: "absolute",
                  width: menuWidth,
                  maxHeight: Math.max(320, height - spacing.xl),
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radii.lg,
                  backgroundColor: colors.surfaceElevated,
                  opacity: progress,
                  transform: [
                    {
                      translateY: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [8, 0],
                      }),
                    },
                    {
                      scale: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.98, 1],
                      }),
                    },
                  ],
                  ...popoverPosition,
                },
                surfaceShadow(resolvedTheme),
              ]}
            >
              {menuContent}
            </Animated.View>
          ) : (
            <Animated.View
              style={[
                {
                  width: "100%",
                  maxWidth: 560,
                  maxHeight: Math.max(280, height - insets.top - spacing.sm),
                  alignSelf: "center",
                  overflow: "hidden",
                  borderTopLeftRadius: radii.xl,
                  borderTopRightRadius: radii.xl,
                  borderWidth: 1,
                  borderBottomWidth: 0,
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceElevated,
                  paddingBottom: Math.max(spacing.sm, insets.bottom),
                  opacity: progress,
                  transform: [
                    {
                      translateY: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [32, 0],
                      }),
                    },
                  ],
                },
                surfaceShadow(resolvedTheme),
              ]}
            >
              {menuContent}
            </Animated.View>
          )}
        </View>
      </Modal>
    </>
  );
}
