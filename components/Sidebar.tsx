import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";

import { NAV_ITEMS } from "@/app/(protected)/_layout";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/providers/AuthProvider";

const EXPANDED_WIDTH = 256;
const COLLAPSED_WIDTH = 72;
const DRAWER_WIDTH = 280;

function NavItem({
  item,
  isActive,
  collapsed,
  onPress,
}: {
  item: (typeof NAV_ITEMS)[number];
  isActive: boolean;
  collapsed: boolean;
  onPress: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <View className="relative">
      <Pressable
        onPress={onPress}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        accessibilityRole="link"
        accessibilityLabel={item.label}
        className={`flex-row items-center rounded-lg mb-1 px-3 py-2.5 ${
          collapsed ? "justify-center" : "gap-3"
        } ${isActive ? "bg-black" : "bg-transparent"}`}
      >
        <Ionicons
          name={item.icon}
          size={20}
          color={isActive ? "#fff" : "#4B5563"}
        />
        {!collapsed && (
          <Text
            className={`text-sm font-medium ${isActive ? "text-white" : "text-gray-700"}`}
          >
            {item.label}
          </Text>
        )}
      </Pressable>

      {collapsed && hovered && (
        <View className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 rounded-md bg-gray-900 px-2 py-1">
          <Text className="text-xs text-white">{item.label}</Text>
        </View>
      )}
    </View>
  );
}

function SidebarContent({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { toggleCollapsed, breakpoint } = useSidebar();

  const handleSignOut = async () => {
    await signOut();
    onNavigate?.();
    router.replace("/(auth)/login");
  };

  return (
    <View className="flex-1 justify-between py-6 px-3">
      <View>
        <View
          className={`mb-8 flex-row items-center px-2 ${collapsed ? "justify-center" : "justify-between"}`}
        >
          {!collapsed && (
            <Text className="text-xl font-bold text-gray-900">MyApp</Text>
          )}
          {breakpoint !== "mobile" && (
            <Pressable
              onPress={toggleCollapsed}
              accessibilityRole="button"
              accessibilityLabel={
                collapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              className="rounded-md p-1.5"
            >
              <Ionicons
                name={collapsed ? "chevron-forward" : "chevron-back"}
                size={18}
                color="#4B5563"
              />
            </Pressable>
          )}
        </View>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname.includes(`/${item.name}`);
          return (
            <NavItem
              key={item.name}
              item={item}
              isActive={isActive}
              collapsed={collapsed}
              onPress={() => {
                router.push(`/(protected)/${item.name}` as any);
                onNavigate?.();
              }}
            />
          );
        })}
      </View>

      <Pressable
        onPress={handleSignOut}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        className={`flex-row items-center rounded-lg px-3 py-2.5 ${collapsed ? "justify-center" : "gap-3"}`}
      >
        <Ionicons name="log-out-outline" size={20} color="#DC2626" />
        {!collapsed && (
          <Text className="text-sm font-medium text-red-600">Sign Out</Text>
        )}
      </Pressable>
    </View>
  );
}

export function Sidebar() {
  const { breakpoint, collapsed, mobileOpen, closeMobile } = useSidebar();
  const widthAnim = useRef(
    new Animated.Value(collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH),
  ).current;
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // Only mount the drawer's contents while open or animating, so it doesn't
  // sit in the tree (and intercept touches) when fully closed.
  const [mounted, setMounted] = useState(mobileOpen);

  useEffect(() => {
    if (breakpoint === "mobile") return;
    Animated.timing(widthAnim, {
      toValue: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [collapsed, breakpoint]);

  useEffect(() => {
    if (breakpoint !== "mobile") return;

    if (mobileOpen) setMounted(true);

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: mobileOpen ? 0 : -DRAWER_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: mobileOpen ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished && !mobileOpen) setMounted(false);
    });
  }, [mobileOpen, breakpoint]);

  if (breakpoint === "mobile") {
    if (!mounted) return null;

    return (
      <View
        className="absolute inset-0 z-50 flex-row"
        pointerEvents={mobileOpen ? "auto" : "none"}
      >
        <Animated.View
          style={{
            width: DRAWER_WIDTH,
            transform: [{ translateX: slideAnim }],
            backgroundColor: "#ffffff", // explicit, don't rely on className here
          }}
          className="h-full border-r border-gray-200"
        >
          <SidebarContent collapsed={false} onNavigate={closeMobile} />
        </Animated.View>

        <Animated.View style={{ flex: 1, opacity: backdropAnim }}>
          <Pressable
            className="flex-1"
            style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
            onPress={closeMobile}
            accessibilityRole="button"
            accessibilityLabel="Close navigation"
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <Animated.View
      style={{ width: widthAnim }}
      className="h-full border-r border-gray-200 bg-white"
    >
      <SidebarContent collapsed={collapsed} />
    </Animated.View>
  );
}
