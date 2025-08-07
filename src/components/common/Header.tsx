import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { CircleUserRound } from "lucide-react";
import { LoginForm } from "../forms/login-form";
import { api } from "../../../convex/_generated/api";
import { useModalStore } from "../../lib/stores/modalStore";
import { useAppStore } from "../../lib/stores/appStore";
import { useCurrentUser } from "../../lib/stores/userStore";

export function Header() {
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { signOut } = useAuthActions();
  const { currentUser } = useCurrentUser();

  // Only query pending count if user has moderator access
  const shouldQueryRevisions =
    currentUser &&
    (currentUser.role === "moderator" || currentUser.role === "admin");
  const pendingCount = useQuery(
    api.query.getPendingCount,
    shouldQueryRevisions ? {} : "skip",
  );
  const menuRef = useRef<HTMLDivElement>(null);

  // Use modal store
  const {
    openHelpModal,
    openSubmitModeModal,
    openReviewModal,
    openAdminPanel,
  } = useModalStore();

  // Use app store for search
  const { searchQuery, setSearchQuery } = useAppStore();

  useEffect(() => {
    if (showLogin) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [showLogin]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleUserIconClick = () => {
    if (currentUser) {
      setShowUserMenu(!showUserMenu);
    } else {
      setShowLogin(true);
    }
  };

  const handleSignOut = async () => {
    setShowUserMenu(false);
    await signOut();
  };

  const handleSubmitModeClick = () => {
    if (currentUser) {
      openSubmitModeModal();
    } else {
      setShowLogin(true);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b border-muted z-50">
        <div className="max-w-[1280px] mx-auto h-full flex items-center justify-between px-4 gap-4">
          {/* Left side - Logo and description */}
          <div className="flex items-baseline min-w-0 overflow-hidden">
            <h1 className="text-base font-semibold uppercase tracking-tight m-0 text-white">
              OpenModes.dev
            </h1>
            <span className="mx-2 text-muted">|</span>
            <p className="text-sm text-text-secondary m-0 hidden md:block">
              An open-source database for{" "}
              <a
                href="https://opencode.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-white/80 hover:text-white"
              >
                opencode
              </a>{" "}
              agents
            </p>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {/* GitHub Link */}
            <a
              className="text-text-primary opacity-85 hover:text-white transition-colors hidden lg:block"
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/spoons-and-mirrors/openmodes.dev"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2" />
              </svg>
            </a>

            {/* Search */}
            <div className="relative hidden md:block">
              <input
                type="text"
                id="search"
                className="w-40 h-8 px-3 pr-8 text-sm bg-background-light border border-muted rounded text-white placeholder-text-secondary focus:border-accent focus:outline-none"
                placeholder="Search modes"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchQuery("");
                  }
                }}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-secondary pointer-events-none font-mono">
                ⌘K
              </span>
            </div>

            {/* Action Buttons */}
            <button
              className="h-8 px-3 text-sm bg-accent text-muted border-none rounded font-medium hover:bg-accent/90 transition-colors cursor-pointer"
              onClick={handleSubmitModeClick}
            >
              Submit Mode
            </button>
            <button
              className="h-8 px-3 text-sm bg-accent text-muted border-none rounded font-medium hover:bg-accent/90 transition-colors cursor-pointer"
              onClick={openHelpModal}
            >
              How to use
            </button>

            {/* User Icon - Always visible */}
            <div className="relative" ref={menuRef}>
              <button
                className="h-8 w-8 flex items-center justify-center bg-background-light text-text-primary border border-muted rounded hover:bg-muted hover:text-white transition-colors cursor-pointer relative"
                onClick={handleUserIconClick}
              >
                <CircleUserRound size={16} />
                {/* User indicator - show for all signed in users */}
                {currentUser && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full border border-background"></span>
                )}
              </button>

              {/* Dropdown menu for signed-in users */}
              {showUserMenu && currentUser && (
                <div className="absolute right-0 top-10 w-48 bg-background border border-muted rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-muted text-right">
                    <p className="text-sm text-white font-medium truncate">
                      {currentUser.name || currentUser.email}
                    </p>
                    {currentUser.name && (
                      <p className="text-xs text-text-secondary truncate">
                        {currentUser.email}
                      </p>
                    )}
                    {currentUser.role === "moderator" && (
                      <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                        Moderator
                      </span>
                    )}
                    {currentUser.role === "admin" && (
                      <span className="inline-block mt-1 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="p-1">
                    {currentUser.role === "admin" && openAdminPanel && (
                      <>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            openAdminPanel();
                          }}
                          className="w-full text-right px-3 py-2 text-sm text-text-primary hover:bg-background-light hover:text-white transition-colors rounded"
                        >
                          Admin Panel
                        </button>
                        <div className="h-px bg-muted my-1" />
                      </>
                    )}
                    {(currentUser.role === "moderator" ||
                      currentUser.role === "admin") &&
                      openReviewModal && (
                        <>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              openReviewModal();
                            }}
                            className="w-full text-right px-3 py-2 text-sm text-text-primary hover:bg-background-light hover:text-white transition-colors rounded flex items-center justify-end gap-2"
                          >
                            Review
                            {pendingCount && pendingCount > 0 && (
                              <span className="bg-accent text-muted text-xs px-1.5 py-0.5 rounded-full font-medium min-w-[20px] text-center">
                                {pendingCount}
                              </span>
                            )}
                          </button>
                          <div className="h-px bg-muted my-1" />
                        </>
                      )}{" "}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-right px-3 py-2 text-sm text-text-primary hover:bg-background-light hover:text-white transition-colors rounded"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogin(false)}
          />

          {/* Modal */}
          <div className="relative bg-background border border-muted rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-muted">
              <h2 className="text-lg font-semibold text-white uppercase tracking-tight">
                Sign In
              </h2>
              <button
                onClick={() => setShowLogin(false)}
                className="p-2 text-text-primary hover:text-white transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto modal-scrollbar">
              <LoginForm onClose={() => setShowLogin(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
