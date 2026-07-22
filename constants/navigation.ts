import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export type AppRouteName = "dashboard" | "projects" | "teams" | "settings";

export interface NavigationItem {
  description: string;
  href:
    | "/(protected)/dashboard"
    | "/(protected)/projects"
    | "/(protected)/teams"
    | "/(protected)/settings";
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  name: AppRouteName;
}

export const mainNavigation = [
  {
    name: "dashboard",
    label: "Dashboard",
    description: "Workspace overview",
    href: "/(protected)/dashboard",
    icon: "grid-outline",
  },
  {
    name: "projects",
    label: "Projects",
    description: "Plans and delivery",
    href: "/(protected)/projects",
    icon: "folder-open-outline",
  },
  {
    name: "teams",
    label: "Teams",
    description: "People and access",
    href: "/(protected)/teams",
    icon: "people-outline",
  },
] as const satisfies readonly NavigationItem[];

export const settingsNavigation = {
  name: "settings",
  label: "Settings",
  description: "Preferences and profile",
  href: "/(protected)/settings",
  icon: "settings-outline",
} as const satisfies NavigationItem;

export const allNavigation = [...mainNavigation, settingsNavigation] as const;

export function getNavigationItem(
  routeName: string,
): NavigationItem | undefined {
  return allNavigation.find((item) => item.name === routeName);
}
