"use server";

import { pool } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

async function getDriverByUser(userId: number) {
  const result = await pool.query(
    "SELECT id, display_name, color FROM drivers WHERE user_id = $1 LIMIT 1",
    [userId],
  );

  return result.rows[0] || null;
}

async function createDriver(
  userId: number,
  displayName: string,
  color: string,
) {
  const result = await pool.query(
    "INSERT INTO drivers (user_id, display_name, color) VALUES ($1, $2, $3) RETURNING id, display_name, color",
    [userId, displayName, color],
  );

  return result.rows[0];
}

async function updateDriver(
  userId: number,
  displayName: string,
  color: string,
) {
  const result = await pool.query(
    "UPDATE drivers SET display_name = $1, color = $2 WHERE user_id = $3 RETURNING id, display_name, color",
    [displayName, color, userId],
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

  if (!displayName) {
    throw new Error("Display name is required");
  }

  const existingDriver = await getDriverByUser(userId);

  if (existingDriver) {
    await updateDriver(userId, displayName, color);
  } else {
    await createDriver(userId, displayName, color);
  }

  return redirect("/settings");
}

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="mx-auto max-w-4xl p-6 text-center">
        <h1 className="text-3xl font-bold">Please log in</h1>
        <p className="mt-2 text-gray-500">
          You need to sign in to update your profile settings.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Back to Home
        </Link>
      </main>
    );
  }

  const userId = Number(session.user.id);
  const driver = await getDriverByUser(userId);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold mb-4">Profile Settings</h1>
      <p className="text-gray-600 mb-6">
        {session.user?.name ? `Welcome, ${session.user.name}` : "Welcome"}
      </p>

      <div className="mb-4 flex items-center gap-3">
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt="User profile"
            width={48}
            height={48}
            className="rounded-full"
          />
        )}
        <div>
          <div className="font-semibold">{session.user?.name}</div>
          <div className="text-sm text-gray-500">{session.user?.email}</div>
        </div>
      </div>

      <form action={updateSettings} className="space-y-4 rounded-lg border p-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Driver Display Name
          </label>
          <input
            name="displayName"
            type="text"
            required
            defaultValue={driver?.display_name || ""}
            className="mt-1 w-full rounded border-gray-300 p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Marker Color
          </label>
          <input
            name="color"
            type="color"
            defaultValue={driver?.color || "#3b82f6"}
            className="mt-1 h-10 w-20 border border-gray-300 rounded"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500"
        >
          Save Settings
        </button>
      </form>

      <div className="mt-6">
        <Link href="/" className="text-sm text-indigo-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
