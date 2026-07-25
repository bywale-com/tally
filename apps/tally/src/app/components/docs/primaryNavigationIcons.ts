import type { NotionIconName } from "../../icons/notion-icon-urls";

export type PrimaryNavItem = {
  id: string;
  icon: NotionIconName;
  label: string;
};

export const PRIMARY_NAV: PrimaryNavItem[] = [
  { id: "board", icon: "grid-square-2x2", label: "Board" },
];

export const ALL_NAV: PrimaryNavItem[] = [
  ...PRIMARY_NAV,
  { id: "settings", icon: "gear", label: "Settings" },
];

export const CONSOLE_NAV_ICON: NotionIconName = "document";
export const MORE_NAV_ICON: NotionIconName = "chevrons-down";
