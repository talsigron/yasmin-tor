import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase-admin";

function generatePassword(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u0590-\u05ff-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || `business-${Date.now()}`;
}

export async function POST(req: NextRequest) {
  try {
    const { registrationId } = await req.json();

    if (!registrationId) {
      return NextResponse.json({ error: "חסר מזהה פנייה" }, { status: 400 });
    }

    const db = getAdminSupabase();

    // 1. Get the registration
    const { data: reg, error: regErr } = await db
      .from("business_registrations")
      .select("*")
      .eq("id", registrationId)
      .single();

    if (regErr || !reg) {
      return NextResponse.json({ error: "פנייה לא נמצאה" }, { status: 404 });
    }

    if (reg.status === "approved") {
      return NextResponse.json({ error: "פנייה כבר אושרה" }, { status: 400 });
    }

    // 2. Generate slug + password
    let slug = slugify(reg.business_name);
    const password = generatePassword();

    // Ensure slug is unique
    const { data: existing } = await db
      .from("tenants")
      .select("slug")
      .eq("slug", slug)
      .single();

    if (existing) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }

    // Map category from registration form to tenant category
    const categoryMap: Record<string, string> = {
      nails: "nails",
      fitness: "fitness",
      other: "other",
    };
    const category = categoryMap[reg.category] ?? "other";

    // 3. Create business_profiles row
    const { data: profile, error: profileErr } = await db
      .from("business_profiles")
      .insert({
        name: reg.business_name,
        phone: reg.phone,
        admin_password: password,
      })
      .select("id")
      .single();

    if (profileErr || !profile) {
      console.error("Error creating profile:", profileErr);
      return NextResponse.json(
        { error: "שגיאה ביצירת פרופיל עסקי" },
        { status: 500 }
      );
    }

    // 4. Create tenant row
    const { error: tenantErr } = await db.from("tenants").insert({
      slug,
      business_id: profile.id,
      category,
      owner_name: reg.owner_name,
      owner_phone: reg.phone,
    });

    if (tenantErr) {
      console.error("Error creating tenant:", tenantErr);
      // Cleanup: delete the profile we just created
      await db.from("business_profiles").delete().eq("id", profile.id);
      return NextResponse.json(
        { error: "שגיאה ביצירת טנאנט" },
        { status: 500 }
      );
    }

    // 5. Update registration status
    await db
      .from("business_registrations")
      .update({ status: "approved", notes: `slug: ${slug}` })
      .eq("id", registrationId);

    return NextResponse.json({
      success: true,
      slug,
      password,
      businessId: profile.id,
    });
  } catch (err) {
    console.error("Approve business error:", err);
    return NextResponse.json({ error: "שגיאה כללית" }, { status: 500 });
  }
}
