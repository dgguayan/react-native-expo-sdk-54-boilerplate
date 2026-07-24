import { DrawerActions } from "@react-navigation/native";
import { Drawer } from "expo-router/drawer";
import { Platform, type ViewStyle } from "react-native";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppDrawerContent } from "@/components/navigation/AppDrawerContent";
import { getNavigationItem } from "@/constants/navigation";
import { AppShellProvider, useAppShell } from "@/context/AppShellContext";
import { useAppTheme } from "@/providers/ThemeProvider";

type WebTransitionStyle = ViewStyle & {
  transitionDuration?: string;
  transitionProperty?: string;
  transitionTimingFunction?: string;
};

function ProtectedNavigator() {
  const { colors, tokens } = useAppTheme();
  const { drawerWidth, isDesktop, toggleDesktopSidebar } = useAppShell();
  const webTransition: WebTransitionStyle | undefined =
    Platform.OS === "web"
      ? {
          transitionDuration: "180ms",
          transitionProperty: "width",
          transitionTimingFunction: "ease-in-out",
        }
      : undefined;

  return (
    <Drawer
      defaultStatus="closed"
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={({ route }) => {
        const navigationItem = getNavigationItem(route.name);

        return {
          drawerType: isDesktop
            ? "permanent"
            : Platform.OS === "ios"
              ? "slide"
              : "front",
          drawerStyle: [
            {
              width: drawerWidth,
              overflow: "visible",
              borderRightColor: colors.sidebarBorder,
              borderRightWidth: tokens.borders.thin,
              backgroundColor: colors.sidebar,
            },
            webTransition,
          ],
          sceneStyle: { backgroundColor: colors.background },
          overlayColor: colors.overlay,
          swipeEnabled: !isDesktop,
          swipeEdgeWidth: 72,
          keyboardDismissMode: "on-drag",
          freezeOnBlur: true,
          headerShown: true,
          header: ({ navigation }) => (
            <AppHeader
              title={navigationItem?.label ?? "Workspace"}
              onMenuPress={() => {
                if (isDesktop) {
                  toggleDesktopSidebar();
                } else {
                  navigation.dispatch(DrawerActions.toggleDrawer());
                }
              }}
            />
          ),
        };
      }}
    >
      <Drawer.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="projects" options={{ title: "Projects" }} />
      <Drawer.Screen name="teams" options={{ title: "Teams" }} />
      <Drawer.Screen name="profile" options={{ title: "Profile" }} />
      <Drawer.Screen name="settings" options={{ title: "Settings" }} />
    </Drawer>
  );
}

export default function ProtectedLayout() {
  return (
    <AppShellProvider>
      <ProtectedNavigator />
    </AppShellProvider>
  );
}
