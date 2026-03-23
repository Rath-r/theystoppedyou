import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

type StopInsertRequest = {
  driverSlug: string;
  lat: number;
  lng: number;
  label: string;
  occurredAt?: string;
  note?: string;
};

export async function POST(req: Request) {
  try {
    const body: StopInsertRequest = await req.json();

    // Validate required fields
    const { driverSlug, lat, lng, label } = body;
    if (!driverSlug || lat === undefined || lng === undefined || !label) {
      return NextResponse.json(
        { error: "Missing required fields: driverSlug, lat, lng, label" },
        { status: 400 },
      );
    }

    // Find driver_id using slug
    const driverResult = await pool.query(
      "SELECT id FROM drivers WHERE slug = $1",
      [driverSlug],
    );

    if (driverResult.rows.length === 0) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const driverId = driverResult.rows[0].id;

    // Insert stop
    const insertResult = await pool.query(
      `INSERT INTO stops (driver_id, occurred_at, lat, lng, label, note)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [driverId, body.occurredAt || null, lat, lng, label, body.note || null],
    );

    const insertedStop = insertResult.rows[0];

    return NextResponse.json({
      success: true,
      stop: {
        id: insertedStop.id,
        driverId: driverSlug,
        occurredAt: insertedStop.occurred_at,
        lat: insertedStop.lat,
        lng: insertedStop.lng,
        label: insertedStop.label,
        note: insertedStop.note,
        createdAt: insertedStop.created_at,
      },
    });
  } catch (error) {
    console.error("Error inserting stop:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
