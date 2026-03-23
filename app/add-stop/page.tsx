import { getDrivers } from "@/lib/data";
import AddStopForm from "./AddStopForm";

type Driver = {
  id: string;
  name: string;
  startDate: string;
};

export default async function AddStopPage() {
  const driversRows = await getDrivers();

  const drivers: Driver[] = driversRows.map((d) => ({
    id: d.slug,
    name: d.display_name,
    startDate: d.start_date || "",
  }));

  const simplifiedDrivers = drivers.map((d) => ({
    slug: d.id,
    displayName: d.name,
  }));

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6 text-white bg-slate-950 min-h-screen">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <a href="/" className="text-sm text-sky-300 hover:text-sky-100">
            ← Späť na hlavnú stránku
          </a>
          <a
            href="/"
            className="text-xs text-gray-300 px-3 py-1 border border-gray-600 rounded hover:bg-gray-800"
          >
            Späť
          </a>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Zaznamenaj zastavenie</h1>
          <p className="text-lg text-gray-300">
            Pridaj nové miesto, kde došlo ku kontrole.
          </p>
        </div>
      </div>

      <AddStopForm drivers={simplifiedDrivers} />
    </main>
  );
}
