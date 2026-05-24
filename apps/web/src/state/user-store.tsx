import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import type { UserDto } from "@mundial-album/shared";

const STORAGE_KEY = "mundial-album-current-user";

type UserContextValue = {
  currentUser: UserDto | null;
  setCurrentUser: (user: UserDto | null) => void;
};

const UserContext = createContext<UserContextValue | null>(null);

function readStoredUser(): UserDto | null {
  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as UserDto;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<UserDto | null>(() => readStoredUser());

  const value = useMemo<UserContextValue>(
    () => ({
      currentUser,
      setCurrentUser: (user) => {
        if (user) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }

        setCurrentUserState(user);
      }
    }),
    [currentUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
}

export function useRequiredUser(): UserDto {
  const { currentUser } = useUser();

  if (!currentUser) {
    throw new Error("A selected user is required for this page");
  }

  return currentUser;
}
