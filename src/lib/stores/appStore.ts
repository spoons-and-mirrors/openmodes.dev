import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SortField =
  | "name"
  | "author"
  | "votes"
  | "downloads"
  | "updated_at"
  | "status";

export type SortOrder = "asc" | "desc";

interface AppState {
  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Sort state
  sortBy: SortField;
  sortOrder: SortOrder;
  setSortBy: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  handleSort: (field: SortField) => void;

  // Pagination state
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  // Reset all filters
  resetFilters: () => void;
}

const initialState = {
  searchQuery: "",
  sortBy: "votes" as SortField,
  sortOrder: "desc" as SortOrder,
  currentPage: 0,
  pageSize: 25,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Search actions
      setSearchQuery: (query: string) =>
        set((state) => ({
          ...state,
          searchQuery: query,
          currentPage: 0, // Reset to first page when searching
        })),

      // Sort actions
      setSortBy: (field: SortField) =>
        set((state) => ({
          ...state,
          sortBy: field,
          currentPage: 0, // Reset to first page when sorting
        })),

      setSortOrder: (order: SortOrder) =>
        set((state) => ({
          ...state,
          sortOrder: order,
          currentPage: 0, // Reset to first page when sorting
        })),

      // Sort handler (same logic as App.tsx)
      handleSort: (field: SortField) => {
        const { sortBy, sortOrder } = get();
        if (sortBy === field) {
          set((state) => ({
            ...state,
            sortOrder: sortOrder === "asc" ? "desc" : "asc",
            currentPage: 0, // Reset to first page when sorting
          }));
        } else {
          set((state) => ({
            ...state,
            sortBy: field,
            sortOrder: "asc",
            currentPage: 0, // Reset to first page when sorting
          }));
        }
      },

      // Pagination actions
      setCurrentPage: (page: number) =>
        set((state) => ({
          ...state,
          currentPage: page,
        })),

      setPageSize: (size: number) =>
        set((state) => ({
          ...state,
          pageSize: size,
          currentPage: 0, // Reset to first page when changing page size
        })),

      goToPage: (page: number) =>
        set((state) => ({
          ...state,
          currentPage: page,
        })),

      nextPage: () =>
        set((state) => ({
          ...state,
          currentPage: state.currentPage + 1,
        })),

      prevPage: () =>
        set((state) => ({
          ...state,
          currentPage: Math.max(0, state.currentPage - 1),
        })),

      // Reset all filters
      resetFilters: () => set(initialState),
    }),
    {
      name: "openmodes-app-state", // localStorage key
      // Only persist user preferences, not search query or current page
      partialize: (state) => ({
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        pageSize: state.pageSize,
      }),
    },
  ),
);
