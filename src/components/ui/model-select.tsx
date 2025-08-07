"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useModelsData } from "@/lib/stores/index";

interface ModelSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ModelSelect({
  value,
  onValueChange,
  placeholder = "Select model...",
  className,
}: ModelSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const { models, isLoading, isError } = useModelsData();

  // Reset search when popover closes
  React.useEffect(() => {
    if (!open) {
      setSearchValue("");
    }
  }, [open]);

  const selectedModel = React.useMemo(
    () => models.find((model) => model.value === value),
    [models, value],
  );

  if (isLoading) {
    return (
      <Button
        variant="outline"
        role="combobox"
        className={cn(
          "w-full h-10 justify-between bg-background-light border-muted text-white opacity-60 cursor-not-allowed",
          className,
        )}
        disabled
      >
        Loading models...
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  if (isError || models.length === 0) {
    return (
      <Button
        variant="outline"
        role="combobox"
        className={cn(
          "w-full h-10 justify-between bg-background-light border-muted text-white opacity-60 cursor-not-allowed",
          className,
        )}
        disabled
      >
        No models available
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full h-10 justify-between bg-background-light border-muted text-white hover:bg-background-light",
            !open && "hover:border-brand/50 hover:bg-background-light",
            className,
          )}
        >
          {selectedModel ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-text-primary">
                {selectedModel.provider}
              </span>
              <span className="text-text-primary">/</span>
              <span className="text-white">{selectedModel.modelName}</span>
            </div>
          ) : (
            <span className="text-text-primary">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-background-light border border-muted">
        <Command className="bg-background-light border border-brand/50 rounded [&_[data-slot=command-input-wrapper]_svg]:text-brand [&_[data-slot=command-input-wrapper]_svg]:opacity-100">
          <CommandInput
            placeholder="Search models..."
            className="h-9 bg-background-light text-white border-none"
            value={searchValue}
            onValueChange={(value) => {
              setSearchValue(value);
              // Scroll to top when search value changes
              const commandList = document.querySelector(
                '[data-slot="command-list"]',
              );
              if (commandList) {
                commandList.scrollTop = 0;
              }
            }}
          />
          <CommandList className="bg-background-light scrollbar-hide max-h-[200px] overflow-y-auto">
            <CommandEmpty className="text-white py-6 text-center text-sm">
              No model found.
            </CommandEmpty>
            <CommandGroup className="p-1">
              {models.map((model) => (
                <CommandItem
                  key={`${model.provider}-${model.value}`}
                  value={model.searchText}
                  className="text-white data-[selected=true]:bg-accent/40 cursor-pointer px-2 py-1.5"
                  onSelect={() => {
                    const newValue = model.value === value ? "" : model.value;
                    onValueChange?.(newValue);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-text-primary">
                      {model.provider}
                    </span>
                    <span className="text-text-primary">/</span>
                    <span className="text-white">{model.modelName}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === model.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
