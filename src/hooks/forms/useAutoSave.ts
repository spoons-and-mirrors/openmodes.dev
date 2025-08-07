import { useEffect, useCallback } from "react";
import { useModeFormStore } from "../../lib/stores/modeFormStore";
import { flushAllDebouncedInputs } from "../../components/forms";

/**
 * Provides functionality to auto-save form data to localStorage.
 */
export function useAutoSave(
  key: string = "submitModeFormData",
  interval: number = 5000,
  enabled: boolean = true,
) {
  const formData = useModeFormStore();

  const saveData = useCallback(() => {
    try {
      // Only save if there's something to save
      if (formData.formData.name || formData.formData.description) {
        localStorage.setItem(key, JSON.stringify(formData));
      }
    } catch (error) {
      console.warn("Failed to save form data:", error);
    }
  }, [key, formData]);

  const saveWithFlush = useCallback(() => {
    flushAllDebouncedInputs();
    saveData();
  }, [saveData]);

  // Auto-save periodically - only when enabled
  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(saveData, interval);
    return () => clearInterval(timer);
  }, [saveData, interval, enabled]);

  return {
    saveWithFlush,
    clearSavedData: () => localStorage.removeItem(key),
  };
}
