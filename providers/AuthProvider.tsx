import { type Session, type User } from "@supabase/supabase-js";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  can as authorizationCan,
  hasRole as authorizationHasRole,
  loadCurrentAuthorization,
} from "@/lib/authorization";
import {
  EMPTY_AUTHORIZATION,
  SYSTEM_ROLES,
} from "@/constants/authorization";
import { supabase } from "@/lib/supabase";
import type { AuthContextType } from "@/types";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorization, setAuthorization] = useState(EMPTY_AUTHORIZATION);
  const [authorizationError, setAuthorizationError] = useState<string | null>(
    null,
  );
  const [authorizationLoading, setAuthorizationLoading] = useState(true);
  const isMountedRef = useRef(true);
  const sessionRef = useRef<Session | null>(null);
  const authorizationUserIdRef = useRef<string | null>(null);
  const authorizationRequestRef = useRef<{
    promise: ReturnType<typeof loadCurrentAuthorization>;
    userId: string;
  } | null>(null);

  const resetAuthorization = useCallback(() => {
    authorizationUserIdRef.current = null;
    authorizationRequestRef.current = null;
    setAuthorization(EMPTY_AUTHORIZATION);
    setAuthorizationError(null);
    setAuthorizationLoading(false);
  }, []);

  const hydrateAuthorization = useCallback(
    async (userId: string, initialize: boolean, force = false) => {
      if (!force && authorizationUserIdRef.current === userId) return;

      setAuthorizationLoading(true);

      let request = authorizationRequestRef.current;
      if (force || !request || request.userId !== userId) {
        request = {
          promise: loadCurrentAuthorization(initialize),
          userId,
        };
        authorizationRequestRef.current = request;
      }

      const result = await request.promise;
      if (
        !isMountedRef.current ||
        sessionRef.current?.user.id !== userId
      ) {
        return;
      }

      authorizationUserIdRef.current = userId;
      if (authorizationRequestRef.current === request) {
        authorizationRequestRef.current = null;
      }
      setAuthorization(result.authorization);
      setAuthorizationError(result.error);
      setAuthorizationLoading(false);
    },
    [],
  );

  const applySession = useCallback(
    async (nextSession: Session | null) => {
      sessionRef.current = nextSession;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      const userId = nextSession?.user.id;
      if (!userId) {
        resetAuthorization();
        setLoading(false);
        return;
      }

      if (authorizationUserIdRef.current !== userId) {
        setLoading(true);
        await hydrateAuthorization(userId, true);
      }

      if (sessionRef.current?.user.id === userId) {
        setLoading(false);
      }
    },
    [hydrateAuthorization, resetAuthorization],
  );

  useEffect(() => {
    let isMounted = true;
    isMountedRef.current = true;
    const authEventTimers = new Set<ReturnType<typeof setTimeout>>();

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error && __DEV__) {
          console.info("[auth] Unable to restore the persisted session.", {
            message: error.message,
          });
        }
        void applySession(data.session);
      })
      .catch((error: unknown) => {
        if (!isMounted) return;
        if (__DEV__) {
          console.info("[auth] Session initialization failed.", { error });
        }
        void applySession(null);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;

      // Supabase recommends keeping the auth callback synchronous. Deferring
      // the authorization RPC also lets duplicate initial events share a request.
      const timer = setTimeout(() => {
        authEventTimers.delete(timer);
        if (isMounted) void applySession(nextSession);
      }, 0);
      authEventTimers.add(timer);
    });

    return () => {
      isMounted = false;
      isMountedRef.current = false;
      authEventTimers.forEach(clearTimeout);
      subscription.unsubscribe();
    };
  }, [applySession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message ?? null };
  }, []);

  const updateProfile = useCallback(async (fullName: string) => {
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: fullName.trim() },
    });

    if (data.user) {
      setUser(data.user);
      setSession((currentSession) => {
        const nextSession = currentSession
          ? { ...currentSession, user: data.user }
          : currentSession;
        sessionRef.current = nextSession;
        return nextSession;
      });
    }

    return { error: error?.message ?? null };
  }, []);

  const refreshAuthorization = useCallback(async () => {
    const userId = sessionRef.current?.user.id;
    if (!userId) {
      resetAuthorization();
      return;
    }

    await hydrateAuthorization(userId, false, true);
  }, [hydrateAuthorization, resetAuthorization]);

  const hasRole = useCallback(
    (role: string) => authorizationHasRole(authorization, role),
    [authorization],
  );
  const can = useCallback(
    (permission: string) => authorizationCan(authorization, permission),
    [authorization],
  );
  const isAdmin = hasRole(SYSTEM_ROLES.admin);

  const value = useMemo<AuthContextType>(
    () => ({
      authorization,
      authorizationError,
      authorizationLoading,
      can,
      hasRole,
      isAdmin,
      session,
      user,
      loading,
      primaryRole: authorization.primaryRole,
      refreshAuthorization,
      signIn,
      signUp,
      signOut,
      updateProfile,
    }),
    [
      authorization,
      authorizationError,
      authorizationLoading,
      can,
      hasRole,
      isAdmin,
      loading,
      refreshAuthorization,
      session,
      signIn,
      signOut,
      signUp,
      updateProfile,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
