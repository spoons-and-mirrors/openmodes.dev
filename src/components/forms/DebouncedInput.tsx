import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "../../lib/utils";

interface DebouncedInputProps {
  value: string;
  onChange: (value: string) => void;
  debounce?: number;
  [key: string]: any; // Allow other props like placeholder, className, etc.
}

// Global registry to track all debounced inputs
const globalInputRegistry = new Set<() => void>();

export function flushAllDebouncedInputs() {
  globalInputRegistry.forEach((flush) => flush());
}

export function DebouncedInput({
  value: propValue,
  onChange,
  debounce = 1000,
  ...props
}: DebouncedInputProps) {
  const [value, setValue] = useState(propValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setValue(propValue);
  }, [propValue]);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (value !== propValue) {
      onChange(value);
    }
  }, [value, propValue, onChange]);

  // Register flush function globally
  useEffect(() => {
    globalInputRegistry.add(flush);

    return () => {
      globalInputRegistry.delete(flush);
    };
  }, [flush]);

  // Single useEffect for debouncing logic
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only set timeout if value is different from prop value
    if (value !== propValue) {
      timeoutRef.current = setTimeout(() => {
        onChange(value);
        timeoutRef.current = null;
      }, debounce);
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [value, onChange, debounce, propValue]);

  const InputComponent = props.rows ? "textarea" : "input";

  // Use cn to merge default classes with user-provided className
  const finalClassName = cn(
    "focus:border-brand/50 focus:outline-none",
    props.className,
  );

  return (
    <InputComponent
      {...props}
      className={finalClassName}
      value={value}
      onChange={(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => setValue(e.target.value)}
      onBlur={flush}
    />
  );
}
