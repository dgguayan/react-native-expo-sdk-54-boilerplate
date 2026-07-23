import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { UserAvatar } from "@/components/account/UserAvatar";
import { IconButton } from "@/components/ui/IconButton";
import { inlineStyles } from "@/components/ui/Inline";
import { layout, spacing } from "@/constants/theme";
import { useAppShell } from "@/context/AppShellContext";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAppTheme } from "@/providers/ThemeProvider";

interface AppHeaderProps {
  onMenuPress: () => void;
  title: string;
}

export function AppHeader({ onMenuPress, title }: AppHeaderProps) {
  const { colors, resolvedTheme, toggleTheme } = useAppTheme();
  const { desktopCollapsed, isDesktop } = useAppShell();
  const responsive = useResponsiveLayout();

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ backgroundColor: colors.surface }}
    >
      <View
        accessibilityRole="toolbar"
        style={[
          inlineStyles.row,
          {
            minHeight: responsive.isCompact
              ? 56
              : responsive.isMobile
                ? 60
                : layout.headerHeight,
            justifyContent: "space-between",
            gap: responsive.isCompact ? spacing.xs : spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingHorizontal: isDesktop
              ? spacing.xl
              : responsive.isCompact
                ? spacing.xs
                : spacing.md,
          },
        ]}
      >
        <View
          style={[
            inlineStyles.row,
            inlineStyles.fill,
            { gap: responsive.isCompact ? spacing.xs : spacing.sm },
          ]}
        >
          <IconButton
            icon={
              isDesktop
                ? desktopCollapsed
                  ? "chevron-forward-outline"
                  : "chevron-back-outline"
                : "menu-outline"
            }
            label={isDesktop ? "Collapse or expand sidebar" : "Open navigation menu"}
            onPress={onMenuPress}
          />
          {isDesktop ? (
            <>
              <Text style={{ color: colors.foregroundMuted, fontSize: 13 }}>
                Workspace
              </Text>
              <Text style={{ color: colors.foregroundSubtle, fontSize: 13 }}>
                /
              </Text>
            </>
          ) : null}
          <Text
            numberOfLines={1}
            style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}
          >
            {title}
          </Text>
        </View>

        <View
          style={[
            inlineStyles.row,
            inlineStyles.icon,
            { gap: responsive.isCompact ? spacing.xxs : spacing.xs },
          ]}
        >
          <IconButton
            icon={resolvedTheme === "dark" ? "sunny-outline" : "moon-outline"}
            label={
              resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"
            }
            onPress={toggleTheme}
          />
          <UserAvatar size={responsive.isCompact ? 30 : 34} />
        </View>
      </View>
    </SafeAreaView>
  );
}
