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
          <p>
            OpenModes provides a public API for accessing all mode data
            programmatically. No API key is required.
          </p>
          <div className="bg-background-light border-l-4 border-accent p-4 rounded-r font-mono text-sm space-y-2">
            <div>
              <span className="text-accent">curl </span>
              <a
                href="https://openmodes.dev/api/index"
                className="text-white underline decoration-text-secondary hover:text-white"
              >
                https://openmodes.dev/api/index
              </a>
              <span className="text-text-secondary"> # List all modes</span>
            </div>
            <div>
              <span className="text-accent">curl </span>
              <a
                href="https://openmodes.dev/api/archie"
                className="text-white underline decoration-text-secondary hover:text-white"
              >
                https://openmodes.dev/api/archie
              </a>
              <span className="text-text-secondary"> # Get specific mode</span>
            </div>
            <div>
              <span className="text-accent">curl </span>
              <a
                href="https://openmodes.dev/api/archie&betty"
                className="text-white underline decoration-text-secondary hover:text-white"
              >
                https://openmodes.dev/api/archie&betty
              </a>
              <span className="text-text-secondary"> # Get multiple modes</span>
            </div>
          </div>

          <h3 className="text-base font-semibold text-white mt-6 mb-3">
            CLI Installation
          </h3>
          <p>
            Install modes directly to your OpenCode configuration using the CLI
            tool:
          </p>
          <div className="bg-background-light border-l-4 border-accent p-4 rounded-r font-mono text-sm space-y-3">
            <div>
              <div className="text-accent font-semibold mb-1">
                # Install a mode locally
              </div>
              <div className="text-white">npx openmodes install archie</div>
              <div className="text-xs text-text-secondary mt-1">
                Creates: <code>.opencode/mode/archie.md</code>
                <br />
                Instructions: <code>.opencode/instructions/archie/</code>
              </div>
            </div>
            <div>
              <div className="text-accent font-semibold mb-1">
                # Install globally
              </div>
              <div className="text-white">npx openmodes install archie -g</div>
              <div className="text-xs text-text-secondary mt-1">
                Creates: <code>~/.config/opencode/mode/archie.md</code>
                <br />
                Instructions:{" "}
                <code>~/.config/opencode/instructions/archie/</code>
              </div>
            </div>
            <div>
              <div className="text-accent font-semibold mb-1">
                # Install from dev server
              </div>
              <div className="text-white">
                npx openmodes install testmode --dev
              </div>
              <div className="text-xs text-text-secondary mt-1">
                Fetches from <code>localhost:5173/api/testmode</code>
              </div>
            </div>
            <div>
              <div className="text-accent font-semibold mb-1">
                # Remove a mode
              </div>
              <div className="text-white">npx openmodes remove archie</div>
              <div className="text-white">npx openmodes remove archie -g</div>
            </div>
            <div className="mt-2 text-xs text-text-secondary">
              Each mode becomes a markdown file with YAML frontmatter containing
              tools, mcp configs, and instructions references.
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
