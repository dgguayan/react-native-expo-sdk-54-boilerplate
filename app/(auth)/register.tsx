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

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const { colors } = useAppTheme();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const normalizedEmail = email.trim();
    const nextEmailError = EMAIL_PATTERN.test(normalizedEmail)
      ? undefined
      : "Enter a valid email address.";
    const nextPasswordError =
      password.length >= 6 ? undefined : "Use at least 6 characters.";
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError(null);
    setSuccessMessage(null);

    if (nextEmailError || nextPasswordError) return;

    setLoading(true);
    const { error } = await signUp(normalizedEmail, password);
    setLoading(false);
    if (error) {
      setFormError(error);
      return;
    }

    setSuccessMessage(
      "Your account was created. Check your inbox to confirm your email before signing in.",
    );
  };

  return (
    <AuthScaffold
      title="Create your account"
      subtitle="Set up your workspace access in a few seconds."
      footer={
        <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap" }}>
          <Text style={{ color: colors.foregroundMuted, fontSize: 14 }}>
            Already have an account?{" "}
          </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable accessibilityRole="link">
              <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>
                Sign in
              </Text>
            </Pressable>
          </Link>
        </View>
      }
    >
      {formError || successMessage ? (
        <View
          accessibilityLiveRegion="polite"
          accessibilityRole={formError ? "alert" : undefined}
          style={{
            borderRadius: radii.md,
            backgroundColor: formError ? colors.dangerSoft : colors.successSoft,
            padding: spacing.sm,
          }}
        >
          <Text
            style={{
              color: formError ? colors.danger : colors.success,
              fontSize: 13,
              lineHeight: 19,
            }}
          >
            {formError ?? successMessage}
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
        autoComplete="new-password"
        error={passwordError}
        hint="At least 6 characters"
        icon="lock-closed-outline"
        label="Password"
        onChangeText={(value) => {
          setPassword(value);
          if (passwordError) setPasswordError(undefined);
        }}
        onSubmitEditing={handleRegister}
        placeholder="Create a secure password"
        returnKeyType="done"
        secureTextEntry
        textContentType="newPassword"
        value={password}
      />
      <Button
        fullWidth
        loading={loading}
        onPress={handleRegister}
        title="Create account"
      />
    </AuthScaffold>
  );
}
