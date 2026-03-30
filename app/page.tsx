import { getDrivers, getStops } from "@/lib/data";
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
};

async function fetchData(userId?: string | number) {
  try {
    const [driversRows, stopsRows] = await Promise.all([
      getDrivers(),
      getStops(userId),
    ]);

    // Build lookup: driver_id -> slug
    const driverLookup = new Map<number, string>();
    driversRows.forEach((d) => {
      driverLookup.set(d.id, d.slug);
    });

    // Map drivers
    const drivers: Driver[] = driversRows.map((d) => ({
      id: d.slug,
      name: d.display_name,
      startDate: d.start_date || "",
    }));

    // Map stops
    const stops: Stop[] = stopsRows.map((s) => ({
      id: String(s.id),
      driverId: driverLookup.get(s.driver_id) || "",
      occurredAt: s.occurred_at || undefined,
      lat: s.lat,
      lng: s.lng,
      label: s.label,
      note: s.note || undefined,
    }));

    return { drivers, stops };
  } catch (error) {
    console.error("Failed to fetch data from database:", error);
    return null;
  }
}

export default async function Home() {
  const session = await auth();
  const userId = session?.user?.id;

  const data = await fetchData(userId);

  if (!session) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p>To see your stops and drivers, please sign in.</p>
          <form action="/api/auth/signin" method="post" className="mt-4">
            <input type="hidden" name="provider" value="google" />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Sign in with Google
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Oops!</h1>
          <p>Unable to load data from the database. Please try again later.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-400">
            Signed in as {session.user?.name || session.user?.email}
          </p>
        </div>
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="inline-flex items-center justify-center px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
          >
            Sign out
          </button>
        </form>
      </div>
      <HomeClient drivers={data.drivers} stops={data.stops} />
    </main>
  );
}
