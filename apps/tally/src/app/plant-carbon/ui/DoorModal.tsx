import type { ReactNode } from "react";
import { Modal } from "@carbon/react";

/**
 * Carbon stand-in for loFi Sheet doors — Modal (no ibm-products Tearsheet).
 * Pass size="lg" for denser fact grids / firm lists.
 */
export function DoorModal({
  open,
  heading,
  label,
  onClose,
  children,
  size = "md",
  danger,
  primaryButtonText,
  secondaryButtonText = "Close",
  onRequestSubmit,
  primaryButtonDisabled,
}: {
  open: boolean;
  heading: string;
  label?: string;
  onClose: () => void;
  children: ReactNode;
  size?: "xs" | "sm" | "md" | "lg";
  danger?: boolean;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onRequestSubmit?: () => void;
  primaryButtonDisabled?: boolean;
}) {
  const hasPrimary = Boolean(primaryButtonText && onRequestSubmit);
  return (
    <Modal
      open={open}
      danger={danger}
      size={size}
      modalHeading={heading}
      modalLabel={label}
      primaryButtonText={hasPrimary ? primaryButtonText : undefined}
      secondaryButtonText={secondaryButtonText}
      onRequestClose={onClose}
      onRequestSubmit={
        hasPrimary
          ? () => {
              onRequestSubmit?.();
            }
          : undefined
      }
      primaryButtonDisabled={primaryButtonDisabled}
      passiveModal={!hasPrimary}
    >
      {children}
    </Modal>
  );
}
