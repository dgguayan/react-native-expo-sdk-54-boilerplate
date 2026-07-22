import { Redirect } from "expo-router";

import { AppLoadingScreen } from "@/components/feedback/AppLoadingScreen";
import { useAuth } from "@/providers/AuthProvider";

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) return <AppLoadingScreen />;

  return session ? (
    <Redirect href="/(protected)/dashboard" />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
