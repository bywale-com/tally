import arrowsUpDownUrl from "@notion-icons/arrows-up-down-55534e-icon.svg?url";
import bellUrl from "@notion-icons/bell-55534e-icon.svg?url";
import bellSlashUrl from "@notion-icons/bell-slash-55534e-icon.svg?url";
import calendarUrl from "@notion-icons/calendar-55534e-icon.svg?url";
import chartBarLineUrl from "@notion-icons/chart-bar-line-55534e-icon.svg?url";
import chartBarVerticalUrl from "@notion-icons/chart-bar-vertical-55534e-icon.svg?url";
import chartBarHorizontalUrl from "@notion-icons/chart-bar-horizontal-55534e-icon.svg?url";
import checkmarkListUrl from "@notion-icons/checkmark-list-55534e-icon.svg?url";
import chevronsDownUrl from "@notion-icons/chevrons-down-55534e-icon.svg?url";
import circleDashedUrl from "@notion-icons/circle-dashed-55534e-icon.svg?url";
import cloudUrl from "@notion-icons/cloud-55534e-icon.svg?url";
import clockUrl from "@notion-icons/clock-55534e-icon.svg?url";
import compassUrl from "@notion-icons/compass-55534e-icon.svg?url";
import computerWindowUrl from "@notion-icons/computer-window-55534e-icon.svg?url";
import cursorClickUrl from "@notion-icons/cursor-click-55534e-icon.svg?url";
import dependencyUrl from "@notion-icons/dependency-55534e-icon.svg?url";
import directionalSignUrl from "@notion-icons/directional-sign-55534e-icon.svg?url";
import documentArrowUpUrl from "@notion-icons/document-arrow-up-55534e-icon.svg?url";
import documentUrl from "@notion-icons/document-55534e-icon.svg?url";
import documentsUrl from "@notion-icons/documents-55534e-icon.svg?url";
import dotCircleUrl from "@notion-icons/dot-circle-55534e-icon.svg?url";
import eyeUrl from "@notion-icons/eye-55534e-icon.svg?url";
import eyeSlashUrl from "@notion-icons/eye-slash-55534e-icon.svg?url";
import filterUrl from "@notion-icons/filter-55534e-icon.svg?url";
import gearUrl from "@notion-icons/gear-55534e-icon.svg?url";
import gitUrl from "@notion-icons/git-55534e-icon.svg?url";
import graduationCapUrl from "@notion-icons/graduation-cap-55534e-icon.svg?url";
import gridSquare2x2Url from "@notion-icons/grid-square-2x2-55534e-icon.svg?url";
import houseUrl from "@notion-icons/house-55534e-icon.svg?url";
import informationCircleUrl from "@notion-icons/information-circle-55534e-icon.svg?url";
import lightningBoltUrl from "@notion-icons/lightning-bolt-55534e-icon.svg?url";
import listBulletUrl from "@notion-icons/list-bullet-55534e-icon.svg?url";
import listUrl from "@notion-icons/list-55534e-icon.svg?url";
import magnifyingGlassUrl from "@notion-icons/magnifying-glass-55534e-icon.svg?url";
import peopleUrl from "@notion-icons/people-55534e-icon.svg?url";
import pencilListUrl from "@notion-icons/pencil-list-55534e-icon.svg?url";
import plusUrl from "@notion-icons/plus-55534e-icon.svg?url";
import squareDashedUrl from "@notion-icons/square-dashed-55534e-icon.svg?url";
import tagUrl from "@notion-icons/tag-55534e-icon.svg?url";
import userUrl from "@notion-icons/user-55534e-icon.svg?url";
import userCircleUrl from "@notion-icons/user-circle-55534e-icon.svg?url";
import userSquaresUrl from "@notion-icons/user-squares-55534e-icon.svg?url";
import wrenchUrl from "@notion-icons/wrench-55534e-icon.svg?url";

/** Slugs match filenames in `src/assets/notion-icons` (without `-55534e-icon.svg`). */
export const NOTION_ICON_URLS = {
  bell: bellUrl,
  "bell-slash": bellSlashUrl,
  "arrows-up-down": arrowsUpDownUrl,
  calendar: calendarUrl,
  "chart-bar-horizontal": chartBarHorizontalUrl,
  "chart-bar-line": chartBarLineUrl,
  "chart-bar-vertical": chartBarVerticalUrl,
  "checkmark-list": checkmarkListUrl,
  "chevrons-down": chevronsDownUrl,
  "circle-dashed": circleDashedUrl,
  clock: clockUrl,
  cloud: cloudUrl,
  compass: compassUrl,
  "computer-window": computerWindowUrl,
  "cursor-click": cursorClickUrl,
  dependency: dependencyUrl,
  "directional-sign": directionalSignUrl,
  document: documentUrl,
  "document-arrow-up": documentArrowUpUrl,
  documents: documentsUrl,
  "dot-circle": dotCircleUrl,
  eye: eyeUrl,
  "eye-slash": eyeSlashUrl,
  filter: filterUrl,
  gear: gearUrl,
  git: gitUrl,
  "graduation-cap": graduationCapUrl,
  "grid-square-2x2": gridSquare2x2Url,
  house: houseUrl,
  "information-circle": informationCircleUrl,
  "lightning-bolt": lightningBoltUrl,
  "list-bullet": listBulletUrl,
  list: listUrl,
  "magnifying-glass": magnifyingGlassUrl,
  "pencil-list": pencilListUrl,
  plus: plusUrl,
  people: peopleUrl,
  "square-dashed": squareDashedUrl,
  tag: tagUrl,
  user: userUrl,
  "user-circle": userCircleUrl,
  "user-squares": userSquaresUrl,
  wrench: wrenchUrl,
} as const;

export type NotionIconName = keyof typeof NOTION_ICON_URLS;

export function getNotionIconUrl(name: NotionIconName): string {
  return NOTION_ICON_URLS[name];
}
