import {
  EMPTY_AUTHORIZATION,
  type AuthorizationSnapshot,
} from "@/constants/authorization";
import { supabase } from "@/lib/supabase";

const ROLE_SLUG = /^[a-z][a-z0-9_]*$/;
const PERMISSION_SLUG = /^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$/;

interface AuthorizationPayload {
  permissions?: unknown;
  roles?: unknown;
}

export interface AuthorizationLoadResult {
  authorization: AuthorizationSnapshot;
  error: string | null;
}

function normalizeSlugList(
  value: unknown,
  pattern: RegExp,
): string[] | null {
  if (!Array.isArray(value)) return null;

  const slugs = value.map((entry) =>
    typeof entry === "string" ? entry.trim().toLowerCase() : "",
  );

  if (slugs.some((slug) => !pattern.test(slug))) {
    return null;
  }

  return [...new Set(slugs)];
}

export function normalizeAuthorization(
  value: unknown,
): AuthorizationSnapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const payload = value as AuthorizationPayload;
  const roles = normalizeSlugList(payload.roles, ROLE_SLUG);
  const permissions = normalizeSlugList(payload.permissions, PERMISSION_SLUG);

  if (!roles || !permissions) return null;

  return {
    permissions,
    primaryRole: roles[0] ?? null,
    roles,
  };
}

export async function loadCurrentAuthorization(
  initialize = false,
): Promise<AuthorizationLoadResult> {
  const rpcName = initialize
    ? "initialize_my_authorization"
    : "get_my_authorization";
  let response: Awaited<ReturnType<typeof supabase.rpc>>;

  try {
    response = await supabase.rpc(rpcName);
  } catch (caughtError: unknown) {
    if (__DEV__) {
      console.info("[authorization] Authorization request failed.", {
        message:
          caughtError instanceof Error
            ? caughtError.message
            : String(caughtError),
        rpcName,
      });
    }

    return {
      authorization: EMPTY_AUTHORIZATION,
      error: "Your access level could not be verified. Please try again.",
    };
  }

  const { data, error } = response;

  if (error) {
    if (__DEV__) {
      console.info("[authorization] Unable to load the role snapshot.", {
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: error.message,
        rpcName,
      });
    }

    return {
      authorization: EMPTY_AUTHORIZATION,
      error: "Your access level could not be verified. Please try again.",
    };
  }

  const authorization = normalizeAuthorization(data);
  if (!authorization) {
    if (__DEV__) {
      console.info("[authorization] Ignored an invalid authorization payload.", {
        rpcName,
      });
    }

    return {
      authorization: EMPTY_AUTHORIZATION,
      error: "The server returned an invalid access configuration.",
    };
  }

  if (authorization.roles.length === 0) {
    return {
      authorization,
      error: "No role is assigned to this account.",
    };
  }

  return { authorization, error: null };
}

export function hasRole(
  authorization: AuthorizationSnapshot,
  role: string,
): boolean {
  return authorization.roles.includes(role.trim().toLowerCase());
}

export function can(
  authorization: AuthorizationSnapshot,
  permission: string,
): boolean {
  return authorization.permissions.includes(permission.trim().toLowerCase());
}

export function getRoleLabel(role: string | null | undefined): string {
  if (!role) return "Member";

  return role
    .split(/[._\-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}
