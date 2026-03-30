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

export async function fetchStops(userId?: number): Promise<Stop[]> {
  try {
    if (!userId) return [];

    const sql = `
      SELECT
        s.id,
        s.driver_id,
        s.occurred_at,
        s.lat,
        s.lng,
        s.label,
        s.note,
        d.display_name AS driver_display_name
      FROM stops s
      JOIN drivers d ON d.id = s.driver_id
      WHERE s.user_id = $1
      ORDER BY s.occurred_at DESC
    `;

    const result = await pool.query(sql, [userId]);

    console.log("Fetched stops for user", userId, "rows:", result.rows.length);
    console.log("Stop query result:", result.rows);

    return result.rows;
  } catch (error) {
    console.error("DB Error:", error);
    return [];
  }
}

// optional backward compatibility
export async function getStops(userId?: number): Promise<Stop[]> {
  return fetchStops(userId);
}
