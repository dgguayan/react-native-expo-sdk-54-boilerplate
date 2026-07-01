import { View } from "react-native";

export function Container({ children }: { children: React.ReactNode }) {
  return <View className="flex-1 bg-white px-6 pt-16 pb-8">{children}</View>;
}
