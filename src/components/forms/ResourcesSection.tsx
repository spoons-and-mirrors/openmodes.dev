import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import { Button } from "../ui/button";

interface Resource {
  title: string;
  content: string;
}

interface ResourcesSectionProps {
  resources: Resource[];
  onAddResource: () => void;
  onRemoveResource: (index: number) => void;
  onUpdateResource: (index: number, field: string, value: string) => void;
}

export function ResourcesSection({
  resources,
  onAddResource,
  onRemoveResource,
  onUpdateResource,
}: ResourcesSectionProps) {
  return (
    <FormSection
      header={
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-text-primary font-semibold">Resources</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onAddResource}
              className="text-text-primary"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mr-1"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Resource
            </Button>
          </div>
          <p className="text-xs text-text-secondary">
            Define prompts that the LLM can use as tool calls. These resources
            are not included in the main request, unlike instructions.
          </p>
        </div>
      }
    >
      <div className="space-y-4">
        {resources.map((resource, index) => (
          <div
            key={index}
            className="border border-muted rounded p-4 bg-background-light space-y-3 relative"
          >
            <button
              type="button"
              className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 border border-muted rounded bg-transparent text-text-primary cursor-pointer transition-colors hover:border-accent hover:text-accent"
              onClick={() => onRemoveResource(index)}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <FormField label="Title">
              <input
                className="w-full h-8 px-2.5 text-sm border border-muted rounded bg-background text-white focus:border-accent focus:outline-none"
                type="text"
                placeholder="Resource title"
                value={resource.title}
                onChange={(e) =>
                  onUpdateResource(index, "title", e.target.value)
                }
              />
            </FormField>

            <FormField label="Content">
              <textarea
                className="w-full px-2.5 py-2 text-sm border border-muted rounded bg-background text-white focus:border-accent focus:outline-none resize-y min-h-[80px]"
                placeholder="Resource content"
                value={resource.content}
                onChange={(e) =>
                  onUpdateResource(index, "content", e.target.value)
                }
                rows={3}
              />
            </FormField>
          </div>
        ))}
      </div>
    </FormSection>
  );
}
