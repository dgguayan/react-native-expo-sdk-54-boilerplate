import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface ButtonProps {
  onPress: () => void;
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary";
}

export function Button({
  onPress,
  title,
  loading,
  variant = "primary",
}: ButtonProps) {
  const base = "w-full items-center rounded-lg py-3.5";
  const styles =
    variant === "primary"
      ? `${base} bg-black`
      : `${base} border border-gray-300 bg-white`;

  return (
    <TouchableOpacity className={styles} onPress={onPress} disabled={loading}>
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#000"} />
      ) : (
        <Text
          className={`text-base font-semibold ${variant === "primary" ? "text-white" : "text-gray-900"}`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
