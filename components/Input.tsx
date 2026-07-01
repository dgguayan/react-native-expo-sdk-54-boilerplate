import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
}

export function Input({ label, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-1 text-sm font-medium text-gray-700">{label}</Text>
      )}
      <TextInput
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900"
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        {...props}
      />
    </View>
  );
}
