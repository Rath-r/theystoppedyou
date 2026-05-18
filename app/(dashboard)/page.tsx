import { getDrivers, fetchStops } from "@/lib/data";
import { auth } from "@/auth";
import DashboardMap from "@/components/DashboardMap";
import Achievements from "@/components/Achievements";
import GoogleSignInButton from "@/components/GoogleSignInButton";

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

const calculateDaysDriving = (startDate: string) => {
  return Math.max(
    1,
    Math.ceil(
      (Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24),
    ),
  );
};

export default async function Home() {
  const session = await auth();
  if (!session) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex items-center">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4">
            TheyStoppedYou
          </h1>
          <p className="text-xl text-slate-300 mb-6 italic">
            Zase ťa vyblikali? Vitaj v klube.
          </p>

          <p className="text-slate-400 max-w-2xl mx-auto mb-8">
            Súkromná sociálna sieť pre teba a tvojich kamošov. Zdieľaj svoje
            stopky, porovnávaj pokuty a zisti, kto z vás jazdí ako magnet na
            hliadky.
          </p>

          <div className="flex items-center justify-center">
            <GoogleSignInButton />
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="p-4 rounded-lg bg-slate-800/60">
              <div className="text-2xl mb-2">Súkromná mapa</div>
              <div className="text-slate-400 text-sm">
                Tvoje stopky pod kontrolou
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/60">
              <div className="text-2xl mb-2">Sledovanie kamošov</div>
              <div className="text-slate-400 text-sm">
                Instagram-style pre vodičov
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/60">
              <div className="text-2xl mb-2">Vlastný štýl</div>
              <div className="text-slate-400 text-sm">
                Každý vodič má na mape svoju vlastnú farbu
              </div>
            </div>
          </div>
          <footer className="mt-16 pt-8 pb-4 text-sm text-slate-500 transition-colors border-t border-slate-800">
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="">
                Made with ☕ by{" "}
                <a
                  href="https://www.ratrak.sk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  www.ratrak.sk
                </a>
              </span>
              <a
                href="https://www.buymeacoffee.com/ratrak"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-400 hover:text-slate-300 underline"
              >
                Podpor tento projekt na Buy Me a Coffee
              </a>
            </div>
          </footer>
        </div>
      </main>
    );
  }

  const userId = Number(session.user?.id);
  const [driversRows, stopsRows] = await Promise.all([
    getDrivers(),
    fetchStops(userId),
  ]);

  const currentDriverRecord = driversRows.find(
    (d) => d.owner_user_id === userId,
  );

  if (!currentDriverRecord) {
    return (
      <main className="min-h-full p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Driver profile needed</h1>
        <p className="text-slate-400">
          No driver profile found for your account. Please go to Nastavenia
          profilu and set your driver profile.
        </p>
      </main>
    );
  }

  const driverLookup = new Map<number, string>();
  driversRows.forEach((driver) => {
    driverLookup.set(driver.id, driver.slug);
  });

  const stops: Stop[] = stopsRows.map((s) => ({
    id: String(s.id),
    driverId: driverLookup.get(s.driver_id) || currentDriverRecord.slug,
    occurredAt: s.occurred_at || undefined,
    lat: s.lat,
    lng: s.lng,
    label: s.label,
    note: s.note || undefined,
    driverDisplayName: s.driverName || currentDriverRecord.display_name,
    driverColor: s.driverColor || "#3b82f6",
  }));

  const daysDriving = calculateDaysDriving(
    currentDriverRecord.start_date || new Date().toISOString(),
  );
  const driverStops = stops.filter(
    (s) => s.driverId === currentDriverRecord.slug,
  );

  return (
    <main className="min-h-full p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          Šoféruješ už {daysDriving} dní
        </h2>
        <p className="text-sm text-slate-400">
          Zastavili ťa{" "}
          <strong className="text-white">{driverStops.length}×</strong>
        </p>
      </div>

      <div className="h-[65vh] rounded-3xl overflow-hidden shadow-xl shadow-slate-950/40 border border-slate-800">
        <DashboardMap stops={stops} activeDriver={currentDriverRecord.slug} />
      </div>

      <div className="mt-6">
        <Achievements stops={driverStops} daysDriving={daysDriving} />
      </div>
    </main>
  );
}
