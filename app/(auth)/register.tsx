import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { Input } from "@/components/Input";
import { useAuth } from "@/providers/AuthProvider";
import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

export default function Register() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password)
      return Alert.alert("Error", "Please fill in all fields.");
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) Alert.alert("Sign Up Failed", error);
    else Alert.alert("Success", "Check your email to confirm your account.");
  };

  return (
    <Container>
      <View className="flex-1 justify-center">
        <Text className="mb-8 text-3xl font-bold text-gray-900">
          Create Account
        </Text>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Min. 6 characters"
        />
        <Button
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
        />
        <View className="mt-6 flex-row justify-center">
          <Text className="text-gray-600">Have an account? </Text>
          <Link href="/(auth)/login">
            <Text className="font-semibold text-black">Sign In</Text>
          </Link>
        </View>
      </View>
    </Container>
  );
}
