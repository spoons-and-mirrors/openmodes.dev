import { ReactNode } from "react";

interface FormActionsProps {
  children: ReactNode;
  className?: string;
  align?: "left" | "right" | "center" | "between";
}

export function FormActions({
  children,
  className = "",
  align = "right",
}: FormActionsProps) {
  const alignmentClasses = {
    left: "justify-start",
    right: "justify-end",
    center: "justify-center",
    between: "justify-between",
  };

  return (
    <div className={`flex gap-2 ${alignmentClasses[align]} ${className}`}>
      {children}
    </div>
  );
}
