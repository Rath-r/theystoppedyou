"use client";

import dynamic from "next/dynamic";
import stops from "@/data/stops.json";

const StopsMap = dynamic(() => import("@/components/StopsMap"), {
  ssr: false,
});

type Stop = {
  id: string;
  occurredAt?: string;
  lat: number;
  lng: number;
  label: string;
  note?: string;
};

const calculateDaysDriving = () => {
  const startDate = new Date("2026-01-03T00:00:00+01:00");
  return Math.max(
    1,
    Math.ceil((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
  );
};

export default function Home() {
  const daysDriving = calculateDaysDriving();

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">
          Marek šoféruje už {daysDriving} dní
        </h1>
        <p className="text-lg">
          Zastavili ho <b>{(stops as Stop[]).length}×</b> – tu všade 👮
        </p>
      </header>

      <StopsMap stops={stops as Stop[]} />

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Zoznam</h2>
        <ul className="space-y-2">
          {(stops as Stop[])
            .slice()
            .sort((a, b) => {
              const dateA = a.occurredAt ? new Date(a.occurredAt).getTime() : 0;
              const dateB = b.occurredAt ? new Date(b.occurredAt).getTime() : 0;
              return dateB - dateA;
            })
            .map((s) => (
              <li key={s.id} className="rounded-xl border p-3">
                <div className="font-semibold">{s.label}</div>
                {s.occurredAt && (
                  <div className="text-sm opacity-80">
                    {new Date(s.occurredAt).toLocaleString("sk-SK")}
                  </div>
                )}
                {s.note ? <div className="mt-1">{s.note}</div> : null}
              </li>
            ))}
        </ul>
      </section>
    </main>
  );
}
