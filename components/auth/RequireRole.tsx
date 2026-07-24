import { Fragment, type ReactNode } from "react";

import { useAuth } from "@/providers/AuthProvider";

interface AuthorizationBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  match?: "all" | "any";
}

interface RequireRoleProps extends AuthorizationBoundaryProps {
  role: string | readonly string[];
}

interface RequirePermissionProps extends AuthorizationBoundaryProps {
  permission: string | readonly string[];
}

function matches(
  requirements: string | readonly string[],
  predicate: (requirement: string) => boolean,
  match: "all" | "any",
): boolean {
  const entries =
    typeof requirements === "string" ? [requirements] : requirements;

  return match === "all"
    ? entries.every(predicate)
    : entries.some(predicate);
}

export function RequireRole({
  children,
  fallback = null,
  loadingFallback = null,
  match = "any",
  role,
}: RequireRoleProps) {
  const { authorizationLoading, hasRole } = useAuth();

  if (authorizationLoading) {
    return <Fragment>{loadingFallback}</Fragment>;
  }

  return (
    <Fragment>
      {matches(role, hasRole, match) ? children : fallback}
    </Fragment>
  );
}

export function RequirePermission({
  children,
  fallback = null,
  loadingFallback = null,
  match = "any",
  permission,
}: RequirePermissionProps) {
  const { authorizationLoading, can } = useAuth();

  if (authorizationLoading) {
    return <Fragment>{loadingFallback}</Fragment>;
  }

  return (
    <Fragment>
      {matches(permission, can, match) ? children : fallback}
    </Fragment>
  );
}
