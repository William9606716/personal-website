import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Read current count
export async function GET() {
  const { data } = await db().from("site_stats").select("visits").eq("id", 1).single();
  return NextResponse.json({ visits: data?.visits ?? 0 });
}

// Increment and return new count
export async function POST() {
  const { data } = await db().rpc("increment_visits");
  return NextResponse.json({ visits: data ?? 0 });
}
