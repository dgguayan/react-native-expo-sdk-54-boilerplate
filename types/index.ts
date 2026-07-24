import { Session, User } from "@supabase/supabase-js";

import type { AuthorizationSnapshot } from "@/constants/authorization";

export interface AuthContextType {
  authorization: AuthorizationSnapshot;
  authorizationError: string | null;
  authorizationLoading: boolean;
  can: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isAdmin: boolean;
  primaryRole: string | null;
  refreshAuthorization: () => Promise<void>;
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  updateProfile: (fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
}
