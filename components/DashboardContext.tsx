"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type DashboardVisibilityContextValue = {
  visibleDrivers: string[];
  toggleDriverVisibility: (id: string) => void;
};

const DashboardVisibilityContext = createContext<
  DashboardVisibilityContextValue | undefined
>(undefined);

export function DashboardVisibilityProvider({
  friends,
  children,
}: {
  friends: { id: string; name: string; color?: string }[];
  children: React.ReactNode;
}) {
  const [visibleDrivers, setVisibleDrivers] = useState<string[]>([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (friends.length > 0 && !initializedRef.current) {
      setVisibleDrivers(friends.map((driver) => driver.id));
      initializedRef.current = true;
    }
  }, [friends]);

  const toggleDriverVisibility = (id: string) => {
    setVisibleDrivers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <DashboardVisibilityContext.Provider
      value={{ visibleDrivers, toggleDriverVisibility }}
    >
      {children}
    </DashboardVisibilityContext.Provider>
  );
}

export function useDashboardVisibility() {
  const context = useContext(DashboardVisibilityContext);
  if (!context) {
    throw new Error(
      "useDashboardVisibility must be used within a DashboardVisibilityProvider",
    );
  }
  return context;
}
