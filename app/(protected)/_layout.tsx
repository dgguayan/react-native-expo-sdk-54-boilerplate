import { Ionicons } from "@expo/vector-icons";
import { Redirect, Slot, Tabs } from "expo-router";
import { ActivityIndicator, Platform, View } from "react-native";

import { MobileHeader } from "@/components/MobileHeader";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/providers/AuthProvider";

export const NAV_ITEMS = [
  { name: "dashboard", label: "Dashboard", icon: "grid-outline" as const },
  { name: "settings", label: "Settings", icon: "settings-outline" as const },
];

function WebProtectedLayout() {
  const { breakpoint } = useSidebar();

  return (
    <View className="flex-1 flex-row bg-gray-50">
      <Sidebar />
      <View className="flex-1">
        {breakpoint === "mobile" && <MobileHeader />}
        <View className="flex-1">
          <Slot />
        </View>
      </View>
    </View>
  );
}

export default function ProtectedLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (Platform.OS === "web") {
    return (
      <SidebarProvider>
        <WebProtectedLayout />
      </SidebarProvider>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#9CA3AF",
      }}
    >
      {NAV_ITEMS.map((item) => (
        <Tabs.Screen
          key={item.name}
          name={item.name}
          options={{
            title: item.label,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={item.icon} color={color} size={size} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
