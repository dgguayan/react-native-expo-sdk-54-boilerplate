import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  LayoutAnimation,
  Platform,
  UIManager,
  useWindowDimensions,
} from "react-native";

import { layout } from "@/constants/theme";
import { useAppTheme } from "@/providers/ThemeProvider";

const SIDEBAR_STORAGE_KEY = "desktop-sidebar-collapsed";

export type AppBreakpoint = "mobile" | "tablet" | "desktop";

interface AppShellContextValue {
  breakpoint: AppBreakpoint;
  desktopCollapsed: boolean;
  drawerWidth: number;
  isDesktop: boolean;
  isMobile: boolean;
  isTablet: boolean;
  toggleDesktopSidebar: () => void;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function AppShellProvider({ children }: PropsWithChildren) {
  const { width } = useWindowDimensions();
  const { tokens } = useAppTheme();
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  const breakpoint: AppBreakpoint =
    width >= layout.desktopBreakpoint
      ? "desktop"
      : width >= layout.mobileBreakpoint
        ? "tablet"
        : "mobile";

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(SIDEBAR_STORAGE_KEY)
      .then((value) => {
        if (isMounted && value !== null) {
          setDesktopCollapsed(value === "true");
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleDesktopSidebar = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDesktopCollapsed((currentValue) => {
      const nextValue = !currentValue;
      AsyncStorage.setItem(
        SIDEBAR_STORAGE_KEY,
        String(nextValue),
      ).catch(() => undefined);
      return nextValue;
    });
  }, []);

  const drawerGutter =
    width < layout.compactBreakpoint
      ? tokens.spacing.md
      : tokens.spacing.xl;
  const drawerWidth =
    breakpoint === "desktop"
      ? desktopCollapsed
        ? layout.sidebarCollapsed
        : layout.sidebarExpanded
      : Math.min(layout.drawerMaxWidth, Math.max(0, width - drawerGutter));

  const value = useMemo<AppShellContextValue>(
    () => ({
      breakpoint,
      desktopCollapsed,
      drawerWidth,
      isDesktop: breakpoint === "desktop",
      isMobile: breakpoint === "mobile",
      isTablet: breakpoint === "tablet",
      toggleDesktopSidebar,
    }),
    [breakpoint, desktopCollapsed, drawerWidth, toggleDesktopSidebar],
  );

  return (
    <AppShellContext.Provider value={value}>
      {children}
    </AppShellContext.Provider>
  );
}

export function useAppShell(): AppShellContextValue {
  const context = useContext(AppShellContext);

  if (!context) {
    throw new Error("useAppShell must be used within AppShellProvider");
  }

  return context;
}
