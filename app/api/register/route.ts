import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

function getSharedSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL_MENTANAIL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_MENTANAIL ?? "";
  return getSupabaseClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, ownerName, phone, category, termsAccepted } = body;

    if (!businessName || !ownerName || !phone || !category) {
      return NextResponse.json({ error: "שדות חסרים" }, { status: 400 });
    }
    if (!termsAccepted) {
      return NextResponse.json(
        { error: "יש לאשר את תנאי השימוש" },
        { status: 400 }
      );
    }

    const supabase = getSharedSupabase();
    const { error } = await supabase.from("business_registrations").insert({
      business_name: businessName,
      owner_name: ownerName,
      phone,
      category,
      terms_accepted: termsAccepted,
      status: "pending",
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "שגיאה בשמירת הפנייה" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Register route error:", err);
    return NextResponse.json({ error: "שגיאה כללית" }, { status: 500 });
  }
}
