import { getDrivers, fetchStops } from "@/lib/data";
import { auth } from "@/auth";
import HomeClient from "./HomeClient";
import SignOutButton from "@/components/SignOutButton";

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
            <form action="/api/auth/signin" method="post">
              <input type="hidden" name="provider" value="google" />
              <button
                type="submit"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-white text-slate-900 font-semibold shadow hover:brightness-95"
              >
                <span className="w-5 h-5 inline-block">
                  {/* simple placeholder Google 'G' */}
                  <svg
                    viewBox="0 0 48 48"
                    className="w-5 h-5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M44.5 20H24v8.5h11.9C34.2 33 30 36 24 36c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.4 0 6.4 1.2 8.6 3.2l6-6C33 3.8 28.8 2 24 2 12.3 2 3 11.3 3 23s9.3 21 21 21 21-9.3 21-21c0-1.4-.1-2.7-.5-4z"
                      fill="#EA4335"
                    />
                  </svg>
                </span>
                Prihlásiť sa cez Google
              </button>
            </form>
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
                <a href="https://www.ratrak.sk" target="_blank">
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

  console.log("Logged in user stops:", stopsRows.length);

  const currentDriverRecord = driversRows.find(
    (d) => d.owner_user_id === userId,
  );

  if (!currentDriverRecord) {
    return (
      <main className="mx-auto max-w-5xl p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Driver profile needed</h1>
        <p className="text-gray-500">
          No driver profile found for your account. Please go to Settings and
          set your driver profile.
        </p>
      </main>
    );
  }

  const driverLookup = new Map<number, string>();
  driversRows.forEach((driver) => {
    driverLookup.set(driver.id, driver.slug);
  });

  const drivers: Driver[] = [
    {
      id: currentDriverRecord.slug,
      name: currentDriverRecord.display_name,
      startDate: currentDriverRecord.start_date || "",
    },
  ];

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

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-end mb-4">
        <SignOutButton />
      </div>

      <HomeClient drivers={drivers} stops={stops} />
    </main>
  );
}
