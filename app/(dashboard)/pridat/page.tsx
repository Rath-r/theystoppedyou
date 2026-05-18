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
    <main className="min-h-full flex-1 w-full bg-[#0b0f19] text-slate-100 font-sans py-10 px-6">
      <div className="w-full space-y-10">
        <div className="rounded-[32px] border border-slate-800 bg-slate-950/95 p-8 shadow-xl shadow-slate-950/40">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500 mb-3">
            Pridať nové zastavenie
          </p>
          <h1 className="text-4xl font-semibold text-slate-100">
            Zaznamenaj zastavenie
          </h1>
          <p className="mt-3 text-slate-400">
            Pridaj nové miesto na mape a označ ho, aby všetci videli, kde sa ťa
            zastavili.
          </p>
        </div>

        <div className="w-full rounded-[32px] border border-slate-800 bg-slate-950/95 p-6 shadow-xl shadow-slate-950/40">
          <AddStopForm drivers={simplifiedDrivers} />
        </div>
      </div>
    </main>
  );
}
