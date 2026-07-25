import { ACTIVITY_BAR_WIDTH, SIDEBAR_HEADER_HEIGHT } from "../constants/layout";
import { HolonBoundary } from "./docs/HolonBoundary";
import {
  CONSOLE_NAV_ICON,
  PRIMARY_NAV,
} from "./docs/primaryNavigationIcons";
import { SHELL_HOLON_ORDER } from "./docs/shellHolonOrder";
import { NotionIcon } from "./icons/NotionIcon";
import { TallyAppLogo } from "./icons/TallyAppLogo";
import type { NotionIconName } from "../icons/notion-icon-urls";
import type { Tokens } from "./tokens";

const NAV_ICON_SIZE = 16;

type ActivityBarProps = {
  activeIcon: string;
  onIconClick: (id: string) => void;
  isConsoleOpen: boolean;
  onToggleConsole: () => void;
  t: Tokens;
};

/** Far-left shell rail — logo, then Board / Console. */
export function ActivityBar({
  activeIcon,
  onIconClick,
  isConsoleOpen,
  onToggleConsole,
  t,
}: ActivityBarProps) {
  const iconBtn = (
    id: string,
    icon: NotionIconName,
    label: string,
    opts: { active: boolean; onClick: () => void },
  ) => (
    <button
      key={id}
      type="button"
      title={label}
      onClick={opts.onClick}
      style={{
        width: 28,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: opts.active ? t.activeRowBg : "transparent",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <NotionIcon
        name={icon}
        size={NAV_ICON_SIZE}
        color={opts.active ? t.accent : t.activityBarIcon}
      />
    </button>
  );

  return (
    <HolonBoundary
      id="activity-bar"
      label="Activity Bar"
      icon="grid-square-2x2"
      order={SHELL_HOLON_ORDER["activity-bar"]}
      t={t}
      style={{
        width: ACTIVITY_BAR_WIDTH,
        flexShrink: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: t.activityBar,
        borderRight: `1px solid ${t.border}`,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          height: SIDEBAR_HEADER_HEIGHT,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxSizing: "border-box",
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <TallyAppLogo size={18} t={t} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          padding: "8px 0",
          width: "100%",
        }}
      >
        {PRIMARY_NAV.map((item) =>
          iconBtn(item.id, item.icon, item.label, {
            active: activeIcon === item.id,
            onClick: () => onIconClick(item.id),
          }),
        )}
        {iconBtn("console", CONSOLE_NAV_ICON, "Console", {
          active: isConsoleOpen,
          onClick: onToggleConsole,
        })}
      </div>
    </HolonBoundary>
  );
}
