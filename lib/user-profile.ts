import type { User } from "@supabase/supabase-js";

function metadataString(user: User | null, key: string): string | undefined {
  const appValue: unknown = user?.app_metadata?.[key];
  if (typeof appValue === "string" && appValue.trim()) {
    return appValue.trim();
  }

  const userValue: unknown = user?.user_metadata?.[key];
  return typeof userValue === "string" && userValue.trim()
    ? userValue.trim()
    : undefined;
}

function titleCase(value: string): string {
  return value
    .split(/[._\-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function getUserDisplayName(user: User | null): string {
  const metadataName =
    metadataString(user, "full_name") ??
    metadataString(user, "name") ??
    metadataString(user, "display_name");

  if (metadataName) return metadataName;

  const emailName = user?.email?.split("@")[0];
  return emailName ? titleCase(emailName) : "Workspace member";
}

export function getUserInitials(user: User | null): string {
  const words = getUserDisplayName(user).split(/\s+/).filter(Boolean);
  if (words.length === 0) return "U";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0].charAt(0)}${words.at(-1)?.charAt(0) ?? ""}`.toUpperCase();
}

export function getUserAvatarUrl(user: User | null): string | undefined {
  return (
    metadataString(user, "avatar_url") ?? metadataString(user, "picture")
  );
}
