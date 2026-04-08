"use client";

import { useState, useRef } from "react";

/* ─────────────────────────────────────────────
   TERMS CONTENT
───────────────────────────────────────────── */
const TERMS_TEXT = `
הסכם שימוש — יסמין תור
עדכון אחרון: אפריל 2026

1. השירות
יסמין תור מספקת מערכת ניהול תורים דיגיטלית לעסקים קטנים ובינוניים, הכוללת דף הזמנה ללקוחות, לוח ניהול לבעל העסק וכלים נלווים.

2. הצטרפות
ההסכם נכנס לתוקף לאחר קבלת אישור מפורש מיסמין תור ותשלום החודש הראשון (או בתוך תקופת הניסיון).

3. תמחור וחיוב
• מחיר השקה: 50 ₪ לחודש — קבוע לצמיתות לנרשמים בתקופת ההשקה.
• המחיר הרגיל לנרשמים עתידיים: 100 ₪ לחודש.
• חודש ניסיון ראשון: חינם וללא התחייבות.
• החיוב מתחיל מהחודש השני. ניתן לבטל לפני תום חודש הניסיון ללא עלות.

4. ביטול
ניתן לבטל את המנוי בכל עת בהתראה של 30 יום מראש. לא יינתן החזר יחסי על חודשים ששולמו.

5. נתונים ופרטיות
נתוני העסק ולקוחותיו מאוחסנים בצורה מאובטחת. לא נעביר מידע לצדדים שלישיים ללא הסכמתך.

6. זמינות השירות
יסמין תור תשאף לזמינות מרבית אך אינה מתחייבת על 99.9% uptime. תחזוקות מתוכננות יבוצעו בשעות הלילה.

7. שינויים בתנאים
יסמין תור שומרת לעצמה את הזכות לעדכן תנאים אלו בהודעה מוקדמת של 14 יום באמצעות הוואטסאפ או האימייל שסיפקת.

8. יצירת קשר
לכל שאלה: וואטסאפ 050-455-8444 | yasmin.communication@gmail.com
`;

/* ─────────────────────────────────────────────
   CATEGORIES
───────────────────────────────────────────── */
const CATEGORIES = [
  { value: "nails", label: "ציפורניים / ביוטי" },
  { value: "fitness", label: "כושר / פילאטיס / יוגה" },
  { value: "hair", label: "תספורת / שיער" },
  { value: "spa", label: "ספא / טיפולי פנים" },
  { value: "other", label: "אחר" },
];

