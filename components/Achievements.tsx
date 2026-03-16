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
            <div className="text-sm text-gray-600 mt-1">
              🚓 Policajný index: {policeIndex} / 10 – {policeLabel}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Odomknuté {unlockedCount} / {totalCount}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-700">
          <span className="font-medium">Policajný forecast:</span>
          <span className="rounded-full bg-gray-100 px-3 py-1">
            {policeForecast}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 items-start">
        {achievementStatuses.map(({ definition, unlocked }) => (
          <div
            key={definition.id}
            className="flex flex-col items-center gap-2 p-1 cursor-pointer hover:scale-105 transition-transform"
          >
            <div
              className={`relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all ring-0 ${
                unlocked
                  ? "bg-white border-2 border-yellow-200 shadow-sm"
                  : "bg-gray-100 opacity-60 grayscale border border-transparent"
              }`}
            >
              <definition.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-900" />
              {!unlocked ? (
                <div className="absolute -bottom-1 -right-1 text-xs">🔒</div>
              ) : null}
            </div>

            <div className="text-center">
              <div
                className={`font-semibold text-xs ${unlocked ? "text-gray-900" : "text-gray-500"}`}
              >
                {definition.title}
              </div>
              <div className="text-xs text-gray-500">
                {definition.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
