import { useState } from "react";

export function useCopyToClipboard() {
  const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({});

  const copyToClipboard = async (content: string, key: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyStatus((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopyStatus((prev) => ({ ...prev, [key]: false }));
      }, 1200);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const isCopied = (key: string) => copyStatus[key] || false;

  return {
    copyToClipboard,
    isCopied,
    copyStatus,
  };
}
