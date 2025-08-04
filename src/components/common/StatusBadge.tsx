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
  const baseClasses = `px-2 py-1 text-xs rounded transition-colors ${config.bg} ${config.text}`;
  const interactiveClasses = onClick ? `${config.hover} cursor-pointer` : "";

  const classes = `${baseClasses} ${interactiveClasses} ${className}`;

  if (onClick) {
    return (
      <button onClick={onClick} className={classes}>
        {status}
      </button>
    );
  }

  return <span className={classes}>{status}</span>;
}
