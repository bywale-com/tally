import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { FirmRow } from "@/app/register/wireframes/loFi/prototypeFirms";

type FirmListPanelProps = {
  firms: FirmRow[];
  showAdd?: boolean;
  onToggleRemove: (id: string) => void;
};

export function FirmListPanel({ firms, showAdd, onToggleRemove }: FirmListPanelProps) {
  const active = firms.filter((f) => !f.removed).length;

  return (
    <div className="flex flex-col gap-2">
      <div className="text-muted-foreground text-xs">Firm list · {active} firms</div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Firm</TableHead>
              <TableHead className="w-28">Employees</TableHead>
              <TableHead className="w-20 text-right"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {firms.map((f) => (
              <TableRow key={f.id} className={cn(f.removed && "opacity-50")}>
                <TableCell className={cn("font-medium", f.removed && "line-through")}>{f.name}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{f.employeeCount || f.sizeBucket || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="link" size="sm" className="h-auto px-0 text-xs" onClick={() => onToggleRemove(f.id)}>
                    {f.removed ? "Restore" : "Remove"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {showAdd ? (
        <Button variant="outline" size="sm" className="border-dashed" disabled>
          + Add firm (demo)
        </Button>
      ) : null}
    </div>
  );
}
