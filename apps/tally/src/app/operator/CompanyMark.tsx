import { cn } from "@/lib/utils";

type CompanyMarkProps = {
  initials: string;
  name: string;
  className?: string;
};

/** Initials chip — stand-in for company logo until assets exist. */
export function CompanyMark({ initials, name, className }: CompanyMarkProps) {
  return (
    <div
      title={name}
      className={cn(
        "bg-foreground text-background flex size-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold tracking-wide",
        className,
      )}
    >
      {initials}
    </div>
  );
}
