import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { useWindowDimensions } from "react-native";

type Breakpoint = "desktop" | "tablet" | "mobile";

interface SidebarContextValue {
  breakpoint: Breakpoint;
  collapsed: boolean;
  toggleCollapsed: () => void;
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(
  undefined,
);

function getBreakpoint(width: number): Breakpoint {
  if (width >= 1024) return "desktop";
  if (width >= 768) return "tablet";
  return "mobile";
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const breakpoint = getBreakpoint(width);

  const [collapsed, setCollapsed] = useState(breakpoint === "tablet");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Re-derive sensible defaults when crossing a breakpoint (e.g. resizing the browser)
  useEffect(() => {
    if (breakpoint === "tablet") setCollapsed(true);
    if (breakpoint === "desktop") setCollapsed(false);
    if (breakpoint === "mobile") setMobileOpen(false);
  }, [breakpoint]);

  return (
    <SidebarContext.Provider
      value={{
        breakpoint,
        collapsed,
        toggleCollapsed: () => setCollapsed((c) => !c),
        mobileOpen,
        openMobile: () => setMobileOpen(true),
        closeMobile: () => setMobileOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
