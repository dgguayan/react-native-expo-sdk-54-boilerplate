import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

import {
  layout,
  spacing,
  type AppSpacing,
} from "@/constants/theme";
import { useOptionalAppTheme } from "@/providers/ThemeProvider";

export interface ResponsiveLayoutMetrics {
  cardPadding: number;
  contentWidth: number;
  frameWidth: number;
  height: number;
  isCompact: boolean;
  isDesktop: boolean;
  isMobile: boolean;
  isPhone: boolean;
  isTablet: boolean;
  pageBottomPadding: number;
  pageHorizontalPadding: number;
  pageTopPadding: number;
  sectionGap: number;
  titleFontSize: number;
  titleLineHeight: number;
  width: number;
}

export function getResponsiveLayoutMetrics(
  width: number,
  height: number,
  reservedWidth = 0,
  space: AppSpacing = spacing,
): ResponsiveLayoutMetrics {
  const frameWidth = Math.max(0, width - reservedWidth);
  const isCompact = frameWidth < layout.compactBreakpoint;
  const isPhone = frameWidth < layout.phoneBreakpoint;
  const isMobile = frameWidth < layout.mobileBreakpoint;
  const isDesktop = frameWidth >= layout.desktopBreakpoint;
  const isTablet = !isMobile && !isDesktop;
  const pageHorizontalPadding = isCompact
    ? space.sm
    : isPhone
      ? space.md
      : isMobile || isTablet
        ? space.lg
        : space.xl;
  const pageTopPadding = isCompact
    ? space.sm
    : isPhone
      ? space.md
      : isMobile
        ? space.lg
        : isTablet
          ? space.xl
          : space["2xl"];
  const pageBottomPadding = isCompact
    ? space.xl
    : isPhone
      ? space["2xl"]
      : isMobile || isTablet
        ? space["3xl"]
        : space["4xl"];
  const cardPadding = isCompact
    ? 14
    : isPhone
      ? space.md
      : isMobile || isTablet
        ? 18
        : spacing.lg;
  const sectionGap = isCompact
    ? 10
    : isPhone
      ? space.sm
      : isMobile
        ? 14
        : isTablet
          ? space.md
          : space.lg;
  const boundedFrameWidth = Math.min(frameWidth, layout.contentMaxWidth);

  return {
    cardPadding,
    contentWidth: Math.max(0, boundedFrameWidth - pageHorizontalPadding * 2),
    frameWidth,
    height,
    isCompact,
    isDesktop,
    isMobile,
    isPhone,
    isTablet,
    pageBottomPadding,
    pageHorizontalPadding,
    pageTopPadding,
    sectionGap,
    titleFontSize: isCompact ? 22 : isPhone ? 24 : isMobile ? 25 : 29,
    titleLineHeight: isCompact ? 28 : isPhone ? 31 : isMobile ? 32 : 36,
    width,
  };
}

export function useResponsiveLayout(
  reservedWidth = 0,
): ResponsiveLayoutMetrics {
  const { height, width } = useWindowDimensions();
  const theme = useOptionalAppTheme();
  const themeSpacing = theme?.tokens.spacing ?? spacing;

  return useMemo(
    () =>
      getResponsiveLayoutMetrics(
        width,
        height,
        reservedWidth,
        themeSpacing,
      ),
    [height, reservedWidth, themeSpacing, width],
  );
}
