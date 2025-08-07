import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  description?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  description,
  error,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={className}>
      <label
        className="block text-sm font-semibold text-text-primary mb-1"
        htmlFor={htmlFor}
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      {description && (
        <p className="text-xs text-text-secondary mb-1">{description}</p>
      )}

      {children}

      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
