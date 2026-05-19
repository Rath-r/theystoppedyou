"use client";

import { useState } from "react";
import Achievements from "@/components/Achievements";
import QuotesFeed from "@/components/QuotesFeed";

type Stop = {
  id: string;
  driverId: string;
  occurredAt?: string;
  lat: number;
  lng: number;
  label: string;
  note?: string;
  driverDisplayName?: string;
  driverColor?: string;
};

interface DashboardTabsProps {
  stops: Stop[];
  daysDriving: number;
}

export default function DashboardTabs({
  stops,
  daysDriving,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<"quotes" | "achievements">(
    "quotes",
  );

  return (
    <div className="mt-6 space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("quotes")}
          className={`px-4 py-2 text-sm sm:text-base font-medium transition-colors ${
            activeTab === "quotes"
              ? "text-white border-b-2 border-blue-500"
              : "text-slate-400 hover:text-slate-200 cursor-pointer"
          }`}
        >
          Rádio z ciest
        </button>
        <button
          onClick={() => setActiveTab("achievements")}
          className={`px-4 py-2 text-sm sm:text-base font-medium transition-colors ${
            activeTab === "achievements"
              ? "text-white border-b-2 border-blue-500"
              : "text-slate-400 hover:text-slate-200 cursor-pointer"
          }`}
        >
          Achievementy
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === "quotes" && <QuotesFeed />}
        {activeTab === "achievements" && (
          <Achievements stops={stops} daysDriving={daysDriving} />
        )}
      </div>
    </div>
  );
}
