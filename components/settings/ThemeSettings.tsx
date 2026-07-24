import { useEffect, useState } from "react";
import {
  Pressable,
  Text,
  View,
  type DimensionValue,
} from "react-native";

import { Button } from "@/components/Button";
import { Badge } from "@/components/ui/Badge";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  themePresetList,
  type ThemePreset,
  type ThemePresetId,
} from "@/constants/theme-presets";
import type { ThemeMode } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAuth } from "@/providers/AuthProvider";
import { useAppTheme } from "@/providers/ThemeProvider";

const modeOptions = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
] as const;

interface ThemePresetOptionProps {
  disabled: boolean;
  onPress: () => void;
  preset: ThemePreset;
  selected: boolean;
  width: DimensionValue;
}

function ThemePresetOption({
  disabled,
  onPress,
  preset,
  selected,
  width,
}: ThemePresetOptionProps) {
  const { colors, tokens } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { radii, spacing } = tokens;

  return (
    <Pressable
      accessibilityLabel={`${preset.label} application theme`}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={onPress}
      style={({ pressed }) => ({
        width,
        minWidth: 0,
        minHeight: 148,
        borderWidth: selected ? tokens.borders.strong : tokens.borders.thin,
        borderColor: focused
          ? colors.focusRing
          : selected
            ? colors.brand
            : hovered
              ? colors.borderStrong
              : colors.border,
        borderRadius: radii.lg,
        backgroundColor: selected
          ? colors.brandSoft
          : hovered
            ? colors.surfaceMuted
            : colors.surface,
        padding: spacing.md,
        opacity: disabled ? 0.62 : pressed ? 0.78 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: spacing.sm,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {preset.preview.map((color, index) => (
            <View
              key={color}
              style={{
                width: 24,
                height: 24,
                marginLeft: index === 0 ? 0 : -5,
                borderWidth: 2,
                borderColor: selected ? colors.brandSoft : colors.surface,
                borderRadius: radii.full,
                backgroundColor: color,
              }}
            />
          ))}
        </View>
        {selected ? <Badge label="Selected" tone="brand" /> : null}
      </View>

      <Text
        numberOfLines={1}
        style={{
          marginTop: spacing.md,
          color: selected ? colors.brand : colors.foreground,
          fontSize: 14,
          fontWeight: "700",
        }}
      >
        {preset.label}
      </Text>
      <Text
        numberOfLines={2}
        style={{
          marginTop: spacing.xs,
          color: colors.foregroundMuted,
          fontSize: 12,
          lineHeight: 17,
        }}
      >
        {preset.description}
      </Text>
    </Pressable>
  );
}

export function ThemeSettings() {
  const {
    authorizationError,
    authorizationLoading,
    isAdmin,
    refreshAuthorization,
  } = useAuth();
  const {
    activePresetId,
    colors,
    mode,
    retryThemeSync,
    savePreset,
    setMode,
    syncState,
    tokens,
  } = useAppTheme();
  const responsive = useResponsiveLayout();
  const canManage = isAdmin && !authorizationLoading;
  const [selectedPresetId, setSelectedPresetId] =
    useState<ThemePresetId>(activePresetId);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const { radii, spacing } = tokens;
  const presetWidth: DimensionValue = responsive.isPhone
    ? "100%"
    : responsive.width >= 1180
      ? "23.5%"
      : "48%";
  const remoteSettingNeedsRepair =
    syncState.status === "missing" || syncState.status === "invalid";
  const persistenceUnavailable =
    syncState.status === "syncing" ||
    syncState.status === "unconfigured" ||
    syncState.status === "forbidden" ||
    syncState.status === "offline" ||
    syncState.status === "error";
  const showRetry =
    syncState.status === "unconfigured" ||
    syncState.status === "forbidden" ||
    syncState.status === "offline" ||
    syncState.status === "error";

  useEffect(() => {
    setSelectedPresetId(activePresetId);
  }, [activePresetId]);

  const handleSave = async () => {
    if (
      !canManage ||
      (selectedPresetId === activePresetId && !remoteSettingNeedsRepair)
    ) {
      return;
    }
    setSaving(true);
    setSaved(false);
    setSaveError(null);

    const result = await savePreset(selectedPresetId);
    setSaving(false);
    if (result.error) {
      setSaveError(result.error);
      return;
    }

    setSaved(true);
  };

  return (
    <View style={{ gap: responsive.isMobile ? spacing.lg : spacing.xl }}>
      <View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.sm,
          }}
        >
          <View style={{ minWidth: 0, flex: 1 }}>
            <Text
              style={{
                color: colors.foreground,
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Application theme
            </Text>
            <Text
              style={{
                marginTop: 3,
                color: colors.foregroundMuted,
                fontSize: 12,
                lineHeight: 17,
              }}
            >
              The saved preset is shared across public and authenticated screens.
            </Text>
          </View>
          <Badge
            label={canManage ? "Administrator" : "Read only"}
            tone={canManage ? "brand" : "neutral"}
          />
        </View>

        <View
          accessibilityLabel="Application theme presets"
          accessibilityRole="radiogroup"
          style={{
            marginTop: spacing.md,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.sm,
          }}
        >
          {themePresetList.map((preset) => (
            <ThemePresetOption
              key={preset.id}
              disabled={!canManage}
              onPress={() => {
                setSaved(false);
                setSaveError(null);
                setSelectedPresetId(preset.id);
              }}
              preset={preset}
              selected={preset.id === selectedPresetId}
              width={presetWidth}
            />
          ))}
        </View>

        <View
          style={{
            marginTop: spacing.md,
            flexDirection: responsive.isCompact ? "column" : "row",
            alignItems: responsive.isCompact ? "stretch" : "center",
            justifyContent: "space-between",
            gap: spacing.sm,
          }}
        >
          <View style={{ minWidth: 0, flex: 1 }}>
            {saveError || authorizationError || syncState.message ? (
              <Text
                accessibilityLiveRegion="polite"
                style={{
                  color:
                    saveError ||
                    authorizationError ||
                    syncState.status === "forbidden" ||
                    syncState.status === "error"
                      ? colors.danger
                      : syncState.status === "unconfigured" ||
                          syncState.status === "invalid" ||
                          syncState.status === "missing"
                        ? colors.warning
                        : colors.foregroundMuted,
                  fontSize: 12,
                  lineHeight: 17,
                }}
              >
                {saveError ?? authorizationError ?? syncState.message}
              </Text>
            ) : saved ? (
              <Text
                accessibilityLiveRegion="polite"
                style={{ color: colors.success, fontSize: 12, lineHeight: 17 }}
              >
                Theme saved and applied across the application.
              </Text>
            ) : !canManage ? (
              <Text
                style={{
                  color: colors.foregroundMuted,
                  fontSize: 12,
                  lineHeight: 17,
                }}
              >
                The Admin role is required to change this application setting.
              </Text>
            ) : null}
          </View>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              gap: spacing.xs,
            }}
          >
            {authorizationError ? (
              <Button
                icon="shield-checkmark-outline"
                loading={authorizationLoading}
                onPress={() => void refreshAuthorization()}
                title="Retry access"
                variant="secondary"
              />
            ) : null}
            {showRetry ? (
              <Button
                icon="refresh-outline"
                onPress={retryThemeSync}
                title="Retry sync"
                variant="secondary"
              />
            ) : null}
            <Button
              disabled={
                !canManage ||
                saving ||
                persistenceUnavailable ||
                (selectedPresetId === activePresetId &&
                  !remoteSettingNeedsRepair)
              }
              icon="save-outline"
              loading={saving}
              onPress={handleSave}
              title={
                remoteSettingNeedsRepair
                  ? "Create theme setting"
                  : "Save application theme"
              }
            />
          </View>
        </View>
      </View>

      <View
        style={{
          height: tokens.borders.thin,
          backgroundColor: colors.border,
        }}
      />

      <View
        style={{
          borderRadius: radii.md,
          backgroundColor: colors.surfaceMuted,
          padding: responsive.isCompact ? spacing.sm : spacing.md,
        }}
      >
        <Text
          style={{
            color: colors.foreground,
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          Display mode
        </Text>
        <Text
          style={{
            marginTop: 3,
            marginBottom: spacing.sm,
            color: colors.foregroundMuted,
            fontSize: 12,
            lineHeight: 17,
          }}
        >
          This preference is personal to this device. System follows the OS setting.
        </Text>
        <SegmentedControl<ThemeMode>
          accessibilityLabel="Display mode"
          onChange={setMode}
          options={modeOptions}
          value={mode}
        />
      </View>
    </View>
  );
}
