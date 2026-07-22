import { Link } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { AuthScaffold } from "@/components/auth/AuthScaffold";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { radii, spacing } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";
import { useAppTheme } from "@/providers/ThemeProvider";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { colors } = useAppTheme();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const normalizedEmail = email.trim();
    const nextEmailError = EMAIL_PATTERN.test(normalizedEmail)
      ? undefined
      : "Enter a valid email address.";
    const nextPasswordError = password ? undefined : "Enter your password.";
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError(null);

    if (nextEmailError || nextPasswordError) return;

    setLoading(true);
    const { error } = await signIn(normalizedEmail, password);
    setLoading(false);
    if (error) setFormError(error);
  };

  return (
    <AuthScaffold
      title="Welcome back"
      subtitle="Sign in to continue to your workspace."
      footer={
        <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap" }}>
          <Text style={{ color: colors.foregroundMuted, fontSize: 14 }}>
            New to Workspace?{" "}
          </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable accessibilityRole="link">
              <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>
                Create an account
              </Text>
            </Pressable>
          </Link>
        </View>
      }
    >
      {formError ? (
        <View
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          style={{
            borderRadius: radii.md,
            backgroundColor: colors.dangerSoft,
            padding: spacing.sm,
          }}
        >
          <Text style={{ color: colors.danger, fontSize: 13, lineHeight: 19 }}>
            {formError}
          </Text>
        </View>
      ) : null}
      <Input
        autoComplete="email"
        error={emailError}
        icon="mail-outline"
        keyboardType="email-address"
        label="Email address"
        onChangeText={(value) => {
          setEmail(value);
          if (emailError) setEmailError(undefined);
        }}
        onSubmitEditing={() => passwordRef.current?.focus()}
        placeholder="you@example.com"
        returnKeyType="next"
        textContentType="emailAddress"
        value={email}
      />
      <Input
        ref={passwordRef}
        autoComplete="current-password"
        error={passwordError}
        icon="lock-closed-outline"
        label="Password"
        onChangeText={(value) => {
          setPassword(value);
          if (passwordError) setPasswordError(undefined);
        }}
        onSubmitEditing={handleLogin}
        placeholder="Enter your password"
        returnKeyType="done"
        secureTextEntry
        textContentType="password"
        value={password}
      />
      <Button
        fullWidth
        loading={loading}
        onPress={handleLogin}
        title="Sign in"
      />
    </AuthScaffold>
  );
}
