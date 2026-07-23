import { useState } from "react";
import { Text, View } from "react-native";

import { StateView } from "@/components/feedback/StateView";
import { Screen } from "@/components/layout/Screen";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { InlineIconLabel, inlineStyles } from "@/components/ui/Inline";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { radii, spacing } from "@/constants/theme";
import { useAppShell } from "@/context/AppShellContext";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAppTheme } from "@/providers/ThemeProvider";

type TeamTab = "members" | "invitations";

const tabs = [
  { label: "Members (6)", value: "members" },
  { label: "Invitations (0)", value: "invitations" },
] as const;

const members = [
  { name: "Ana Martinez", email: "ana@example.com", role: "Owner", initials: "AM", online: true },
  { name: "Jordan Davis", email: "jordan@example.com", role: "Admin", initials: "JD", online: true },
  { name: "Sam Kim", email: "sam@example.com", role: "Designer", initials: "SK", online: false },
  { name: "Kai Rivera", email: "kai@example.com", role: "Developer", initials: "KR", online: true },
  { name: "Lena Novak", email: "lena@example.com", role: "Analyst", initials: "LN", online: false },
  { name: "Morgan Wu", email: "morgan@example.com", role: "Developer", initials: "MW", online: false },
] as const;

export default function TeamsScreen() {
  const { colors } = useAppTheme();
  const { drawerWidth, isDesktop } = useAppShell();
  const responsive = useResponsiveLayout(isDesktop ? drawerWidth : 0);
  const [activeTab, setActiveTab] = useState<TeamTab>("members");
  const showEmail = responsive.contentWidth >= 700;
  const roleWidth = responsive.isCompact
    ? 80
    : responsive.isMobile
      ? 80
      : 92;
  const rowPadding = responsive.isCompact
    ? spacing.sm
    : responsive.isMobile
      ? spacing.md
      : spacing.lg;

  return (
    <Screen
      title="Teams"
      description="Understand who has access and how responsibilities are distributed."
      action={<Badge label="6 members" tone="brand" />}
    >
      <View
        style={{ marginBottom: responsive.isMobile ? spacing.md : spacing.lg }}
      >
        <SegmentedControl
          accessibilityLabel="Team view"
          onChange={setActiveTab}
          options={tabs}
          value={activeTab}
        />
      </View>

      {activeTab === "invitations" ? (
        <StateView
          title="No pending invitations"
          description="Everyone you invited has joined the workspace. New invitations will appear here."
          icon="mail-open-outline"
        />
      ) : (
        <Card padded={false} style={{ overflow: "hidden" }}>
          <View
            style={{
              minHeight: responsive.isCompact ? 40 : 46,
              flexDirection: "row",
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              backgroundColor: colors.surfaceMuted,
              paddingHorizontal: rowPadding,
            }}
          >
            <Text style={{ flex: 1.4, color: colors.foregroundMuted, fontSize: 11, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" }}>
              Member
            </Text>
            {showEmail ? (
              <Text style={{ flex: 1, color: colors.foregroundMuted, fontSize: 11, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" }}>
                Email
              </Text>
            ) : null}
            <Text style={{ width: roleWidth, color: colors.foregroundMuted, fontSize: 11, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" }}>
              Role
            </Text>
          </View>

          {members.map((member, index) => (
            <View
              key={member.email}
              accessibilityLabel={`${member.name}, ${member.role}, ${member.online ? "online" : "offline"}`}
              style={{
                minHeight: responsive.isCompact ? 58 : responsive.isMobile ? 62 : 68,
                flexDirection: "row",
                alignItems: "center",
                borderBottomWidth: index === members.length - 1 ? 0 : 1,
                borderBottomColor: colors.border,
                paddingHorizontal: rowPadding,
              }}
            >
              <View
                style={[
                  inlineStyles.row,
                  { minWidth: 0, flex: 1.4, gap: spacing.sm },
                ]}
              >
                <View style={[inlineStyles.icon, { position: "relative" }]}>
                  <View
                    style={{
                      width: responsive.isCompact ? 34 : 38,
                      height: responsive.isCompact ? 34 : 38,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: radii.full,
                      backgroundColor: index % 2 === 0 ? colors.brandSoft : colors.accent,
                    }}
                  >
                    <Text style={{ color: index % 2 === 0 ? colors.brand : colors.foreground, fontSize: 11, fontWeight: "700" }}>
                      {member.initials}
                    </Text>
                  </View>
                  <View
                    style={{
                      position: "absolute",
                      right: -1,
                      bottom: -1,
                      width: 11,
                      height: 11,
                      borderWidth: 2,
                      borderColor: colors.surface,
                      borderRadius: radii.full,
                      backgroundColor: member.online ? colors.success : colors.foregroundSubtle,
                    }}
                  />
                </View>
                <View style={inlineStyles.fill}>
                  <Text numberOfLines={1} style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>
                    {member.name}
                  </Text>
                  {!showEmail ? (
                    <Text numberOfLines={1} style={{ marginTop: 2, color: colors.foregroundMuted, fontSize: 11 }}>
                      {member.email}
                    </Text>
                  ) : null}
                </View>
              </View>
              {showEmail ? (
                <Text numberOfLines={1} style={{ flex: 1, color: colors.foregroundMuted, fontSize: 13 }}>
                  {member.email}
                </Text>
              ) : null}
              <InlineIconLabel
                color={colors.foregroundMuted}
                containerStyle={{ width: roleWidth }}
                fill
                gap={responsive.isCompact ? 3 : 5}
                icon="shield-checkmark-outline"
                iconSize={responsive.isCompact ? 12 : 14}
                label={member.role}
                labelStyle={{ fontSize: 12 }}
              />
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}
