interface DownloadButtonProps {
  downloads: number;
  onDownload: () => void;
  className?: string;
}

export function DownloadButton({
  downloads,
  onDownload,
  className = "",
}: DownloadButtonProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="min-w-[2ch] font-mono text-sm font-semibold text-white text-center">
        {downloads}
      </span>
      <button
        className="flex items-center justify-center p-1.5 border border-muted rounded bg-transparent cursor-pointer transition-all duration-200 hover:border-accent hover:text-accent hover:bg-accent/5 text-text-primary"
        onClick={onDownload}
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
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7,10 12,15 17,10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>
    </div>
  );
}
