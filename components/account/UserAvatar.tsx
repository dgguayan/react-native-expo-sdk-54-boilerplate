import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";

import {
  getUserAvatarUrl,
  getUserInitials,
} from "@/lib/user-profile";
import { useAuth } from "@/providers/AuthProvider";
import { useAppTheme } from "@/providers/ThemeProvider";

interface UserAvatarProps {
  showStatus?: boolean;
  size?: number;
}

export function UserAvatar({ showStatus = false, size = 40 }: UserAvatarProps) {
  const { user } = useAuth();
  const { colors, tokens } = useAppTheme();
  const avatarUrl = getUserAvatarUrl(user);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [avatarUrl]);

  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        accessibilityLabel={`${getUserInitials(user)} avatar`}
        accessibilityRole="image"
        style={{
          width: size,
          height: size,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: tokens.radii.full,
          backgroundColor: colors.brandSoft,
        }}
      >
        {avatarUrl && !imageFailed ? (
          <Image
            accessibilityIgnoresInvertColors
            onError={() => setImageFailed(true)}
            resizeMode="cover"
            source={{ uri: avatarUrl }}
            style={{ width: size, height: size }}
          />
        ) : (
          <Text
            style={{
              color: colors.brand,
              fontSize: Math.max(10, Math.round(size * 0.3)),
              fontWeight: "700",
            }}
          >
            {getUserInitials(user)}
          </Text>
        )}
      </View>

      {showStatus ? (
        <View
          accessibilityLabel="Online"
          style={{
            position: "absolute",
            right: -1,
            bottom: -1,
            width: Math.max(10, Math.round(size * 0.28)),
            height: Math.max(10, Math.round(size * 0.28)),
            borderWidth: 2,
            borderColor: colors.surface,
            borderRadius: tokens.radii.full,
            backgroundColor: colors.success,
          }}
        />
      ) : null}
    </View>
  );
}
