import type { CSSProperties, DragEvent } from "react";
import { DOCS_TREE_LABEL_SIZE } from "../docs/treeLayout";
import type { Tokens } from "../tokens";

/** Drag MIME for schema / table field paths into node parameters. */
export const TALLY_FIELD_PATH_MIME = "application/x-tally-field-path";

export function setFieldPathDragData(event: DragEvent, path: string) {
  event.dataTransfer.setData(TALLY_FIELD_PATH_MIME, path);
  event.dataTransfer.setData("text/plain", path);
  event.dataTransfer.effectAllowed = "copy";
}

export function readFieldPathDragData(event: DragEvent): string | null {
  const path =
    event.dataTransfer.getData(TALLY_FIELD_PATH_MIME) ||
    event.dataTransfer.getData("text/plain");
  const trimmed = path.trim();
  return trimmed ? trimmed : null;
}

type FieldPathDropInputProps = {
  value: string;
  onChange: (next: string) => void;
  t: Tokens;
  placeholder?: string;
  style?: CSSProperties;
  "aria-label"?: string;
};

/** Text input that accepts dragged field paths from the Input schema tree. */
export function FieldPathDropInput({
  value,
  onChange,
  t,
  placeholder,
  style,
  "aria-label": ariaLabel,
}: FieldPathDropInputProps) {
  return (
    <input
      value={value}
      aria-label={ariaLabel}
      onChange={(event) => onChange(event.target.value)}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(event) => {
        event.preventDefault();
        const path = readFieldPathDragData(event);
        if (path) onChange(path);
      }}
      placeholder={placeholder}
      title="Drop a field from Input schema, or type a path"
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "8px 10px",
        borderRadius: 8,
        border: `1px solid ${t.border}`,
        background: t.bgPrimary,
        color: t.textPrimary,
        fontSize: DOCS_TREE_LABEL_SIZE,
        outline: "none",
        ...style,
      }}
    />
  );
}
