import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Text, View, type DimensionValue } from "react-native";

import { Button } from "@/components/Button";
import { StateView } from "@/components/feedback/StateView";
import { Screen } from "@/components/layout/Screen";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/Input";
import { InlineIconLabel, inlineStyles } from "@/components/ui/Inline";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useAppShell } from "@/context/AppShellContext";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAppTheme } from "@/providers/ThemeProvider";

type ProjectFilter = "all" | "on-track" | "at-risk" | "completed";

const filters = [
  { label: "All", value: "all" },
  { label: "On track", value: "on-track" },
  { label: "At risk", value: "at-risk" },
  { label: "Completed", value: "completed" },
] as const;

const projectData = [
  { id: "PRJ-124", name: "Customer portal", summary: "Self-service billing and account management", status: "on-track", statusLabel: "On track", tone: "success", progress: 82, due: "Aug 14", members: ["AM", "JD", "SK"] },
  { id: "PRJ-119", name: "Mobile onboarding", summary: "A shorter, guided activation experience", status: "at-risk", statusLabel: "At risk", tone: "warning", progress: 64, due: "Aug 28", members: ["KR", "AM"] },
  { id: "PRJ-117", name: "Analytics refresh", summary: "Real-time product and revenue reporting", status: "on-track", statusLabel: "On track", tone: "success", progress: 46, due: "Sep 05", members: ["JD", "LN", "MW"] },
  { id: "PRJ-108", name: "Design system v2", summary: "Unified foundations and accessible components", status: "completed", statusLabel: "Completed", tone: "brand", progress: 100, due: "Jul 18", members: ["SK", "KR"] },
  { id: "PRJ-103", name: "API reliability", summary: "Observability and automated recovery program", status: "on-track", statusLabel: "On track", tone: "success", progress: 71, due: "Sep 12", members: ["MW", "LN"] },
  { id: "PRJ-097", name: "Market expansion", summary: "Localization and launch readiness for APAC", status: "at-risk", statusLabel: "At risk", tone: "warning", progress: 38, due: "Oct 02", members: ["AM", "JD", "KR"] },
] as const;

export default function ProjectsScreen() {
  const { colors, tokens } = useAppTheme();
  const { radii, spacing } = tokens;
  const { drawerWidth, isDesktop } = useAppShell();
  const responsive = useResponsiveLayout(isDesktop ? drawerWidth : 0);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const cardWidth: DimensionValue =
    responsive.contentWidth >= 1040
      ? "32.3%"
      : responsive.contentWidth >= 620
        ? "49%"
        : "100%";

  const projects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return projectData.filter((project) => {
      const matchesFilter = filter === "all" || project.status === filter;
      const matchesQuery =
        !normalizedQuery ||
        project.name.toLowerCase().includes(normalizedQuery) ||
        project.summary.toLowerCase().includes(normalizedQuery) ||
        project.id.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  const resetFilters = () => {
    setFilter("all");
    setQuery("");
  };

  return (
    <Screen
      title="Projects"
      description="Track priorities, ownership, and delivery health across the workspace."
      action={<Badge label={`${projectData.length} projects`} tone="neutral" />}
    >
      <View
        style={{
          gap: responsive.sectionGap,
          marginBottom: responsive.isMobile ? spacing.md : spacing.lg,
        }}
      >
        <View style={{ width: "100%", maxWidth: 460 }}>
          <Input
            accessibilityLabel="Search projects"
            autoCorrect={false}
            icon="search-outline"
            onChangeText={setQuery}
            placeholder="Search by project, description, or ID"
            returnKeyType="search"
            value={query}
          />
        </View>
        <SegmentedControl
          accessibilityLabel="Filter projects by status"
          onChange={setFilter}
          options={filters}
          value={filter}
          variant="status"
        />
      </View>

      {projects.length === 0 ? (
        <StateView
          title="No matching projects"
          description="Try a different search term or clear the current status filter."
          icon="search-outline"
          action={<Button title="Clear filters" variant="secondary" onPress={resetFilters} />}
        />
      ) : (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: responsive.sectionGap,
          }}
        >
          {projects.map((project) => (
            <Card
              key={project.id}
              accessibilityLabel={`${project.name}, ${project.statusLabel}, ${project.progress}% complete`}
              style={{ width: cardWidth, minWidth: 0 }}
            >
              <View
                style={[
                  inlineStyles.row,
                  { alignItems: "flex-start", gap: spacing.sm },
                ]}
              >
                <View
                  style={[
                    inlineStyles.icon,
                    {
                      width: responsive.isMobile ? 36 : 40,
                      height: responsive.isMobile ? 36 : 40,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: radii.md,
                      backgroundColor: colors.brandSoft,
                    },
                  ]}
                >
                  <Ionicons
                    name="folder-outline"
                    size={responsive.isMobile ? 18 : 20}
                    color={colors.brand}
                  />
                </View>
                <View style={inlineStyles.fill}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.foregroundSubtle,
                      fontSize: 11,
                      fontWeight: "600",
                      letterSpacing: 0.5,
                    }}
                  >
                    {project.id}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      marginTop: 3,
                      color: colors.foreground,
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    {project.name}
                  </Text>
                </View>
                <View style={inlineStyles.icon}>
                  <Badge label={project.statusLabel} tone={project.tone} />
                </View>
              </View>
              <Text style={{ minHeight: responsive.isMobile ? 0 : 40, marginTop: responsive.isMobile ? spacing.sm : spacing.md, color: colors.foregroundMuted, fontSize: 13, lineHeight: 19 }}>
                {project.summary}
              </Text>

              <View style={{ gap: spacing.xs, marginTop: responsive.isMobile ? spacing.md : spacing.lg }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: colors.foregroundMuted, fontSize: 11 }}>Progress</Text>
                  <Text style={{ color: colors.foreground, fontSize: 11, fontWeight: "600" }}>
                    {project.progress}%
                  </Text>
                </View>
                <ProgressBar value={project.progress} />
              </View>

              <View style={{ marginTop: responsive.isMobile ? spacing.md : spacing.lg, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row" }}>
                  {project.members.map((initials, index) => (
                    <View
                      key={initials}
                      style={{
                        width: 28,
                        height: 28,
                        marginLeft: index === 0 ? 0 : -7,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 2,
                        borderColor: colors.surface,
                        borderRadius: radii.full,
                        backgroundColor: index % 2 === 0 ? colors.primary : colors.brand,
                      }}
                    >
                      <Text style={{ color: colors.onBrand, fontSize: 8, fontWeight: "700" }}>{initials}</Text>
                    </View>
                  ))}
                </View>
                <InlineIconLabel
                  color={colors.foregroundMuted}
                  gap={4}
                  icon="calendar-outline"
                  iconSize={13}
                  label={project.due}
                  labelStyle={{ fontSize: 11 }}
                />
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
