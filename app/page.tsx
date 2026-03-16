import {
  getDrivers,
  getStops,
  type Driver as DriverRow,
  type Stop as StopRow,
} from "@/lib/data";
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

async function fetchData() {
  try {
    const [driversRows, stopsRows] = await Promise.all([
      getDrivers(),
      getStops(),
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
  const data = await fetchData();

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

  return <HomeClient drivers={data.drivers} stops={data.stops} />;
}
