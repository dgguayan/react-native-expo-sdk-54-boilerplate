import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Inline, inlineStyles } from "@/components/ui/Inline";
import { radii, spacing } from "@/constants/theme";
import { useAppTheme } from "@/providers/ThemeProvider";

interface AppLogoProps {
  compact?: boolean;
  inverse?: boolean;
}

export function AppLogo({ compact = false, inverse = false }: AppLogoProps) {
  const { colors } = useAppTheme();
  const markBackground = inverse ? colors.primaryForeground : colors.primary;
  const markForeground = inverse ? colors.primary : colors.primaryForeground;
  const titleColor = inverse ? colors.primaryForeground : colors.foreground;
  const subtitleColor = inverse
    ? colors.primaryForeground
    : colors.foregroundMuted;

  return (
    <Inline gap={spacing.sm}>
      <View
        style={[
          inlineStyles.icon,
          {
            width: 36,
            height: 36,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radii.md,
            backgroundColor: markBackground,
          },
        ]}
      >
        <Ionicons name="layers-outline" size={20} color={markForeground} />
      </View>
      {!compact ? (
        <View style={inlineStyles.content}>
          <Text
            numberOfLines={1}
            style={{ color: titleColor, fontSize: 15, fontWeight: "700" }}
          >
            Workspace
          </Text>
          <Text
            numberOfLines={1}
            style={{
              marginTop: 1,
              color: subtitleColor,
              fontSize: 11,
              opacity: inverse ? 0.65 : 1,
            }}
          >
            Command center
          </Text>
        </View>
      ) : null}
    </Inline>
  );
}
