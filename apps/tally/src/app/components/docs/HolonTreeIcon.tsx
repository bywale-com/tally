import { CheckSquare, ExternalLink, MoreHorizontal, type LucideIcon } from "lucide-react";
import type { NotionIconName } from "../../icons/notion-icon-urls";
import type { HolonLucideIconName } from "./holonIcons";
import { NotionIcon } from "../icons/NotionIcon";

const HOLON_LUCIDE_ICONS: Record<HolonLucideIconName, LucideIcon> = {
  "external-link": ExternalLink,
  "more-horizontal": MoreHorizontal,
  "check-square": CheckSquare,
};

type HolonTreeIconProps = {
  notionIcon?: NotionIconName;
  lucideIcon?: HolonLucideIconName;
  size: number;
  color: string;
  accentColor?: string;
};

export function HolonTreeIcon({
  notionIcon,
  lucideIcon,
  size,
  color,
  accentColor,
}: HolonTreeIconProps) {
  if (lucideIcon) {
    const Icon = HOLON_LUCIDE_ICONS[lucideIcon];
    return <Icon size={size} color={accentColor ?? color} strokeWidth={2} />;
  }
  if (notionIcon) {
    return <NotionIcon name={notionIcon} size={size} color={color} />;
  }
  return null;
}
