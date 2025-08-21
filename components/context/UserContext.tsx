// src/context/UserContext.tsx
import type { User } from "@/constants/DataTypes";
import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

interface UserContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook for easier consumption
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
