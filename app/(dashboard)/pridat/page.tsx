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
    <main className="min-h-full p-6 text-white">
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Zaznamenaj zastavenie</h1>
          <p className="text-slate-400">
            Pridaj nové miesto, kde došlo ku kontrole.
          </p>
        </div>
        <AddStopForm drivers={simplifiedDrivers} />
      </div>
    </main>
  );
}
