export type Tokens = {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textMuted: string;
  textDim: string;
  /** Sidebar tree labels — brighter than textMuted for nav legibility */
  textSidebar: string;
  sidebarBadgeBg: string;
  sidebarBadgeFg: string;
  sidebarBadgeBorder: string;
  border: string;
  borderLight: string;
  accent: string;
  accentBg: string;
  amber: string;
  amberBg: string;
  green: string;
  success: string;
  red: string;
  tagNeutralBg: string;
  liveViewerBg: string;
  browserDot: string;
  activityBar: string;
  activityBarIcon: string;
  activityBarIconActive: string;
  boardPanel: string;
  tabActiveBg: string;
  tabInactiveBg: string;
  hoverBg: string;
  activeRowBg: string;
  cardBg: string;
  workingBg: string;
};

/** Brand purple (Tower blue swapped). */
const ACCENT = "#8B5CF6";
const ACCENT_BG_DARK = "rgba(139, 92, 246, 0.18)";
const ACCENT_BG_LIGHT = "rgba(139, 92, 246, 0.08)";
const ACTIVE_ROW_DARK = "rgba(139, 92, 246, 0.18)";
const ACTIVE_ROW_LIGHT = "rgba(139, 92, 246, 0.07)";

export const dark: Tokens = {
  bgPrimary: "#000000",
  bgSecondary: "#0c0c0c",
  bgTertiary: "#161616",
  textPrimary: "#d4d4d4",
  textMuted: "#8a8a8a",
  textDim: "#666666",
  textSidebar: "#b0b0b0",
  sidebarBadgeBg: "#5c5c5c",
  sidebarBadgeFg: "#1a1a1a",
  sidebarBadgeBorder: "#737373",
  border: "rgba(255, 255, 255, 0.22)",
  borderLight: "rgba(255, 255, 255, 0.12)",
  accent: ACCENT,
  accentBg: ACCENT_BG_DARK,
  amber: "#A78BFA",
  amberBg: "rgba(167, 139, 250, 0.18)",
  green: ACCENT,
  success: "#16a34a",
  red: "#ef4444",
  tagNeutralBg: "#161616",
  liveViewerBg: "#000000",
  browserDot: "rgba(255, 255, 255, 0.35)",
  activityBar: "#000000",
  activityBarIcon: "#7a7a7a",
  activityBarIconActive: "#d4d4d4",
  boardPanel: "#0c0c0c",
  tabActiveBg: "#0c0c0c",
  tabInactiveBg: "#000000",
  hoverBg: "rgba(255,255,255,0.06)",
  activeRowBg: ACTIVE_ROW_DARK,
  cardBg: "#121212",
  workingBg: "#0c0c0c",
};

export const light: Tokens = {
  bgPrimary: "#ffffff",
  bgSecondary: "#f5f5f5",
  bgTertiary: "#eeeeee",
  textPrimary: "#1e1e1e",
  textMuted: "#6e6e6e",
  textDim: "#aaaaaa",
  textSidebar: "#525252",
  sidebarBadgeBg: "#e8e8e8",
  sidebarBadgeFg: "#2d2d2d",
  sidebarBadgeBorder: "#d0d0d0",
  border: "#e0e0e0",
  borderLight: "#ececec",
  accent: ACCENT,
  accentBg: ACCENT_BG_LIGHT,
  amber: "#7C3AED",
  amberBg: "rgba(124, 58, 237, 0.12)",
  green: ACCENT,
  success: "#16a34a",
  red: "#dc2626",
  tagNeutralBg: "#ffffff",
  liveViewerBg: "#ffffff",
  browserDot: "#d1d5db",
  activityBar: "#ffffff",
  activityBarIcon: "#6e6e6e",
  activityBarIconActive: "#1e1e1e",
  boardPanel: "#ffffff",
  tabActiveBg: "#ffffff",
  tabInactiveBg: "#f5f5f5",
  hoverBg: "rgba(0,0,0,0.04)",
  activeRowBg: ACTIVE_ROW_LIGHT,
  cardBg: "#ffffff",
  workingBg: "#fafafa",
};
