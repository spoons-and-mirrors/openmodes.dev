import { VoteDirection } from "../../lib/types";
import { Button } from "../ui/button";

interface VoteButtonsProps {
  votes: number;
  userVote: VoteDirection | null;
  isDisabled: boolean;
  onVote: (direction: VoteDirection) => void;
}

export function VoteButtons({
  votes,
  userVote,
  isDisabled,
  onVote,
}: VoteButtonsProps) {
  const getButtonClasses = (direction: VoteDirection) => {
    const baseClasses =
      "p-1.5 border-border bg-transparent transition-all duration-200 text-text-secondary disabled:opacity-50";

    if (userVote === direction) {
      return `${baseClasses} !border-brand !text-brand !bg-brand/10`;
    }

    return `${baseClasses} hover:!border-brand hover:!text-brand hover:!bg-brand/5`;
  };

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="sm"
        className={getButtonClasses("up")}
        disabled={isDisabled}
        onClick={() => onVote("up")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
      </Button>

      <span className="min-w-[2ch] font-mono text-sm font-semibold text-white text-center">
        {votes}
      </span>

      <Button
        variant="ghost"
        size="sm"
        className={getButtonClasses("down")}
        disabled={isDisabled}
        onClick={() => onVote("down")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
        </svg>
      </Button>
    </div>
  );
}
