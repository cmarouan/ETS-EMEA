"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCurrentUser } from "@/lib/api/get-current-user";
import type { AuthenticatedUser } from "@/types/auth";

interface CurrentUserContextValue {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  hasError: boolean;
  setUser: (user: AuthenticatedUser) => void;
  refreshUser: () => Promise<void>;
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    void getCurrentUser()
      .then((currentUser) => {
        if (isCurrent) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setHasError(true);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      setUser(await getCurrentUser());
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, hasError, setUser, refreshUser }),
    [user, isLoading, hasError, refreshUser],
  );

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser() {
  const context = useContext(CurrentUserContext);

  if (!context) {
    throw new Error("useCurrentUser must be used within CurrentUserProvider.");
  }

  return context;
}
