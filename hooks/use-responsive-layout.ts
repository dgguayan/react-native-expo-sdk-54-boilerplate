import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

import { layout, spacing } from "@/constants/theme";

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
): ResponsiveLayoutMetrics {
  const frameWidth = Math.max(0, width - reservedWidth);
  const isCompact = frameWidth < layout.compactBreakpoint;
  const isPhone = frameWidth < layout.phoneBreakpoint;
  const isMobile = frameWidth < layout.mobileBreakpoint;
  const isDesktop = frameWidth >= layout.desktopBreakpoint;
  const isTablet = !isMobile && !isDesktop;
  const pageHorizontalPadding = isCompact
    ? spacing.sm
    : isPhone
      ? spacing.md
      : isMobile || isTablet
        ? spacing.lg
        : spacing.xl;
  const pageTopPadding = isCompact
    ? spacing.sm
    : isPhone
      ? spacing.md
      : isMobile
        ? spacing.lg
        : isTablet
          ? spacing.xl
          : spacing["2xl"];
  const pageBottomPadding = isCompact
    ? spacing.xl
    : isPhone
      ? spacing["2xl"]
      : isMobile || isTablet
        ? spacing["3xl"]
        : spacing["4xl"];
  const cardPadding = isCompact
    ? 14
    : isPhone
      ? spacing.md
      : isMobile || isTablet
        ? 18
        : spacing.lg;
  const sectionGap = isCompact
    ? 10
    : isPhone
      ? spacing.sm
      : isMobile
        ? 14
        : isTablet
          ? spacing.md
          : spacing.lg;
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

  return useMemo(
    () => getResponsiveLayoutMetrics(width, height, reservedWidth),
    [height, reservedWidth, width],
  );
}
