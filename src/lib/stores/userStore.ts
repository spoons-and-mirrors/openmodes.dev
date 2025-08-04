import React from "react";
import { create } from "zustand";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { User } from "../types";

interface UserState {
  // Current user from the store
  currentUser: User | null;

  // Loading state
  isLoading: boolean;

  // Actions
  setCurrentUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

const initialState = {
  currentUser: null,
  isLoading: true,
};

export const useUserStore = create<UserState>((set) => ({
  ...initialState,

  setCurrentUser: (user: User | null) =>
    set((state) => ({
      ...state,
      currentUser: user,
      isLoading: false,
    })),

  setLoading: (loading: boolean) =>
    set((state) => ({
      ...state,
      isLoading: loading,
    })),
}));

// Custom hook that combines Convex query with Zustand store
export const useCurrentUser = () => {
  const { currentUser, isLoading, setCurrentUser, setLoading } = useUserStore();

  // Use Convex query to get current user
  const queryResult = useQuery(api.query.getCurrentUser) as
    | User
    | null
    | undefined;

  // Update store when query result changes
  React.useEffect(() => {
    if (queryResult !== undefined) {
      setCurrentUser(queryResult);
    }
  }, [queryResult, setCurrentUser]);

  // Set loading state based on query status
  React.useEffect(() => {
    setLoading(queryResult === undefined);
  }, [queryResult, setLoading]);

  return {
    currentUser,
    isLoading,
  };
};
