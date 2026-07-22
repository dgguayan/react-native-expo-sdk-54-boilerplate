import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { Input } from "@/components/Input";
import { useAuth } from "@/providers/AuthProvider";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

export default function Login() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password)
      return Alert.alert("Error", "Please fill in all fields.");
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      Alert.alert("Login Failed", error);
      return;
    }
    router.replace("/(protected)/dashboard");
  };

  return (
    <Container>
      <View className="flex-1 justify-center">
        <Text className="mb-8 text-3xl font-bold text-gray-900">Sign In</Text>
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
          placeholder="••••••••"
        />
        <Button title="Sign In" onPress={handleLogin} loading={loading} />
        <View className="mt-6 flex-row justify-center">
          <Text className="text-gray-600">No account? </Text>
          <Link href="/(auth)/register">
            <Text className="font-semibold text-black">Sign Up</Text>
          </Link>
        </View>
      </View>
    </Container>
  );
}
