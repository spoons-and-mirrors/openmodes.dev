import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface DownloadPopoverProps {
  downloads: number;
  modeName: string;
  version?: string;
  isCanonical?: boolean;
  className?: string;
}

export function DownloadPopover({
  downloads,
  modeName,
  version,
  isCanonical,
  className = "",
}: DownloadPopoverProps) {
  const [copied, setCopied] = useState(false);

  // Generate the npx command based on whether it's canonical or not
  const npxCommand = isCanonical
    ? `npx openmodes install ${modeName}`
    : `npx openmodes install ${modeName}@${version}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(npxCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="min-w-[2ch] font-mono text-sm font-semibold text-white text-center">
        {downloads}
      </span>
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center justify-center p-1.5 border border-muted rounded bg-transparent cursor-pointer transition-all duration-200 hover:border-accent hover:text-accent hover:bg-accent/5 text-text-primary">
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
        </PopoverTrigger>
        <PopoverContent
          className="w-80 bg-background border border-muted"
          align="end"
          sideOffset={8}
        >
          <div className="space-y-2">
            <h4 className="text-text-primary text-sm">
              {isCanonical ? (
                <>
                  Install{" "}
                  <span className="font-semibold text-white/80">
                    {modeName}
                  </span>
                </>
              ) : (
                <>
                  Install version {version} of{" "}
                  <span className="font-semibold text-white/80">
                    {modeName}
                  </span>
                </>
              )}
            </h4>

            <div className="relative">
              <div className="bg-background-light border border-muted rounded p-3 pr-12">
                <code className="text-xs font-mono text-white break-all">
                  {npxCommand}
                </code>
              </div>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 rounded hover:bg-accent/10 transition-colors text-text-secondary hover:text-accent"
                title="Copy command"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
