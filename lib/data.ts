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
  driverName?: string | null;
  driverColor?: string | null;
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
        s.*, 
        d.color AS "driverColor",
        d.display_name AS "driverName"
      FROM stops s
      JOIN drivers d ON s.driver_id = d.id
      WHERE s.user_id = $1
      OR s.user_id IN (
        SELECT following_id FROM follows WHERE follower_id = $1
      )
      ORDER BY s.occurred_at DESC
    `;

    const result = await pool.query(sql, [userId]);

    const stops: Stop[] = result.rows.map((row) => ({
      ...row,
      driverColor: row.driverColor || "#3b82f6",
      driverName: row.driverName || "Unknown driver",
    }));

    return stops;
  } catch (error) {
    console.error("DB Error:", error);
    return [];
  }
}

// optional backward compatibility
export async function getStops(userId?: number): Promise<Stop[]> {
  return fetchStops(userId);
}
