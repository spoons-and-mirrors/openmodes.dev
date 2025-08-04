import { ReactNode } from "react";

interface FormSectionProps {
  title?: string;
  description?: string;
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  header,
  children,
  className = "",
}: FormSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {header ? (
        <div>{header}</div>
      ) : (
        <div>
          <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-text-primary">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
