import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export type AppRouteName =
  | "dashboard"
  | "projects"
  | "teams"
  | "profile"
  | "settings";

export interface NavigationItem {
  description: string;
  href:
    | "/(protected)/dashboard"
    | "/(protected)/projects"
    | "/(protected)/teams"
    | "/(protected)/profile"
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
  description: "Appearance and preferences",
  href: "/(protected)/settings",
  icon: "settings-outline",
} as const satisfies NavigationItem;

export const profileNavigation = {
  name: "profile",
  label: "Profile",
  description: "Personal details",
  href: "/(protected)/profile",
  icon: "person-outline",
} as const satisfies NavigationItem;

export const accountNavigation = [
  profileNavigation,
  settingsNavigation,
] as const;

export const allNavigation = [
  ...mainNavigation,
  ...accountNavigation,
] as const;

export function getNavigationItem(
  routeName: string,
): NavigationItem | undefined {
  return allNavigation.find((item) => item.name === routeName);
}
