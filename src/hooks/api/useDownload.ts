import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export function useDownload() {
  const recordDownloadMutation = useMutation(api.mutation.recordDownload);

  const downloadMode = async (
    modeId: Id<"modes">,
    modeName: string,
    content: string,
  ) => {
    try {
      // Record download
      await recordDownloadMutation({ modeId });

      // Download file
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${modeName.replace(/\s+/g, "-").toLowerCase()}.mode.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download:", error);
      throw error;
    }
  };

  return { downloadMode };
}
