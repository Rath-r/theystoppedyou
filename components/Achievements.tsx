"use client";

import React from "react";
import {
  getAchievements,
  type AchievementContext,
  type Stop,
} from "../lib/achievements";
import { getPoliceForecast } from "../lib/policeForecast";

export default function Achievements({
  stops,
  daysDriving,
}: {
  stops: Stop[];
  daysDriving: number;
}) {
  const context: AchievementContext = { stops, daysDriving };
  const achievementStatuses = getAchievements(context);
  const unlockedCount = achievementStatuses.filter((a) => a.unlocked).length;
  const totalCount = achievementStatuses.length;

  const diffDays = (a: Date, b: Date) => {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((b.getTime() - a.getTime()) / msPerDay);
  };

  const sortedByDate = stops
    .filter((s) => s.occurredAt)
    .sort(
      (a, b) =>
        new Date(a.occurredAt!).getTime() - new Date(b.occurredAt!).getTime(),
    );

  const mostRecent =
    sortedByDate.length > 0 ? sortedByDate[sortedByDate.length - 1] : undefined;

  const daysSinceLastStop =
    mostRecent && mostRecent.occurredAt
      ? diffDays(new Date(mostRecent.occurredAt), new Date())
      : undefined;

  const computePoliceIndex = (totalStops: number, days: number): number => {
    const rawScore = totalStops + days / 365;
    const value = Math.floor(rawScore);
    return Math.max(0, Math.min(10, value));
  };

  const policeIndex = computePoliceIndex(stops.length, daysDriving);
  const policeLabel =
    policeIndex <= 2
      ? "Nenápadný typ"
      : policeIndex <= 5
        ? "Mierne podozrivý"
        : policeIndex <= 8
          ? "Známa tvár"
          : "Hliadka zbystrila";

  const policeForecast = getPoliceForecast({
    stops,
    policeIndex,
    unlockedBadgeCount: unlockedCount,
    daysSinceLastStop,
  });

  return (
    <section className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-xl font-semibold">Achievements</h2>
            <div className="text-sm text-slate-400 mt-1">
              🚓 Policajný index: {policeIndex} / 10 – {policeLabel}
            </div>
          </div>
          <div className="text-sm text-slate-400">
            Odomknuté {unlockedCount} / {totalCount}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-medium">Policajný forecast:</span>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
            {policeForecast}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 items-start">
        {achievementStatuses.map(({ definition, unlocked }) => (
          <div
            key={definition.id}
            className={`flex flex-col items-center text-center p-4 rounded-xl backdrop-blur-sm border ${unlocked ? "bg-slate-900/60 border-slate-800" : "bg-slate-900/40 border-slate-800/30 opacity-40"}`}
          >
            <div className="mb-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${unlocked ? "bg-white" : "bg-slate-700"}`}
              >
                <definition.icon
                  className={`h-6 w-6 ${unlocked ? "text-gray-900" : "text-slate-300"}`}
                />
              </div>
            </div>

            <div className="w-full">
              <div
                className={`font-semibold text-sm mb-1 ${unlocked ? "text-slate-100" : "text-slate-400"}`}
              >
                {definition.title}
              </div>
              <div className="text-xs text-slate-400">
                {definition.description}
              </div>
            </div>

            {!unlocked && (
              <div className="mt-3 text-xs text-slate-500">🔒 Locked</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
