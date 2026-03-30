import { getDrivers, fetchStops } from "@/lib/data";
import { auth } from "@/auth";
import HomeClient from "./HomeClient";

type Driver = {
  id: string;
  name: string;
  startDate: string;
};

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

export default async function Home() {
  const session = await auth();

  if (!session) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-3">Welcome to TheyStoppedYou</h1>
          <p className="text-gray-300 mb-6">
            Please sign in to see your stop history.
          </p>
          <form
            action="/api/auth/signin"
            method="post"
            className="inline-block"
          >
            <input type="hidden" name="provider" value="google" />
            <button
              type="submit"
              className="px-5 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Sign in with Google
            </button>
          </form>
        </div>
      </main>
    );
  }

  const userId = Number(session.user?.id);
  const [driversRows, stopsRows] = await Promise.all([
    getDrivers(),
    fetchStops(userId),
  ]);

  console.log("Logged in user stops:", stopsRows.length);

  const driverLookup = new Map<number, string>();
  driversRows.forEach((d) => {
    driverLookup.set(d.id, d.slug);
  });

  const drivers: Driver[] = driversRows.map((d) => ({
    id: d.slug,
    name: d.display_name,
    startDate: d.start_date || "",
  }));

  const stops: Stop[] = stopsRows.map((s) => ({
    id: String(s.id),
    driverId: driverLookup.get(s.driver_id) || "",
    occurredAt: s.occurred_at || undefined,
    lat: s.lat,
    lng: s.lng,
    label: s.label,
    note: s.note || undefined,
    driverDisplayName: s.driver_display_name || undefined,
    driverColor: s.driver_color || "#3b82f6",
  }));

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">
          Welcome, {session.user?.name || session.user?.email}
        </h1>
        <p className="text-gray-400">Your stops are below.</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">{stops.length} stops loaded.</p>
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
          >
            Sign out
          </button>
        </form>
      </div>

      <HomeClient drivers={drivers} stops={stops} />
    </main>
  );
}
