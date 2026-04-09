// Client helper to send emails via /api/send-email
// Silently ignores errors — emails are best-effort.

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
}

export async function sendEmail(args: SendEmailArgs): Promise<boolean> {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    const data = await res.json();
    return !!data?.ok;
  } catch (e) {
    console.error('sendEmail error:', e);
    return false;
  }
}

// ─── Email Templates ──────────────────────────────────────

function baseTemplate(title: string, body: string, businessName: string, brandColor = '#10B981'): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:white;border-radius:16px;padding:32px;border:1px solid #F3F4F6;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background:${brandColor}20;line-height:56px;text-align:center;font-size:28px;">✉️</div>
        <h1 style="color:#111827;font-size:20px;margin:16px 0 4px;">${title}</h1>
        <p style="color:#6B7280;font-size:13px;margin:0;">${businessName}</p>
      </div>
      <div style="color:#374151;font-size:14px;line-height:1.7;">
        ${body}
      </div>
    </div>
    <p style="text-align:center;color:#9CA3AF;font-size:11px;margin-top:16px;">נשלח אוטומטית ממערכת ${businessName}</p>
  </div>
</body>
</html>`;
}

export interface EmailContext {
  businessName: string;
  brandColor?: string;
}

export function customerRegisteredEmail(ctx: EmailContext, customer: { name: string; phone: string }): { subject: string; html: string } {
  return {
    subject: `לקוח חדש נרשם — ${customer.name}`,
    html: baseTemplate(
      'לקוח חדש נרשם',
      `
      <p>נרשם לקוח חדש במערכת:</p>
      <div style="background:#F9FAFB;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 8px;"><strong>שם:</strong> ${customer.name}</p>
        <p style="margin:0;"><strong>טלפון:</strong> <span dir="ltr">${customer.phone}</span></p>
      </div>
      `,
      ctx.businessName,
      ctx.brandColor,
    ),
  };
}

export function customerBookedEmail(ctx: EmailContext, data: { customerName: string; serviceName: string; date: string; time: string }): { subject: string; html: string } {
  return {
    subject: `קביעת ${data.serviceName} — ${data.customerName}`,
    html: baseTemplate(
      'קביעה חדשה',
      `
      <p><strong>${data.customerName}</strong> קבע ${data.serviceName}.</p>
      <div style="background:#F9FAFB;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 6px;"><strong>תאריך:</strong> ${data.date}</p>
        <p style="margin:0;"><strong>שעה:</strong> ${data.time}</p>
      </div>
      `,
      ctx.businessName,
      ctx.brandColor,
    ),
  };
}

export function customerCancelledEmail(ctx: EmailContext, data: { customerName: string; serviceName: string; date: string; time: string }): { subject: string; html: string } {
  return {
    subject: `ביטול ${data.serviceName} — ${data.customerName}`,
    html: baseTemplate(
      'ביטול קביעה',
      `
      <p><strong>${data.customerName}</strong> ביטל את ה-${data.serviceName}.</p>
      <div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 6px;"><strong>תאריך:</strong> ${data.date}</p>
        <p style="margin:0;"><strong>שעה:</strong> ${data.time}</p>
      </div>
      `,
      ctx.businessName,
      ctx.brandColor,
    ),
  };
}

export function bookingConfirmationEmail(ctx: EmailContext, data: { customerName: string; serviceName: string; date: string; time: string }): { subject: string; html: string } {
  return {
    subject: `${ctx.businessName} — הקביעה אושרה`,
    html: baseTemplate(
      `היי ${data.customerName}! הקביעה אושרה 🎉`,
      `
      <p>הנה הפרטים:</p>
      <div style="background:#F9FAFB;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 6px;"><strong>שירות:</strong> ${data.serviceName}</p>
        <p style="margin:0 0 6px;"><strong>תאריך:</strong> ${data.date}</p>
        <p style="margin:0;"><strong>שעה:</strong> ${data.time}</p>
      </div>
      <p style="color:#6B7280;font-size:12px;">נתראה!</p>
      `,
      ctx.businessName,
      ctx.brandColor,
    ),
  };
}

export function cancelConfirmationEmail(ctx: EmailContext, data: { customerName: string; serviceName: string; date: string; time: string }): { subject: string; html: string } {
  return {
    subject: `${ctx.businessName} — הקביעה בוטלה`,
    html: baseTemplate(
      'הקביעה בוטלה',
      `
      <p>היי ${data.customerName},</p>
      <p>קיבלנו את בקשתך לביטול:</p>
      <div style="background:#F9FAFB;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 6px;"><strong>שירות:</strong> ${data.serviceName}</p>
        <p style="margin:0 0 6px;"><strong>תאריך:</strong> ${data.date}</p>
        <p style="margin:0;"><strong>שעה:</strong> ${data.time}</p>
      </div>
      `,
      ctx.businessName,
      ctx.brandColor,
    ),
  };
}

export function birthdayEmail(ctx: EmailContext, customerName: string): { subject: string; html: string } {
  return {
    subject: `יום הולדת שמח ${customerName}! 🎂`,
    html: baseTemplate(
      `יום הולדת שמח ${customerName}! 🎂🎉`,
      `
      <p style="text-align:center;font-size:16px;">כל הצוות של <strong>${ctx.businessName}</strong> מאחל לך יום הולדת שמח מכל הלב 💕</p>
      `,
      ctx.businessName,
      ctx.brandColor,
    ),
  };
}
