import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";

import { UserAvatar } from "@/components/account/UserAvatar";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Screen } from "@/components/layout/Screen";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Inline, inlineStyles } from "@/components/ui/Inline";
import { radii, spacing } from "@/constants/theme";
import { useAppShell } from "@/context/AppShellContext";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { getUserDisplayName, getUserRole } from "@/lib/user-profile";
import { useAuth } from "@/providers/AuthProvider";
import { useAppTheme } from "@/providers/ThemeProvider";

function formatMemberSince(createdAt?: string): string {
  if (!createdAt) return "Not available";

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(date);
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const { colors } = useAppTheme();
  const responsive = useResponsiveLayout();

  return (
    <Inline gap={spacing.sm}>
      <View
        style={[
          inlineStyles.icon,
          {
            width: responsive.isCompact ? 32 : 36,
            height: responsive.isCompact ? 32 : 36,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radii.md,
            backgroundColor: colors.accent,
          },
        ]}
      >
        <Ionicons name={icon} size={17} color={colors.foregroundMuted} />
      </View>
      <View style={inlineStyles.fill}>
        <Text
          style={{
            color: colors.foregroundSubtle,
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Text>
        <Text
          numberOfLines={1}
          style={{ marginTop: 3, color: colors.foreground, fontSize: 13, fontWeight: "500" }}
        >
          {value}
        </Text>
      </View>
    </Inline>
  );
}

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const { updateProfile, user } = useAuth();
  const { drawerWidth, isDesktop } = useAppShell();
  const responsive = useResponsiveLayout(isDesktop ? drawerWidth : 0);
  const [fullName, setFullName] = useState(() => getUserDisplayName(user));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stacked = responsive.contentWidth < 720;

  useEffect(() => {
    setFullName(getUserDisplayName(user));
  }, [user]);

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    [],
  );

  const handleSave = async () => {
    const normalizedName = fullName.trim();
    setError(null);
    setSaved(false);

    if (normalizedName.length < 2) {
      setError("Enter a name with at least 2 characters.");
      return;
    }

    setSaving(true);
    const result = await updateProfile(normalizedName);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setFullName(normalizedName);
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 1800);
  };

  return (
    <Screen
      title="Profile"
      description="Manage the personal details shown throughout your workspace."
      action={saved ? <Badge label="Profile saved" tone="success" /> : null}
      contentStyle={{ maxWidth: 980 }}
    >
      <View
        style={{
          flexDirection: stacked ? "column" : "row",
          alignItems: "flex-start",
          gap: responsive.sectionGap,
        }}
      >
        <Card style={{ width: stacked ? "100%" : 300 }}>
          <View
            style={[
              responsive.isMobile ? inlineStyles.row : undefined,
              {
                flexDirection: responsive.isMobile ? "row" : "column",
                alignItems: "center",
                gap: responsive.isMobile ? spacing.sm : 0,
                paddingVertical: responsive.isMobile ? 0 : spacing.sm,
              },
            ]}
          >
            <View style={inlineStyles.icon}>
              <UserAvatar
                showStatus
                size={responsive.isCompact ? 52 : responsive.isMobile ? 60 : 76}
              />
            </View>
            <View
              style={{
                minWidth: 0,
                flex: responsive.isMobile ? 1 : undefined,
                alignItems: responsive.isMobile ? "flex-start" : "center",
              }}
            >
              <Text
                accessibilityRole="header"
                numberOfLines={1}
                style={{
                  marginTop: responsive.isMobile ? 0 : spacing.md,
                  color: colors.foreground,
                  fontSize: responsive.isCompact ? 16 : 18,
                  fontWeight: "700",
                }}
              >
                {getUserDisplayName(user)}
              </Text>
              <Text
                numberOfLines={1}
                style={{ marginTop: 4, color: colors.foregroundMuted, fontSize: 13 }}
              >
                {user?.email ?? "Email unavailable"}
              </Text>
              <View style={{ marginTop: responsive.isCompact ? spacing.xs : spacing.sm }}>
                <Badge label={getUserRole(user)} tone="brand" />
              </View>
            </View>
          </View>

          <View
            style={{
              height: 1,
              marginVertical: responsive.isMobile ? spacing.md : spacing.lg,
              backgroundColor: colors.border,
            }}
          />

          <View style={{ gap: responsive.isCompact ? spacing.sm : spacing.md }}>
            <DetailRow
              icon="checkmark-circle-outline"
              label="Status"
              value="Online"
            />
            <DetailRow
              icon="calendar-outline"
              label="Member since"
              value={formatMemberSince(user?.created_at)}
            />
            <DetailRow
              icon="shield-checkmark-outline"
              label="Email status"
              value={user?.email_confirmed_at ? "Verified" : "Pending verification"}
            />
          </View>
        </Card>

        <Card style={{ width: stacked ? "100%" : undefined, flex: stacked ? undefined : 1 }}>
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700" }}>
            Personal information
          </Text>
          <Text
            style={{
              marginTop: 5,
              color: colors.foregroundMuted,
              fontSize: 13,
              lineHeight: 19,
            }}
          >
            Keep your profile recognizable for teammates and collaborators.
          </Text>

          <View
            style={{
              marginTop: responsive.isMobile ? spacing.md : spacing.xl,
              gap: responsive.isMobile ? spacing.md : spacing.lg,
            }}
          >
            <Input
              autoCapitalize="words"
              autoComplete="name"
              error={error ?? undefined}
              icon="person-outline"
              label="Full name"
              onChangeText={(value) => {
                setFullName(value);
                if (error) setError(null);
              }}
              onSubmitEditing={handleSave}
              placeholder="Your full name"
              returnKeyType="done"
              value={fullName}
            />
            <Input
              editable={false}
              icon="mail-outline"
              label="Email address"
              value={user?.email ?? ""}
              hint="Your email is managed by your authentication provider."
            />
          </View>

          <View
            style={{
              marginTop: responsive.isMobile ? spacing.lg : spacing.xl,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: spacing.sm,
            }}
          >
            {saved ? (
              <Text
                accessibilityLiveRegion="polite"
                style={{ color: colors.success, fontSize: 12, fontWeight: "600" }}
              >
                Changes saved
              </Text>
            ) : null}
            <Button
              icon="checkmark-outline"
              loading={saving}
              onPress={handleSave}
              title="Save changes"
            />
          </View>
        </Card>
      </View>
    </Screen>
  );
}
