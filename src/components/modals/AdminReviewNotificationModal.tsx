import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useEffect } from "react";

interface AdminReviewNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  modeName: string;
}

export function AdminReviewNotificationModal({
  isOpen,
  onClose,
  onConfirm,
  modeName,
}: AdminReviewNotificationModalProps) {
  // Handle ESC key manually to prevent it from bubbling up
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        e.preventDefault();
        onClose();
      }
    };

    // Add listener with high priority
    document.addEventListener("keydown", handleEsc, true);
    return () => document.removeEventListener("keydown", handleEsc, true);
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md border-muted"
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-white/80">
            Submit "{modeName}" for Review?
          </DialogTitle>
          <DialogDescription className="text-left space-y-3 pt-2 text-text-primary">
            <p>
              Your mode will be submitted for admin review and won't appear in
              the public table until it's been approved. This review process
              helps ensure quality and safety for all users.
            </p>
            <p>Are you ready to submit your mode?</p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="flex-1">
            Submit for Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
