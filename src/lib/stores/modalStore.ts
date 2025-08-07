import { create } from "zustand";
import { Id } from "../../../convex/_generated/dataModel";

interface ModalState {
  // Modal states
  selectedModeId: Id<"modes"> | null;
  showHelpModal: boolean;
  showSubmitModeModal: boolean;
  showEditModeModal: boolean;
  showReviewModal: boolean;
  showAdminPanel: boolean;
  showAdminReviewNotificationModal: boolean;
  submittedModeName: string;

  // Actions
  openModeModal: (modeId: Id<"modes">) => void;
  closeModeModal: () => void;
  openHelpModal: () => void;
  closeHelpModal: () => void;
  openSubmitModeModal: () => void;
  closeSubmitModeModal: () => void;
  openEditModeModal: () => void;
  closeEditModeModal: () => void;
  openReviewModal: () => void;
  closeReviewModal: () => void;
  openAdminPanel: () => void;
  closeAdminPanel: () => void;
  openAdminReviewNotificationModal: (modeName: string) => void;
  closeAdminReviewNotificationModal: () => void;
  closeAllModals: () => void;
}

const initialState = {
  selectedModeId: null,
  showHelpModal: false,
  showSubmitModeModal: false,
  showEditModeModal: false,
  showReviewModal: false,
  showAdminPanel: false,
  showAdminReviewNotificationModal: false,
  submittedModeName: "",
};

export const useModalStore = create<ModalState>((set) => ({
  ...initialState,

  // Mode modal actions
  openModeModal: (modeId: Id<"modes">) =>
    set((state) => ({
      ...state,
      selectedModeId: modeId,
      // Close other modals when opening mode modal
      showEditModeModal: false,
    })),

  closeModeModal: () =>
    set((state) => ({
      ...state,
      selectedModeId: null,
    })),

  // Help modal actions
  openHelpModal: () =>
    set((state) => ({
      ...state,
      showHelpModal: true,
    })),

  closeHelpModal: () =>
    set((state) => ({
      ...state,
      showHelpModal: false,
    })),

  // Submit mode modal actions
  openSubmitModeModal: () =>
    set((state) => ({
      ...state,
      showSubmitModeModal: true,
    })),

  closeSubmitModeModal: () =>
    set((state) => ({
      ...state,
      showSubmitModeModal: false,
    })),

  // Edit mode modal actions
  openEditModeModal: () =>
    set((state) => ({
      ...state,
      showEditModeModal: true,
      // Keep selectedModeId for edit modal to use
    })),

  closeEditModeModal: () =>
    set((state) => ({
      ...state,
      showEditModeModal: false,
    })),

  // Review modal actions
  openReviewModal: () =>
    set((state) => ({
      ...state,
      showReviewModal: true,
    })),

  closeReviewModal: () =>
    set((state) => ({
      ...state,
      showReviewModal: false,
    })),

  // Admin panel actions
  openAdminPanel: () =>
    set((state) => ({
      ...state,
      showAdminPanel: true,
    })),

  closeAdminPanel: () =>
    set((state) => ({
      ...state,
      showAdminPanel: false,
    })),

  // Close all modals (useful for escape key handling)
  closeAllModals: () => set(initialState),

  // Admin review notification modal actions
  openAdminReviewNotificationModal: (modeName: string) =>
    set((state) => ({
      ...state,
      showAdminReviewNotificationModal: true,
      submittedModeName: modeName,
    })),

  closeAdminReviewNotificationModal: () =>
    set((state) => ({
      ...state,
      showAdminReviewNotificationModal: false,
      submittedModeName: "",
    })),
}));
