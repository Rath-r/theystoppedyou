"use server";

import { pool } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

async function getDriverByUser(userId: number) {
  const result = await pool.query(
    "SELECT id, display_name, color, start_date FROM drivers WHERE user_id = $1 LIMIT 1",
    [userId],
  );

  return result.rows[0] || null;
}

async function createDriver(
  userId: number,
  displayName: string,
  color: string,
  startDate: string,
) {
  const result = await pool.query(
    "INSERT INTO drivers (user_id, display_name, color, start_date) VALUES ($1, $2, $3, $4) RETURNING id, display_name, color, start_date",
    [userId, displayName, color, startDate],
  );

  return result.rows[0];
}

async function updateDriver(
  userId: number,
  displayName: string,
  color: string,
  startDate: string,
) {
  const result = await pool.query(
    "UPDATE drivers SET display_name = $1, color = $2, start_date = $3 WHERE user_id = $4 RETURNING id, display_name, color, start_date",
    [displayName, color, startDate, userId],
  );

  return result.rows[0];
}

// If your drivers table does not have a color column yet, run:
// ALTER TABLE drivers ADD COLUMN color TEXT DEFAULT '#3b82f6';

export async function updateSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect("/");
  }

  const userId = Number(session.user.id);
  const displayName = formData.get("displayName")?.toString().trim() || "";
  const color = formData.get("color")?.toString() || "#3b82f6";
  const startDate = formData.get("startDate")?.toString() || "";

  if (!displayName) {
    throw new Error("Meno vodiča je povinné");
  }
  if (!startDate) {
    throw new Error("Dátum získania vodičského preukazu je povinný");
  }

  const existingDriver = await getDriverByUser(userId);

  if (existingDriver) {
    await updateDriver(userId, displayName, color, startDate);
  } else {
    await createDriver(userId, displayName, color, startDate);
  }

  return redirect("/nastavenia");
}

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="min-h-full w-full bg-[#0b0f19] text-slate-100 font-sans py-16 px-6">
        <div className="w-full rounded-3xl border border-slate-800 bg-slate-950/90 p-8 shadow-xl shadow-slate-950/40 text-center">
          <h1 className="text-3xl font-semibold mb-4">Prihláste sa</h1>
          <p className="text-slate-400 mb-6">
            Na úpravu nastavení profilu sa musíte prihlásiť.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition duration-200 hover:bg-blue-500"
          >
            Návrat na hlavnú mapu
          </Link>
        </div>
      </main>
    );
  }

  const userId = Number(session.user.id);
  const driver = await getDriverByUser(userId);

  return (
    <main className="min-h-full w-full bg-[#0b0f19] text-slate-100 font-sans py-10 px-6">
      <div className="w-full space-y-8">
        <div className="rounded-[32px] border border-slate-800 bg-slate-950/95 p-8 shadow-xl shadow-slate-950/40">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500 mb-3">
            Nastavenia profilu
          </p>
          <h1 className="text-4xl font-semibold text-slate-100">
            Informácie o vodičovi
          </h1>
          <p className="mt-3 text-slate-400 max-w-3xl">
            Uprav svoje údaje, farbu markera a ďalšie nastavenia. Tento panel je
            navrhnutý tak, aby využil celú šírku obsahu vľavo od fixného bočného
            panela.
          </p>
        </div>

        <div className="rounded-[32px] border border-slate-800 bg-slate-950/95 p-8 shadow-xl shadow-slate-950/40">
          <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xl font-semibold text-slate-100">
                  {session.user?.name}
                </p>
                <p className="text-sm text-slate-400">{session.user?.email}</p>
              </div>
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt="User profile"
                  width={56}
                  height={56}
                  className="rounded-2xl"
                />
              )}
            </div>
            {driver?.start_date ? (
              <p className="text-sm text-slate-400">
                Dátum vodičského preukazu:{" "}
                {new Date(driver.start_date).toLocaleDateString("sk-SK")}
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                Dátum vodičského preukazu nie je nastavený.
              </p>
            )}
          </div>

          <form action={updateSettings} className="grid gap-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-400">
                  Meno vodiča
                </label>
                <input
                  name="displayName"
                  type="text"
                  required
                  defaultValue={driver?.display_name || ""}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-blue-600 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-400">
                  Dátum získania vodičského preukazu
                </label>
                <input
                  name="startDate"
                  type="date"
                  required
                  defaultValue={
                    driver?.start_date
                      ? driver.start_date.toString().split("T")[0]
                      : ""
                  }
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-blue-600 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-400">
                Farba markera
              </label>
              <input
                name="color"
                type="color"
                defaultValue={driver?.color || "#3b82f6"}
                className="h-12 w-24 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none transition"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-6 py-3 text-base font-bold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:bg-blue-500"
            >
              Uložiť nastavenia
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
