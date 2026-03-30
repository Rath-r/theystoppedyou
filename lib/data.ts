import { pool } from "@/lib/db";

export type Driver = {
  id: number;
  owner_user_id: number | null;
  display_name: string;
  slug: string;
  start_date: string | null;
};

export type Stop = {
  id: number;
  driver_id: number;
  occurred_at: string | null;
  lat: number;
  lng: number;
  label: string;
  note: string | null;
};

export async function getDrivers(): Promise<Driver[]> {
  const result = await pool.query(`
    SELECT id, owner_user_id, display_name, slug, start_date
    FROM drivers
    ORDER BY id
  `);

  return result.rows;
}

export async function getStops(userId?: string | number): Promise<Stop[]> {
  if (userId !== undefined && userId !== null) {
    const result = await pool.query(
      `SELECT id, driver_id, occurred_at, lat, lng, label, note
       FROM stops
       WHERE user_id = $1
       ORDER BY id`,
      [userId],
    );

    return result.rows;
  }

  const result = await pool.query(`
    SELECT id, driver_id, occurred_at, lat, lng, label, note
    FROM stops
    ORDER BY id
  `);

  return result.rows;
}
