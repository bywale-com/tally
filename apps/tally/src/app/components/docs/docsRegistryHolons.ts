import type { NotionIconName } from "../../icons/notion-icon-urls";

export const DOCS_HOME_BRANCH_HOLON = {
  id: "docs-home-branch",
  label: "Home",
  icon: "house" as NotionIconName,
  order: 0,
};

export const DOCS_PANELS_BRANCH_HOLON = {
  id: "docs-panels-branch",
  label: "Panels",
  icon: "grid-square-2x2" as NotionIconName,
  order: 1,
};

export const DOCS_REGISTRY_HOLON = {
  id: "docs-registry",
  label: "Console Registry",
  icon: "list" as NotionIconName,
  order: 0,
};

export const DOCS_OUTLINE_ROW_HOLON = {
  id: "docs-outline-row",
  label: "Console Outline Row",
  icon: "list-bullet" as NotionIconName,
  order: 2,
};

export const DOCS_HOME_PLACEHOLDER_ENTRIES = [
  { id: "learning", label: "Learning", icon: "graduation-cap" as NotionIconName },
  { id: "softwares", label: "Softwares", icon: "cursor-click" as NotionIconName },
  { id: "tools", label: "Tools", icon: "wrench" as NotionIconName },
  { id: "inspiration", label: "Inspiration", icon: "cloud" as NotionIconName },
  { id: "brain-dump", label: "Brain Dump", icon: "pencil-list" as NotionIconName },
] as const;
