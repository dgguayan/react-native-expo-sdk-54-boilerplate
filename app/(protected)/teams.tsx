import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";

import { StateView } from "@/components/feedback/StateView";
import { Screen } from "@/components/layout/Screen";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { radii, spacing } from "@/constants/theme";
import { useAppShell } from "@/context/AppShellContext";
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
  const { width } = useWindowDimensions();
  const { drawerWidth, isDesktop } = useAppShell();
  const [activeTab, setActiveTab] = useState<TeamTab>("members");
  const availableWidth = width - (isDesktop ? drawerWidth : 0);
  const showEmail = availableWidth >= 700;

  return (
    <Screen
      title="Teams"
      description="Understand who has access and how responsibilities are distributed."
      action={<Badge label="6 members" tone="brand" />}
    >
      <View style={{ marginBottom: spacing.lg }}>
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
              minHeight: 46,
              flexDirection: "row",
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              backgroundColor: colors.surfaceMuted,
              paddingHorizontal: spacing.lg,
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
            <Text style={{ width: 92, color: colors.foregroundMuted, fontSize: 11, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" }}>
              Role
            </Text>
          </View>

          {members.map((member, index) => (
            <View
              key={member.email}
              accessibilityLabel={`${member.name}, ${member.role}, ${member.online ? "online" : "offline"}`}
              style={{
                minHeight: 68,
                flexDirection: "row",
                alignItems: "center",
                borderBottomWidth: index === members.length - 1 ? 0 : 1,
                borderBottomColor: colors.border,
                paddingHorizontal: spacing.lg,
              }}
            >
              <View style={{ flex: 1.4, minWidth: 0, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <View style={{ position: "relative" }}>
                  <View
                    style={{
                      width: 38,
                      height: 38,
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
                <View style={{ minWidth: 0, flex: 1 }}>
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
              <View style={{ width: 92, flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Ionicons name="shield-checkmark-outline" size={14} color={colors.foregroundMuted} />
                <Text numberOfLines={1} style={{ color: colors.foregroundMuted, fontSize: 12 }}>
                  {member.role}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}
