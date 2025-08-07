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
              Openmodes
            </a>{" "}
            is a comprehensive open-source database for opencode agents with
            tools, system prompts, instructions, resources and configurations.
          </p>
          <p>
            Browse through different agent modes created by the community. Click
            on any mode to see its full details, vote on it, or download it
            using our CLI tool.
          </p>
          <h3 className="text-base font-semibold text-white mt-6 mb-3">API</h3>
          <div className="bg-background-light border-l-4 border-accent p-4 rounded-r font-mono text-sm space-y-2">
            <div>
              <span className="text-accent">curl </span>
              <a
                href="https://openmodes.dev/api/index"
                className="text-white underline decoration-text-secondary hover:text-white"
              >
                https://openmodes.dev/api/index
              </a>
              <span className="text-text-secondary">
                {" "}
                # List all agent modes
              </span>
            </div>
            <div>
              <span className="text-accent">curl </span>
              <a
                href="https://openmodes.dev/api/archie"
                className="text-white underline decoration-text-secondary hover:text-white"
              >
                https://openmodes.dev/api/archie
              </a>
              <span className="text-text-secondary">
                {" "}
                # Get latest version of agent
              </span>
            </div>
            <div>
              <span className="text-accent">curl </span>
              <a
                href="https://openmodes.dev/api/archie@1.0"
                className="text-white underline decoration-text-secondary hover:text-white"
              >
                https://openmodes.dev/api/archie@1.0
              </a>
              <span className="text-text-secondary">
                {" "}
                # Get specific version of agent
              </span>
            </div>
            <div>
              <span className="text-accent">curl </span>
              <a
                href="https://openmodes.dev/api/archie@1.0&betty@2.1"
                className="text-white underline decoration-text-secondary hover:text-white"
              >
                https://openmodes.dev/api/archie@1.0&betty@1.1
              </a>
              <span className="text-text-secondary">
                {" "}
                # Get specific versions of multiple agents
              </span>
            </div>
            <div>
              <span className="text-accent">curl </span>
              <a
                href="https://openmodes.dev/api/archie&betty@2.1"
                className="text-white underline decoration-text-secondary hover:text-white"
              >
                https://openmodes.dev/api/archie&betty@1.1
              </a>
              <span className="text-text-secondary">
                {" "}
                # Get latest of archie and version 1.1 of betty
              </span>
            </div>
          </div>
          <div className="mt-4 text-xs text-text-secondary">
            <strong>API Versioning:</strong> Mode names are globally unique. You
            can fetch the latest or a specific version using <code>@</code>{" "}
            (e.g., <code>mode@1.0</code>). Multiple modes/versions can be
            fetched with <code>&</code>. Only approved versions are returned. If
            a version doesn't exist, it's listed in <code>not_found</code>.
          </div>

          <h3 className="text-base font-semibold text-white mt-6 mb-3">CLI</h3>
          <div className="bg-background-light border-l-4 border-accent p-4 rounded-r font-mono text-sm space-y-3">
            <div>
              <div className="text-accent font-semibold mb-1">
                # Install a mode
              </div>
              <div className="text-white">npx openmodes install archie</div>
            </div>
            <div></div>
            <div>
              <div className="text-accent font-semibold mb-1">
                # Install with options
              </div>
              <div className="text-white">
                npx openmodes install archie@1.1 --dev -g -y
              </div>
              <div className="text-xs text-text-secondary mt-1">
                <code>--dev</code>: Use development server (localhost:5173)
                <br />
                <code>-g</code>: Install globally
                <br />
                <code>-y</code>: Overwrite without confirmation
              </div>
            </div>
            <div>
              <div className="text-accent font-semibold mb-1">
                # Remove a mode
              </div>
              <div className="text-white">npx openmodes remove archie</div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
