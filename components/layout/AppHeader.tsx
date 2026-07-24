import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { UserAvatar } from "@/components/account/UserAvatar";
import { IconButton } from "@/components/ui/IconButton";
import { inlineStyles } from "@/components/ui/Inline";
import { layout } from "@/constants/theme";
import { useAppShell } from "@/context/AppShellContext";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAppTheme } from "@/providers/ThemeProvider";

interface AppHeaderProps {
  onMenuPress: () => void;
  title: string;
}

export function AppHeader({ onMenuPress, title }: AppHeaderProps) {
  const { colors, resolvedTheme, toggleTheme, tokens } = useAppTheme();
  const { desktopCollapsed, isDesktop } = useAppShell();
  const responsive = useResponsiveLayout();

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ backgroundColor: colors.navbar }}
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
            gap: responsive.isCompact
              ? tokens.spacing.xs
              : tokens.spacing.md,
            borderBottomWidth: tokens.borders.thin,
            borderBottomColor: colors.navbarBorder,
            paddingHorizontal: isDesktop
              ? tokens.spacing.xl
              : responsive.isCompact
                ? tokens.spacing.xs
                : tokens.spacing.md,
          },
        ]}
      >
        <View
          style={[
            inlineStyles.row,
            inlineStyles.fill,
            {
              gap: responsive.isCompact
                ? tokens.spacing.xs
                : tokens.spacing.sm,
            },
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
            style={{
              color: colors.navbarForeground,
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            {title}
          </Text>
        </View>

        <View
          style={[
            inlineStyles.row,
            inlineStyles.icon,
            {
              gap: responsive.isCompact
                ? tokens.spacing.xxs
                : tokens.spacing.xs,
            },
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
