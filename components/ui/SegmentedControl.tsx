import { useState } from "react";
import {
  Platform,
  Pressable,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAppTheme } from "@/providers/ThemeProvider";

export interface SegmentOption<Value extends string> {
  label: string;
  value: Value;
}

type SegmentedControlVariant = "default" | "status";

type InteractiveViewStyle = ViewStyle & {
  transitionDuration?: string;
  transitionProperty?: string;
  transitionTimingFunction?: string;
};

const webInteractionStyle: InteractiveViewStyle | undefined =
  Platform.OS === "web"
    ? {
        transitionDuration: "160ms",
        transitionProperty: "background-color, border-color, opacity, transform",
        transitionTimingFunction: "ease-out",
      }
    : undefined;

interface SegmentedControlProps<Value extends string> {
  accessibilityLabel: string;
  onChange: (value: Value) => void;
  options: readonly SegmentOption<Value>[];
  value: Value;
  variant?: SegmentedControlVariant;
}

interface SegmentButtonProps {
  compact: boolean;
  grid: boolean;
  label: string;
  onPress: () => void;
  selected: boolean;
  status: boolean;
}

function SegmentButton({
  compact,
  grid,
  label,
  onPress,
  selected,
  status,
}: SegmentButtonProps) {
  const { colors, tokens } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: status ? (grid ? 48 : 44) : 36,
        flexBasis: grid ? "45%" : undefined,
        flexGrow: grid || (!status && compact) ? 1 : 0,
        flexShrink: grid ? 0 : undefined,
        alignItems: status ? "center" : undefined,
        justifyContent: "center",
        borderWidth: tokens.borders.thin,
        borderColor: focused
          ? colors.focusRing
          : selected
            ? status
              ? colors.brand
              : colors.border
            : hovered && status
              ? colors.borderStrong
              : "transparent",
        borderRadius: status ? tokens.radii.md : tokens.radii.sm,
        backgroundColor: selected
          ? status
            ? colors.brandSoft
            : colors.surface
          : (hovered || pressed) && status
            ? colors.surface
            : "transparent",
        paddingHorizontal: status
          ? grid
            ? tokens.spacing.sm
            : tokens.spacing.lg
          : compact
            ? 10
            : tokens.spacing.md,
        paddingVertical: status ? tokens.spacing.xs : undefined,
        opacity: pressed ? 0.76 : 1,
        transform: status ? [{ scale: pressed ? 0.985 : 1 }] : undefined,
        ...webInteractionStyle,
      })}
    >
      {status ? (
        <View
          style={{
            minWidth: 0,
            flexDirection: "row",
            flexWrap: "nowrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            pointerEvents: "none",
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              flexShrink: 0,
              borderRadius: tokens.radii.full,
              backgroundColor: selected ? colors.brand : "transparent",
            }}
          />
          <Text
            ellipsizeMode="tail"
            numberOfLines={1}
            style={{
              minWidth: 0,
              flexShrink: 1,
              color: selected ? colors.brand : colors.foregroundMuted,
              fontSize: 14,
              fontWeight: selected ? "600" : "500",
              textAlign: "center",
            }}
          >
            {label}
          </Text>
        </View>
      ) : (
        <Text
          style={{
            color: selected ? colors.foreground : colors.foregroundMuted,
            fontSize: 13,
            fontWeight: selected ? "600" : "500",
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function SegmentedControl<Value extends string>({
  accessibilityLabel,
  onChange,
  options,
  value,
  variant = "default",
}: SegmentedControlProps<Value>) {
  const { colors, tokens } = useAppTheme();
  const responsive = useResponsiveLayout();
  const status = variant === "status";
  const usePhoneGrid = status && responsive.isPhone;

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="tablist"
      style={{
        alignSelf: usePhoneGrid || responsive.isCompact ? "stretch" : "flex-start",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: status ? tokens.spacing.xs : tokens.spacing.xxs,
        borderWidth: status ? tokens.borders.thin : 0,
        borderColor: colors.border,
        borderRadius: status ? tokens.radii.lg : tokens.radii.md,
        backgroundColor: colors.surfaceMuted,
        padding: status ? tokens.spacing.xs : tokens.spacing.xxs,
      }}
    >
      {options.map((option) => (
        <SegmentButton
          key={option.value}
          compact={responsive.isCompact}
          grid={usePhoneGrid}
          label={option.label}
          onPress={() => onChange(option.value)}
          selected={option.value === value}
          status={status}
        />
      ))}
    </View>
  );
}
