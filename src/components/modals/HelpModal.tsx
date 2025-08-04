import { BaseModal } from "../common/BaseModal";
import { useModalStore } from "../../lib/stores/modalStore";

interface HelpModalProps {}

export function HelpModal({}: HelpModalProps) {
  const { showHelpModal, closeHelpModal } = useModalStore();

  if (!showHelpModal) return null;

  const footerActions = (
    <div className="flex justify-end w-full">
      <a
        href="https://github.com/spoons-and-mirrors/openmodes.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        Edit on GitHub
      </a>
    </div>
  );

  return (
    <BaseModal
      isOpen={showHelpModal}
      onClose={closeHelpModal}
      title="How to Use"
      maxWidth="2xl"
      actions={footerActions}
      showCloseButton={false}
    >
      {" "}
      <div className="p-6 text-sm leading-relaxed text-text-primary">
        <div className="space-y-4">
          <p>
            <a
              href="/"
              className="text-white underline decoration-text-secondary hover:text-white"
            >
              OpenModes
            </a>{" "}
            is a comprehensive open-source database of AI agent modes with
            tools, system prompts, and configurations.
          </p>

          <p>
            Browse through different agent modes created by the community. Each
            mode defines a specific agent behavior with its own set of tools and
            system prompt. Click on any mode to see its full details, vote on
            it, or download it for use.
          </p>

          <h3 className="text-base font-semibold text-white mt-6 mb-3">API</h3>
          <p>You can access this data through an API.</p>

          <div className="bg-background-light border-l-4 border-accent p-4 rounded-r font-mono text-sm">
            <div className="text-accent">
              # Get modes index (basic info only)
            </div>
            <div>
              <span className="text-accent">curl </span>
              <a
                href="/mode/index"
                className="text-white underline decoration-text-secondary hover:text-white"
              >
                https://openmodes.dev/mode/index
              </a>
            </div>
            <br />
            <div className="text-accent"># Get all modes (full data)</div>
            <div>
              <span className="text-accent">curl </span>
              <a
                href="/mode/all"
                className="text-white underline decoration-text-secondary hover:text-white"
              >
                https://openmodes.dev/mode/all
              </a>
            </div>
            <br />
            <div className="text-accent"># Get specific mode</div>
            <div>
              <span className="text-accent">curl </span>
              <a
                href="/mode/archie"
                className="text-white underline decoration-text-secondary hover:text-white"
              >
                https://openmodes.dev/mode/archie
              </a>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
