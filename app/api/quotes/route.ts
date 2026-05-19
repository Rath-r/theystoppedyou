import { pool } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/src/auth";

type QuoteInsertRequest = {
  text: string;
};

type QuoteRow = {
  id: number;
  user_id: string;
  text: string;
  created_at: string;
  name: string;
  image: string | null;
  display_name: string | null;
};

/**
 * POST /api/quotes
 * Create a new quote
 */
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body: QuoteInsertRequest = await req.json();

    // Validate required fields
    const { text } = body;
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required and cannot be empty" },
        { status: 400 },
      );
    }

    // Insert quote with user_id from session
    const insertResult = await pool.query(
      `INSERT INTO quotes (user_id, text, created_at)
       VALUES ($1, $2, NOW())
       RETURNING id, user_id, text, created_at`,
      [session.user.id, text.trim()],
    );

    const insertedQuote = insertResult.rows[0];

    return NextResponse.json({
      success: true,
      quote: {
        id: insertedQuote.id,
        userId: insertedQuote.user_id,
        text: insertedQuote.text,
        createdAt: insertedQuote.created_at,
      },
    });
  } catch (error) {
    console.error("Error inserting quote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/quotes
 * Fetch the latest 50 quotes with user information
 */
export async function GET() {
  try {
    // Fetch quotes with user info - cast user_id VARCHAR to INTEGER for JOIN
    const result = await pool.query(
      `SELECT 
         q.id,
         q.user_id,
         q.text,
         q.created_at,
         u.email,
         u.display_name,
         u.image
       FROM quotes q
       JOIN users u ON q.user_id::integer = u.id
       ORDER BY q.created_at DESC
       LIMIT 50`,
    );

    const quotes = result.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      text: row.text,
      createdAt: row.created_at,
      userName: row.display_name || row.email || "Anonymous",
      userImage: row.image,
    }));

    return NextResponse.json({
      success: true,
      quotes,
      count: quotes.length,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown database error";
    console.error("Error fetching quotes:", errorMessage);
    return NextResponse.json(
      { error: `Database error: ${errorMessage}` },
      { status: 500 },
    );
  }
}
