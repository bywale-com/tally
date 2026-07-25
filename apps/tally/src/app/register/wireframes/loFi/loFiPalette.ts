/** Gray-only lo-fi defaults — Register click-through. Plant maps Tokens onto this shape. */
export type DeskPalette = {
  canvas: string;
  frame: string;
  chrome: string;
  block: string;
  stroke: string;
  ink: string;
  label: string;
  muted: string;
  white: string;
  sidebar: string;
  /** Modal / sheet dimmer — must read on both themes. */
  scrim: string;
  note: string;
  noteBorder: string;
  sidebarW: number;
  sidebarCollapsedW: number;
};

export const loFi: DeskPalette = {
  canvas: "#ececec",
  frame: "#fafafa",
  chrome: "#eeeeee",
  block: "#e0e0e0",
  stroke: "#bdbdbd",
  ink: "#212121",
  label: "#757575",
  muted: "#9e9e9e",
  white: "#ffffff",
  sidebar: "#f5f5f5",
  scrim: "rgba(0,0,0,0.15)",
  note: "#fff8c4",
  noteBorder: "#e6d98a",
  sidebarW: 240,
  sidebarCollapsedW: 48,
};
