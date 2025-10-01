"use client";

import { User } from "@/types/creator";
import { createContext, ReactNode, useContext, useState } from "react";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component
 * This is starter code - candidates will need to implement the auth logic
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // TODO: Implement login function
  // For this mock implementation, accept any email/password
  // and set a user object with just the email
  const login = async (email: string, password: string) => {
    // Your implementation here
    throw new Error("Login function not implemented");
  };

  // TODO: Implement logout function
  const logout = () => {
    // Your implementation here
    throw new Error("Logout function not implemented");
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use the auth context
 * Throws an error if used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
