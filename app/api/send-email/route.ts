import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

/**
 * Unified email sending endpoint. Uses Resend.
 *
 * Env vars required:
 *  - RESEND_API_KEY    — from https://resend.com/api-keys
 *  - EMAIL_FROM        — verified sender, e.g. "Yasmin Tor <noreply@yourdomain.com>"
 *                        (for testing you can use "onboarding@resend.dev" but only to yourself)
 *
 * Body: { to: string, subject: string, html: string, fromName?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { to, subject, html, fromName } = await req.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'missing to/subject/html' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('[send-email] RESEND_API_KEY not configured — skipping send');
      return NextResponse.json({ ok: false, reason: 'no-api-key' }, { status: 200 });
    }

    const resend = new Resend(apiKey);
    const baseFrom = process.env.EMAIL_FROM || 'Yasmin Tor <onboarding@resend.dev>';
    const from = fromName
      ? baseFrom.replace(/^[^<]+/, `${fromName} `)
      : baseFrom;

    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('[send-email] resend error:', error);
      return NextResponse.json({ error: error.message || 'resend-error' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e: any) {
    console.error('[send-email] exception:', e);
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}
