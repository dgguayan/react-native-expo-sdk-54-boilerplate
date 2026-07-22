import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { Switch, Text, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { radii, spacing, type ThemeMode } from "@/constants/theme";
import { useAppShell } from "@/context/AppShellContext";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAuth } from "@/providers/AuthProvider";
import { useAppTheme } from "@/providers/ThemeProvider";

const PREFERENCES_STORAGE_KEY = "workspace-device-preferences";

interface DevicePreferences {
  projectUpdates: boolean;
  weeklySummary: boolean;
}

const defaultPreferences: DevicePreferences = {
  projectUpdates: true,
  weeklySummary: true,
};

const themeOptions = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
] as const;

function SettingsSection({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  const { colors } = useAppTheme();
  const responsive = useResponsiveLayout();

  return (
    <Card>
      <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>{title}</Text>
      <Text style={{ marginTop: 4, color: colors.foregroundMuted, fontSize: 13, lineHeight: 19 }}>
        {description}
      </Text>
      <View
        style={{ marginTop: responsive.isMobile ? spacing.md : spacing.lg }}
      >
        {children}
      </View>
    </Card>
  );
}

function PreferenceRow({
  description,
  label,
  onValueChange,
  value,
}: {
  description: string;
  label: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
}) {
  const { colors } = useAppTheme();
  const responsive = useResponsiveLayout();

  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: responsive.isCompact ? spacing.sm : spacing.lg }}>
      <View style={{ minWidth: 0, flex: 1 }}>
        <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "500" }}>{label}</Text>
        <Text style={{ marginTop: 3, color: colors.foregroundMuted, fontSize: 12, lineHeight: 17 }}>
          {description}
        </Text>
      </View>
      <Switch
        accessibilityLabel={label}
        ios_backgroundColor={colors.borderStrong}
        onValueChange={onValueChange}
        thumbColor="#FFFFFF"
        trackColor={{ false: colors.borderStrong, true: colors.brand }}
        value={value}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const { colors, mode, setMode } = useAppTheme();
  const { user } = useAuth();
  const { drawerWidth, isDesktop } = useAppShell();
  const responsive = useResponsiveLayout(isDesktop ? drawerWidth : 0);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem(PREFERENCES_STORAGE_KEY)
      .then((value) => {
        if (!isMounted || !value) return;
        const stored = JSON.parse(value) as Partial<DevicePreferences>;
        setPreferences({ ...defaultPreferences, ...stored });
      })
      .catch(() => undefined);
    return () => {
      isMounted = false;
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  const updatePreference = (key: keyof DevicePreferences, value: boolean) => {
    setPreferences((current) => {
      const next = { ...current, [key]: value };
      AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(next))
        .then(() => {
          setSaved(true);
          if (savedTimer.current) clearTimeout(savedTimer.current);
          savedTimer.current = setTimeout(() => setSaved(false), 1600);
        })
        .catch(() => undefined);
      return next;
    });
  };

  return (
    <Screen
      title="Settings"
      description="Manage appearance, device preferences, and account details."
      action={saved ? <Badge label="Saved" tone="success" /> : null}
      contentStyle={{ maxWidth: 960 }}
    >
      <View style={{ gap: responsive.sectionGap }}>
        <SettingsSection
          title="Appearance"
          description="Choose how Workspace looks on this device. System follows your OS preference."
        >
          <SegmentedControl<ThemeMode>
            accessibilityLabel="Theme preference"
            onChange={setMode}
            options={themeOptions}
            value={mode}
          />
        </SettingsSection>

        <SettingsSection
          title="Notifications"
          description="These preferences are stored locally and apply to this device."
        >
          <View
            style={{ gap: responsive.isMobile ? spacing.md : spacing.xl }}
          >
            <PreferenceRow
              label="Project updates"
              description="Receive updates when project status or ownership changes."
              value={preferences.projectUpdates}
              onValueChange={(value) => updatePreference("projectUpdates", value)}
            />
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <PreferenceRow
              label="Weekly summary"
              description="Receive a concise weekly digest of workspace activity."
              value={preferences.weeklySummary}
              onValueChange={(value) => updatePreference("weeklySummary", value)}
            />
          </View>
        </SettingsSection>

        <SettingsSection
          title="Account"
          description="Your authenticated Supabase account for this workspace."
        >
          <View
            style={{
              flexDirection: responsive.isCompact ? "column" : "row",
              alignItems: responsive.isCompact ? "flex-start" : "center",
              justifyContent: "space-between",
              gap: responsive.isCompact ? spacing.sm : spacing.md,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radii.md,
              backgroundColor: colors.surfaceMuted,
              padding: responsive.isCompact ? spacing.sm : spacing.md,
            }}
          >
            <View style={{ minWidth: 0, flex: 1 }}>
              <Text style={{ color: colors.foregroundMuted, fontSize: 11, fontWeight: "600", textTransform: "uppercase" }}>
                Email address
              </Text>
              <Text numberOfLines={1} style={{ marginTop: 4, color: colors.foreground, fontSize: 14, fontWeight: "500" }}>
                {user?.email ?? "Not available"}
              </Text>
            </View>
            <Badge label={user?.email_confirmed_at ? "Verified" : "Pending"} tone={user?.email_confirmed_at ? "success" : "warning"} />
          </View>
        </SettingsSection>
      </View>
    </Screen>
  );
}
