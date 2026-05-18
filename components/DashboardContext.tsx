"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

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

  useEffect(() => {
    if (friends.length > 0 && visibleDrivers.length === 0) {
      setVisibleDrivers(friends.map((driver) => driver.id));
    }
  }, [friends, visibleDrivers.length]);

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
