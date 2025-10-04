"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

interface ViewHistoryItem {
  postId: number;
  count: number;
}

interface ViewingHistoryContextType {
  viewHistory: ViewHistoryItem[];
  addToHistory: (postId: number) => void;
  clearHistory: () => void;
  getViewCount: (postId: number) => number;
}

const ViewingHistoryContext = createContext<
  ViewingHistoryContextType | undefined
>(undefined);

/**
 * ViewingHistoryProvider component
 * This is starter code - candidates will need to implement the history logic
 */
export function ViewingHistoryProvider({ children }: { children: ReactNode }) {
  const [viewHistory, setViewHistory] = useState<ViewHistoryItem[]>([]);

  // TODO: Implement addToHistory function
  // If postId exists, increment its count
  // If postId doesn't exist, add it with count = 1
  const addToHistory = useCallback(
    (postId: number) => {
      // Your implementation here
      throw new Error("addToHistory function not implemented");
    },
    [viewHistory],
  );

  // TODO: Implement clearHistory function
  // Clear all viewing history
  const clearHistory = useCallback(() => {
    // Your implementation here
    throw new Error("clearHistory function not implemented");
  }, []);

  // TODO: Implement getViewCount function
  // Return how many times a post has been viewed (0 if never viewed)
  const getViewCount = useCallback(
    (postId: number): number => {
      // Your implementation here
      return 0;
    },
    [viewHistory],
  );

  return (
    <ViewingHistoryContext.Provider
      value={{ viewHistory, addToHistory, clearHistory, getViewCount }}
    >
      {children}
    </ViewingHistoryContext.Provider>
  );
}

/**
 * Hook to use the viewing history context
 * Throws an error if used outside of ViewingHistoryProvider
 */
export function useViewingHistory() {
  const context = useContext(ViewingHistoryContext);
  if (context === undefined) {
    throw new Error(
      "useViewingHistory must be used within a ViewingHistoryProvider",
    );
  }
  return context;
}
