import { getNotionIconUrl, type NotionIconName } from "../../icons/notion-icon-urls";

type NotionIconProps = {
  name: NotionIconName;
  size?: number;
  color: string;
  title?: string;
  spin?: boolean;
};

export function NotionIcon({ name, size = 16, color, title, spin }: NotionIconProps) {
  const url = getNotionIconUrl(name);

  return (
    <span
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      title={title}
      style={{
        width: size,
        height: size,
        display: "inline-block",
        flexShrink: 0,
        backgroundColor: color,
        animation: spin ? "tallySpin 1.1s linear infinite" : undefined,
        WebkitMaskImage: `url("${url}")`,
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskImage: `url("${url}")`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
      }}
    />
  );
}
