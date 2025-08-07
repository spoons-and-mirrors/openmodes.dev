import { useEffect, ReactNode } from "react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string | ReactNode;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl";
  actions?: ReactNode;
  headerActions?: ReactNode;
  showCloseButton?: boolean;
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "4xl",
  actions,
  headerActions,
  showCloseButton = true,
}: BaseModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    "6xl": "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-background border border-muted rounded-lg w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-muted">
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-white uppercase tracking-tight">
                {title}
              </h2>
              {headerActions}
            </div>
            {subtitle && (
              <div className="text-xs italic text-text-primary">{subtitle}</div>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 text-text-primary hover:text-white transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto modal-scrollbar">{children}</div>

        {/* Actions */}
        {actions && <div className="p-4 border-t border-muted">{actions}</div>}
      </div>
    </div>
  );
}
