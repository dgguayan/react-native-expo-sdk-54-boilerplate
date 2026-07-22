import { useSidebar } from "@/context/SidebarContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

export function MobileHeader() {
  const { openMobile } = useSidebar();

  return (
    <View className="flex-row items-center border-b border-gray-200 bg-white px-4 py-3">
      <Pressable
        onPress={openMobile}
        accessibilityRole="button"
        accessibilityLabel="Open navigation menu"
        className="mr-3 rounded-md p-1.5"
      >
        <Ionicons name="menu" size={24} color="#111827" />
      </Pressable>
      <Text className="text-lg font-bold text-gray-900">MyApp</Text>
    </View>
  );
}
