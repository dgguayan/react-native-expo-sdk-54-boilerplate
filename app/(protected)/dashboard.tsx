import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import type { ComponentProps } from "react";
import { Text, View, type DimensionValue } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/layout/Screen";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { inlineStyles } from "@/components/ui/Inline";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAppShell } from "@/context/AppShellContext";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAuth } from "@/providers/AuthProvider";
import { useAppTheme } from "@/providers/ThemeProvider";

const metrics = [
  { label: "Active projects", value: "12", change: "+2 this month", icon: "folder-open-outline" },
  { label: "Team members", value: "28", change: "+4 this quarter", icon: "people-outline" },
  { label: "Tasks completed", value: "184", change: "+18% vs last month", icon: "checkmark-circle-outline" },
  { label: "Delivery rate", value: "92%", change: "On track", icon: "trending-up-outline" },
] as const satisfies readonly {
  change: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}[];

const projects = [
  { name: "Customer portal", category: "Product", progress: 82, due: "Due Aug 14", tone: "brand" },
  { name: "Mobile onboarding", category: "Experience", progress: 64, due: "Due Aug 28", tone: "warning" },
  { name: "Analytics refresh", category: "Data", progress: 46, due: "Due Sep 05", tone: "success" },
] as const;

const activity = [
  { initials: "AM", title: "Ana moved Mobile onboarding to review", time: "12 minutes ago" },
  { initials: "JD", title: "Jordan completed the Q3 reporting milestone", time: "1 hour ago" },
  { initials: "SK", title: "Sam added three members to Product Design", time: "Yesterday" },
] as const;

function firstNameFromEmail(email?: string): string {
  const localPart = email?.split("@")[0];
  if (!localPart) return "there";
  const firstWord = localPart.split(/[._-]/)[0];
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
}

export default function DashboardScreen() {
  const { colors, tokens } = useAppTheme();
  const { radii, spacing } = tokens;
  const { user } = useAuth();
  const { drawerWidth, isDesktop } = useAppShell();
  const responsive = useResponsiveLayout(isDesktop ? drawerWidth : 0);
  const metricWidth: DimensionValue =
    responsive.contentWidth >= 1120
      ? "23.5%"
      : responsive.contentWidth >= 340
        ? "48.2%"
        : "100%";
  const stackSections = responsive.contentWidth < 900;

  return (
    <Screen
      title={`Good morning, ${firstNameFromEmail(user?.email)}`}
      description="Here’s what is happening across your workspace today."
      action={
        <Link href="/(protected)/projects" asChild>
          <Button icon="folder-open-outline" title="View projects" variant="secondary" />
        </Link>
      }
    >
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: responsive.sectionGap,
        }}
      >
        {metrics.map((metric) => (
          <Card key={metric.label} style={{ width: metricWidth, minWidth: 0 }}>
            <View
              style={[
                inlineStyles.row,
                {
                justifyContent: "space-between",
                gap: responsive.isCompact ? spacing.xs : spacing.md,
                },
              ]}
            >
              <View style={{ minWidth: 0, flex: 1 }}>
                <Text numberOfLines={1} style={{ color: colors.foregroundMuted, fontSize: 13, fontWeight: "500" }}>
                  {metric.label}
                </Text>
                <Text
                  style={{
                    marginTop: responsive.isMobile ? spacing.xxs : spacing.xs,
                    color: colors.foreground,
                    fontSize: responsive.isCompact
                      ? 24
                      : responsive.isMobile
                        ? 26
                        : 28,
                    fontWeight: "700",
                    letterSpacing: -0.6,
                  }}
                >
                  {metric.value}
                </Text>
              </View>
              <View
                style={[
                  inlineStyles.icon,
                  {
                    width: responsive.isCompact ? 34 : responsive.isMobile ? 36 : 40,
                    height: responsive.isCompact ? 34 : responsive.isMobile ? 36 : 40,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: radii.md,
                    backgroundColor: colors.brandSoft,
                  },
                ]}
              >
                <Ionicons
                  name={metric.icon}
                  size={responsive.isMobile ? 18 : 20}
                  color={colors.brand}
                />
              </View>
            </View>
            <Text
              style={{
                marginTop: responsive.isMobile ? spacing.xs : spacing.md,
                color: colors.success,
                fontSize: 12,
                fontWeight: "500",
              }}
            >
              {metric.change}
            </Text>
          </Card>
        ))}
      </View>

      <View
        style={{
          marginTop: responsive.sectionGap,
          flexDirection: stackSections ? "column" : "row",
          alignItems: "stretch",
          gap: responsive.sectionGap,
        }}
      >
        <Card style={{ flex: stackSections ? undefined : 1.55 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View>
              <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
                Project progress
              </Text>
              <Text style={{ marginTop: 3, color: colors.foregroundMuted, fontSize: 12 }}>
                Current delivery across active initiatives
              </Text>
            </View>
            <Badge label="3 active" tone="neutral" />
          </View>

          <View
            style={{
              gap: responsive.isMobile ? spacing.md : spacing.lg,
              marginTop: responsive.isMobile ? spacing.md : spacing.xl,
            }}
          >
            {projects.map((project) => (
              <View key={project.name} style={{ gap: spacing.xs }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm }}>
                  <View style={{ minWidth: 0, flex: 1 }}>
                    <Text numberOfLines={1} style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>
                      {project.name}
                    </Text>
                    <Text style={{ marginTop: 2, color: colors.foregroundMuted, fontSize: 11 }}>
                      {project.category} · {project.due}
                    </Text>
                  </View>
                  <Text style={{ color: colors.foregroundMuted, fontSize: 12, fontWeight: "600" }}>
                    {project.progress}%
                  </Text>
                </View>
                <ProgressBar value={project.progress} />
              </View>
            ))}
          </View>
        </Card>

        <Card style={{ flex: stackSections ? undefined : 1 }}>
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
            Recent activity
          </Text>
          <Text style={{ marginTop: 3, color: colors.foregroundMuted, fontSize: 12 }}>
            Latest workspace updates
          </Text>
          <View
            style={{
              gap: responsive.isMobile ? spacing.md : spacing.lg,
              marginTop: responsive.isMobile ? spacing.md : spacing.xl,
            }}
          >
            {activity.map((item) => (
              <View key={item.title} style={{ flexDirection: "row", gap: spacing.sm }}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: radii.full,
                    backgroundColor: colors.accent,
                  }}
                >
                  <Text style={{ color: colors.foreground, fontSize: 10, fontWeight: "700" }}>
                    {item.initials}
                  </Text>
                </View>
                <View style={{ minWidth: 0, flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 18 }}>
                    {item.title}
                  </Text>
                  <Text style={{ marginTop: 3, color: colors.foregroundMuted, fontSize: 11 }}>
                    {item.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      </View>
    </Screen>
  );
}
