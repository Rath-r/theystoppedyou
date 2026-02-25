"use client";

import React from "react";

type Stop = {
  id: string;
  driverId?: string;
  occurredAt?: string;
  lat: number;
  lng: number;
  label: string;
  note?: string;
};

export type Achievement = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  unlocked: boolean;
  hidden?: boolean;
};

const diffDays = (a: Date, b: Date) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((b.getTime() - a.getTime()) / msPerDay);
};

const getLevelName = (stopsCount: number) => {
  if (stopsCount === 0) return "🚗 Nováčik";
  if (stopsCount <= 2) return "👀 Pozorovaný";
  if (stopsCount <= 4) return "🕵️ Zaujímavý";
  return "🕶️ Legenda";
};

export default function Achievements({
  stops,
  daysDriving,
}: {
  stops: Stop[];
  daysDriving: number;
}) {
  const now = new Date();

  const sortedByDate = stops
    .map((s) => ({ ...s }))
    .filter((s) => s.occurredAt)
    .sort(
      (a, b) =>
        new Date(a.occurredAt!).getTime() - new Date(b.occurredAt!).getTime(),
    );

  const mostRecent =
    sortedByDate.length > 0 ? sortedByDate[sortedByDate.length - 1] : undefined;

  const daysSinceLastStop =
    mostRecent && mostRecent.occurredAt
      ? diffDays(new Date(mostRecent.occurredAt), now)
      : -1;

  const labelCounts: Record<string, number> = {};
  stops.forEach((s) => {
    labelCounts[s.label] = (labelCounts[s.label] || 0) + 1;
  });

  const uniqueLabels = Object.keys(labelCounts).length;

  const anyHour = (predicate: (h: number) => boolean) =>
    stops.some(
      (s) => s.occurredAt && predicate(new Date(s.occurredAt).getHours()),
    );

  const hasPairWithin = (windowDays: number, requiredCount = 2) => {
    if (sortedByDate.length < requiredCount) return false;
    // sliding window
    let left = 0;
    for (let right = 0; right < sortedByDate.length; right++) {
      const leftDate = new Date(sortedByDate[left].occurredAt!);
      const rightDate = new Date(sortedByDate[right].occurredAt!);
      while (diffDays(leftDate, rightDate) > windowDays) {
        left++;
        if (left > right) break;
      }
      if (right - left + 1 >= requiredCount) return true;
    }
    return false;
  };

  const achievements: Achievement[] = [
    {
      id: "prvy-kontakt",
      emoji: "🚓",
      title: "Prvý kontakt",
      description: "Oficiálne si si všimli.",
      unlocked: stops.length >= 1,
    },
    {
      id: "zname-tvar",
      emoji: "👀",
      title: "Známa tvár",
      description: "Možno ťa už poznajú podľa auta.",
      unlocked: stops.length >= 3,
    },
    {
      id: "lokalna-legenda",
      emoji: "🕶️",
      title: "Lokálna legenda",
      description: "Vernostná karta sa pripravuje.",
      unlocked: stops.length >= 5,
    },
    {
      id: "cisty-tyzden",
      emoji: "🧊",
      title: "Čistý týždeň",
      description: "Nikto si ťa nevšimol. Zatiaľ.",
      unlocked: daysSinceLastStop >= 7,
    },
    {
      id: "mestsky-klasik",
      emoji: "🏙️",
      title: "Mestský klasik",
      description: "Toto mesto ťa má rado.",
      unlocked: Object.values(labelCounts).some((c) => c >= 2),
    },
    {
      id: "nocny-jazdec",
      emoji: "🌙",
      title: "Nočný jazdec",
      description: "Mesiac bol svedkom.",
      unlocked: anyHour((h) => h >= 22),
    },
    {
      id: "ranna-vtaca",
      emoji: "🌅",
      title: "Ranná vtáča",
      description: "Dobré ráno, pane vodič.",
      unlocked: anyHour((h) => h < 6),
    },
    {
      id: "divoky-tyzden",
      emoji: "🎢",
      title: "Divoký týždeň",
      description: "Vesmír mal iné plány.",
      unlocked: hasPairWithin(7, 2),
    },
    {
      id: "cestovatel",
      emoji: "🗺️",
      title: "Cestovateľ",
      description: "Turné pokračuje.",
      unlocked: uniqueLabels >= 3,
    },
    {
      id: "neprehliadnutelny",
      emoji: "🐣",
      title: "Neprehliadnuteľný",
      description: "Objavil sa nový badge?!",
      unlocked: hasPairWithin(14, 3),
      hidden: true,
    },
  ];

  const visibleAchievements = achievements.filter(
    (a) => !a.hidden || a.unlocked,
  );
  const nonHiddenCount = achievements.filter((a) => !a.hidden).length;
  const unlockedNonHidden = achievements.filter(
    (a) => !a.hidden && a.unlocked,
  ).length;

  const levelName = getLevelName(stops.length);

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">Achievements</h2>
        <div className="text-sm text-gray-600">
          <span className="mr-3">
            🔓 Odomknuté {unlockedNonHidden} / {nonHiddenCount}
          </span>
          <span className="px-2 py-1 text-xs bg-gray-100 rounded">
            {levelName}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {visibleAchievements.map((a) => (
          <div
            key={a.id}
            className={`rounded-lg p-3 border transition-colors flex flex-col gap-2 min-h-[84px] ${
              a.unlocked
                ? "bg-white border-gray-200"
                : "bg-gray-50 border-transparent opacity-60 grayscale"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-3xl">{a.emoji}</div>
              <div className="text-sm text-gray-500">
                {!a.unlocked ? "🔒" : null}
              </div>
            </div>

            <div>
              <div className="font-semibold">{a.title}</div>
              <div className="text-sm text-gray-600">{a.description}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
