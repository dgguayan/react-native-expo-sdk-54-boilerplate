import { Container } from "@/components/Container";
import { useAuth } from "@/providers/AuthProvider";
import { Text, View } from "react-native";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <Container>
      <View className="flex-1 justify-between">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Dashboard</Text>
          <Text className="mt-2 text-gray-500">{user?.email}</Text>
        </View>
      </View>
    </Container>
  );
}
