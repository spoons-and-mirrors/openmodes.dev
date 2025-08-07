interface StatusBadgeProps {
  status: "pending" | "approved" | "rejected";
  onClick?: () => void;
  className?: string;
}

const statusConfig = {
  pending: {
    bg: "bg-yellow-900",
    text: "text-yellow-300",
    hover: "hover:bg-yellow-800",
  },
  approved: {
    bg: "bg-green-900",
    text: "text-green-300",
    hover: "hover:bg-green-800",
  },
  rejected: {
    bg: "bg-red-900",
    text: "text-red-300",
    hover: "hover:bg-red-800",
  },
};

export function StatusBadge({
  status,
  onClick,
  className = "",
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const baseClasses = `w-5 h-5 text-xs rounded-full flex items-center justify-center font-bold transition-colors ${config.bg} ${config.text}`;
  const interactiveClasses = onClick ? `${config.hover} cursor-pointer` : "";

  const classes = `${baseClasses} ${interactiveClasses} ${className}`;

  const statusLetter =
    status === "approved" ? "A" : status === "pending" ? "P" : "R";

  if (onClick) {
    return (
      <button onClick={onClick} className={classes}>
        {statusLetter}
      </button>
    );
  }

  return <span className={classes}>{statusLetter}</span>;
}
