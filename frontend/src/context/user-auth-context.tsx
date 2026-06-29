"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  userLogin as apiUserLogin,
  userRegister as apiUserRegister,
  userSetPassword as apiUserSetPassword,
  userLogout as apiUserLogout,
  userVerify,
  type User,
} from "@/lib/api";

interface UserAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    name: string,
    password: string,
    phone?: string,
  ) => Promise<boolean>;
  setPassword: (token: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(
  undefined,
);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const result = await userVerify();
      if (result?.authenticated && result.user) {
        setUser(result.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const result = await apiUserLogin(email, password);
        if (result.success && result.user) {
          setUser(result.user);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [],
  );

  const register = useCallback(
    async (
      email: string,
      name: string,
      password: string,
      phone?: string,
    ): Promise<boolean> => {
      try {
        const result = await apiUserRegister(email, name, password, phone);
        if (result.success && result.user) {
          setUser(result.user);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [],
  );

  const setPassword = useCallback(
    async (token: string, password: string): Promise<boolean> => {
      try {
        const result = await apiUserSetPassword(token, password);
        if (result.success && result.user) {
          setUser(result.user);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await apiUserLogout();
    } catch {
      // Client-side logout regardless
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      setPassword,
      logout,
    }),
    [user, isLoading, login, register, setPassword, logout],
  );

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }
  return context;
}
