import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useState, type ComponentProps, type ReactNode } from "react";
import {
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

import { InlineIcon, inlineStyles } from "@/components/ui/Inline";
import { useAppTheme } from "@/providers/ThemeProvider";

interface InputProps extends TextInputProps {
  error?: string;
  hint?: string;
  icon?: ComponentProps<typeof Ionicons>["name"];
  label?: string;
  trailing?: ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    error,
    hint,
    icon,
    label,
    onBlur,
    onFocus,
    style,
    trailing,
    ...props
  },
  ref,
) {
  const { colors, tokens } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const supportingText = error ?? hint;

  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text
          style={{ color: colors.foreground, fontSize: 14, fontWeight: "500" }}
        >
          {label}
        </Text>
      ) : null}

      <View
        style={[
          inlineStyles.row,
          {
            minHeight: 46,
            gap: tokens.spacing.sm,
            borderWidth: tokens.borders.thin,
            borderColor: error
              ? colors.danger
              : focused
                ? colors.focusRing
                : colors.borderStrong,
            borderRadius: tokens.radii.md,
            backgroundColor: colors.input,
            paddingHorizontal: tokens.spacing.sm,
          },
        ]}
      >
        {icon ? (
          <InlineIcon
            color={focused ? colors.foreground : colors.foregroundMuted}
            name={icon}
            size={18}
          />
        ) : null}
        <TextInput
          ref={ref}
          accessibilityLabel={props.accessibilityLabel ?? label}
          accessibilityState={{ disabled: props.editable === false }}
          autoCapitalize="none"
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={colors.foregroundSubtle}
          selectionColor={colors.brand}
          style={[
            {
              flex: 1,
              minWidth: 0,
              flexShrink: 1,
              paddingVertical: 11,
              color: colors.foreground,
              fontSize: 15,
              lineHeight: 20,
            },
            style,
          ]}
          {...props}
        />
        {trailing}
      </View>

      {supportingText ? (
        <Text
          accessibilityLiveRegion={error ? "polite" : "none"}
          style={{
            color: error ? colors.danger : colors.foregroundMuted,
            fontSize: 12,
            lineHeight: 16,
          }}
        >
          {supportingText}
        </Text>
      ) : null}
    </View>
  );
});