/* ─────────────────────────────────────────────
   TERMS MODAL
───────────────────────────────────────────── */
function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
          <h2 className="text-lg font-bold text-gray-900">תנאי שימוש</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <pre
            className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed"
            dir="rtl"
          >
            {TERMS_TEXT.trim()}
          </pre>
        </div>
        <div className="px-5 py-4 border-t">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-white font-semibold text-base"
            style={{ background: "#14b898" }}
          >
            הבנתי
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PHONE FRAME
───────────────────────────────────────────── */
function PhoneFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="relative mx-auto"
      style={{
        width: 220,
        height: 440,
        background: "#1a1a2e",
        borderRadius: 36,
        padding: "10px 6px",
        boxShadow:
          "0 25px 60px rgba(0,0,0,0.4), inset 0 0 0 2px rgba(255,255,255,0.08)",
      }}
    >
      {/* notch */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 z-10"
        style={{
          width: 60,
          height: 8,
          background: "#1a1a2e",
          borderRadius: 4,
        }}
      />
      <div
        style={{
          borderRadius: 28,
          overflow: "hidden",
          height: "100%",
          background: "#f5fffe",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FEATURE CARD
───────────────────────────────────────────── */
function Feature({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-right">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function LandingPage() {
  const [showTerms, setShowTerms] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    category: "",
    termsAccepted: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.termsAccepted) {
      setError("יש לאשר את תנאי השימוש להמשך");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שגיאה");

      setSubmitted(true);

      // Open WhatsApp to Tal with pre-filled message
      const categoryLabel =
        CATEGORIES.find((c) => c.value === form.category)?.label ?? form.category;
      const msg = encodeURIComponent(
        `שלום טל! שלחתי פנייה דרך האתר ל-יסמין תור.\n` +
          `שם עסק: ${form.businessName}\n` +
          `שמי: ${form.ownerName}\n` +
          `טלפון: ${form.phone}\n` +
          `קטגוריה: ${categoryLabel}\n\n` +
          `אשמח לשמוע פרטים נוספים`
      );
      window.open(`https://wa.me/972504558444?text=${msg}`, "_blank");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "שגיאה בשליחה");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-sans">
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={scrollToForm}
            className="text-sm font-semibold px-4 py-2 rounded-xl text-white"
            style={{ background: "#14b898" }}
          >
            השאירו פרטים
          </button>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-900">יסמין תור</span>
            <span className="text-xl">📅</span>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="bg-white pt-12 pb-10 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
            style={{ background: "#e6faf6", color: "#0d9479" }}
          >
            🚀 מחיר השקה — מקומות מוגבלים
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-4">
            מערכת התורים
            <br />
            <span style={{ color: "#14b898" }}>לעסק שלך</span>
          </h1>
          <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-md mx-auto">
            הלקוחות קובעים תורים בעצמם — 24/7. בלי וואטסאפים, בלי טלפונים, בלי
            בלגן. תוך שעה העסק שלך מקבל לינק משלו.
          </p>
          <button
            onClick={scrollToForm}
            className="text-white font-bold text-base px-8 py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
            style={{ background: "#14b898" }}
          >
            רוצה מערכת כזאת — השאר פרטים
          </button>
          <p className="text-xs text-gray-400 mt-3">חודש ראשון חינם · ללא התחייבות</p>
        </div>
      </section>

      {/* ── SCREENSHOTS: CUSTOMER VIEW ── */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
              ככה הלקוחות שלך קובעים תור
            </p>
            <h2 className="text-2xl font-black text-gray-900">
              דף הזמנה מותאם לעסק שלך
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              לוגו, שם העסק, שירותים, מחירים — הכל מוגדר על ידך
            </p>
          </div>

          {/* Mobile + Desktop side by side */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <PhoneFrame
              src="/screenshots/booking-mobile.png"
              alt="דף הזמנה מובייל"
            />
            <div
              className="hidden sm:block rounded-2xl overflow-hidden shadow-2xl border border-gray-200"
              style={{ width: 520, height: 340 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/screenshots/booking-desktop.png"
                alt="דף הזמנה דסקטופ"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── SCREENSHOTS: ADMIN VIEW ── */}
      <section className="py-12 px-4" style={{ background: "#f0fdf9" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
              ככה נראית המערכת שלך
            </p>
            <h2 className="text-2xl font-black text-gray-900">
              לוח ניהול פשוט ונוח
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              ניהול שירותים, תורים, לקוחות ולוחות זמנים — מהמובייל
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <PhoneFrame
              src="/screenshots/admin-services-mobile.png"
              alt="ניהול שירותים מובייל"
            />
            <div
              className="hidden sm:block rounded-2xl overflow-hidden shadow-2xl border border-gray-200"
              style={{ width: 520, height: 340 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/screenshots/admin-desktop.png"
                alt="לוח ניהול דסקטופ"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-8">
            מה כולל השירות?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Feature
              icon="🎨"
              title="אתר מותאם"
              desc="לוגו, צבעים ותמונות של העסק שלך"
            />
            <Feature
              icon="📅"
              title="תורים 24/7"
              desc="הלקוחות קובעים בכל שעה, גם בלילה"
            />
            <Feature
              icon="👥"
              title="ניהול לקוחות"
              desc="רשימה, אישורים והיסטוריה"
            />
            <Feature
              icon="💳"
              title="ביט ופייבוקס"
              desc="הלקוחות משלמים ישירות אליך"
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-12 px-4" style={{ background: "#f9fafb" }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-10">
            איך זה עובד?
          </h2>
          <div className="flex flex-col gap-6">
            {[
              {
                n: 1,
                title: "שולחים פנייה",
                desc: "ממלאים טופס קצר — שם העסק, קטגוריה וטלפון. תוך 24 שעות אנחנו חוזרים אליך",
              },
              {
                n: 2,
                title: "מקבלים סיסמה ולינק",
                desc: "נשלח לך לינק לדשבורד עם סיסמה ראשונית. מגדירים שירותים ושעות תוך 30 דקות",
              },
              {
                n: 3,
                title: "מתחילים לקבל תורים",
                desc: "שולחים את הלינק ללקוחות בוואטסאפ — והתורים מתחילים להיכנס",
              },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-4 items-start">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-base shrink-0 mt-0.5"
                  style={{ background: "#14b898" }}
                >
                  {n}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-sm mx-auto">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-8">
            תמחור
          </h2>
          <div
            className="rounded-3xl p-7 text-center shadow-xl border-2"
            style={{ borderColor: "#14b898", background: "#f0fdf9" }}
          >
            <div
              className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 text-white"
              style={{ background: "#14b898" }}
            >
              מחיר השקה — קבוע לצמיתות
            </div>

            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-5xl font-black text-gray-900">
                50 <span className="text-2xl">₪</span>
              </span>
              <div className="text-right">
                <div className="text-gray-400 line-through text-lg font-semibold">
                  100 ₪
                </div>
                <div className="text-xs text-gray-400">מחיר רגיל</div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">לחודש</p>

            <div
              className="my-5 py-3 rounded-xl text-sm font-semibold"
              style={{ background: "#ccf7ee", color: "#0d9479" }}
            >
              🎁 חודש ראשון חינם · ללא התחייבות
            </div>

            <ul className="text-sm text-right text-gray-700 space-y-2 mb-6">
              {[
                "דף הזמנה מותאם לעסק",
                "לוח ניהול מלא",
                "ניהול לקוחות ותורים",
                "לוח שנה יומי/שבועי/חודשי",
                "ביט ופייבוקס מובנים",
                "תמיכה ב-WhatsApp",
                "מחיר קבוע לצמיתות לנרשמים עכשיו",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span style={{ color: "#14b898" }}>✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={scrollToForm}
              className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-lg active:scale-95 transition-transform"
              style={{ background: "#14b898" }}
            >
              אני רוצה — השאר פרטים
            </button>
          </div>
        </div>
      </section>

      {/* ── REGISTRATION FORM ── */}
      <section
        ref={formRef}
        className="py-14 px-4"
        style={{ background: "#1a1a2e" }}
      >
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-white mb-2">
              מתחילים?
            </h2>
            <p className="text-gray-400 text-sm">
              ממלאים פרטים, ותוך 24 שעות חוזרים אליך עם הפרטים להתחלה
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-white mb-2">הפנייה נשלחה!</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                נפתח חלון וואטסאפ לשליחת ההודעה לטל.
                <br />
                אם לא נפתח —{" "}
                <a
                  href={`https://wa.me/972504558444`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-teal-400"
                >
                  לחץ כאן
                </a>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1 text-right">
                  שם העסק *
                </label>
                <input
                  type="text"
                  required
                  placeholder="למשל: סטודיו לאן, ספא הדר..."
                  value={form.businessName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, businessName: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-500 border border-white/20 focus:outline-none focus:border-teal-400 text-right"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1 text-right">
                  שמך *
                </label>
                <input
                  type="text"
                  required
                  placeholder="שם מלא"
                  value={form.ownerName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ownerName: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-500 border border-white/20 focus:outline-none focus:border-teal-400 text-right"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1 text-right">
                  טלפון *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="05X-XXXXXXX"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-500 border border-white/20 focus:outline-none focus:border-teal-400 text-right"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1 text-right">
                  סוג העסק *
                </label>
                <select
                  required
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:border-teal-400 text-right"
                  style={{ direction: "rtl" }}
                >
                  <option value="" disabled style={{ color: "#888" }}>
                    בחר קטגוריה
                  </option>
                  {CATEGORIES.map((c) => (
                    <option
                      key={c.value}
                      value={c.value}
                      style={{ color: "#000", background: "#fff" }}
                    >
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Terms checkbox */}
              <label className="flex items-start gap-3 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={form.termsAccepted}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, termsAccepted: e.target.checked }))
                  }
                  className="mt-0.5 w-4 h-4 rounded shrink-0 accent-teal-400"
                />
                <span className="text-sm text-gray-400 leading-relaxed text-right">
                  קראתי ואישרתי את{" "}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="underline text-teal-400 hover:text-teal-300"
                  >
                    תנאי השימוש
                  </button>
                </span>
              </label>

              {error && (
                <p className="text-red-400 text-sm text-right">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl text-white font-bold text-base mt-2 disabled:opacity-50 active:scale-95 transition-transform"
                style={{ background: "#14b898" }}
              >
                {submitting ? "שולח..." : "שלח פנייה ופתח וואטסאפ"}
              </button>

              <p className="text-xs text-gray-500 text-center">
                לא מנוי — פנייה לקבלת מידע. אין חיוב אוטומטי.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-4 bg-gray-900 text-center">
        <p className="text-gray-500 text-sm">
          יסמין תור · מערכת תורים לעסקים קטנים
          <br />
          <a
            href="https://wa.me/972504558444"
            target="_blank"
            rel="noreferrer"
            className="text-teal-400 hover:underline"
          >
            050-455-8444
          </a>
          {" · "}
          <span>יסמין תקשורת</span>
        </p>
      </footer>
    </div>
  );
}
