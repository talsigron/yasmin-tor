"use client";

import { useState, useRef } from "react";

/* ─────────────────────────────────────────────
   TERMS CONTENT
───────────────────────────────────────────── */
const TERMS_TEXT = `
תנאי שימוש — פלטפורמת יסמין תור
עודכן לאחרונה: אפריל 2026

1. כללי
מערכת "יסמין תור" (להלן: "השירות") מופעלת על ידי "יסמין תקשורת", בבעלות טל סיגרון (להלן: "החברה" או "אנחנו"). סימון תיבת האישור בעת ההרשמה או כל שימוש בשירות, מהווים הסכמה מלאה לתנאים אלו.

2. תיאור השירות
יסמין תור מספקת לעסקים מערכת דיגיטלית מבוססת ענן לניהול תורים, הכוללת דף הזמנה אישי ללקוחות הקצה, לוח בקרה לניהול התורים על ידי בעל העסק, ומערכת תזכורות.

3. הרשמה ואישור
הצטרפות לפלטפורמה דורשת הרשמה וכפופה לאישור ידני מצדנו. אנו שומרים לעצמנו את הזכות לאשר, לסרב או להפסיק מתן שירות לכל עסק, על פי שיקול דעתנו הבלעדי. בעת ההרשמה יש למסור פרטים נכונים ומדויקים.

4. תשלום וביטולים
• עלות: 50 ₪ לחודש (מחיר השקה קבוע לנרשמים עתה).
• התנסות: החודש הראשון ניתן ללא עלות וללא התחייבות. החיוב יחל מהחודש השני.
• ביטול: אין התחייבות לתקופת זמן. ניתן לבטל את השירות בכל עת וללא קנסות יציאה, והחיוב יופסק החל ממחזור החיוב הבא. במקרה של פיגור בתשלום, אנו רשאים להשהות את הגישה למערכת.

5. אחריות בעל העסק ושימוש הולם
השירות נועד לניהול תורים בלבד. בעל העסק מתחייב:
• לספק ללקוחותיו את השירות שעבורו נקבע התור במועד ובאיכות הנדרשים.
• לעדכן את זמינותו ושעות פעילותו במערכת.
• לשמור על סודיות פרטי הגישה (שם משתמש וסיסמה) למערכת.
• לא להשתמש במערכת לפעילות לא חוקית, הפצת וירוסים, או שליחת הודעות זבל ללקוחות.
מובהר בזאת: יסמין תקשורת מספקת פלטפורמה טכנולוגית בלבד ואינה צד להתקשרות שבין העסק ללקוחותיו, ולא תישא באחריות לטיב השירות שהעסק מספק.

6. נתונים, פרטיות ואבטחת מידע
• אנו מאחסנים את פרטי לקוחות העסק (שמות, טלפונים, היסטוריית תורים) בשרתים מאובטחים.
• המידע משמש אותנו אך ורק לצורך תפעול ואספקת השירות לעסק. אנו מתחייבים לא למכור או להעביר מידע זה לצדדים שלישיים.
• על פי חוק הגנת הפרטיות, בעל העסק הוא "בעל המאגר" של נתוני לקוחותיו, ואילו יסמין תקשורת פועלת כ"מחזיק" במידע מטעמו. האחריות המלאה לאיסוף המידע כחוק ולקבלת הסכמת הלקוחות לשימוש בפרטיהם, חלה על בעל העסק בלבד.

7. קניין רוחני
כל הזכויות, לרבות זכויות היוצרים והקניין הרוחני בפלטפורמת יסמין תור (קוד, עיצוב, לוגו, טקסטים), שייכות בלעדית ליסמין תקשורת. אין להעתיק, לשכפל או לעשות שימוש מסחרי ברכיבי המערכת ללא אישור בכתב.

8. זמינות השירות והגבלת אחריות
אנו עושים מאמצים רבים כדי שהמערכת תהיה זמינה ופעילה באופן רציף, אך איננו מתחייבים לזמינות של 100%. עבודות תחזוקה מתוכננות יודעו מראש במידת האפשר.
יסמין תקשורת לא תהיה אחראית לנזקים ישירים או עקיפים, אובדן תורים, אובדן נתונים או הפסד הכנסות שיגרמו עקב תקלות טכניות, השבתת מערכות או חדירת סייבר. בכל מקרה, אחריותנו המקסימלית כלפי בעל העסק תהיה מוגבלת לסך התשלומים ששילם לנו העסק בשלושת החודשים שקדמו לאירוע שבגינו נטענת האחריות.

9. שינויים בתנאים וסמכות שיפוט
אנו רשאים לעדכן תנאים אלו מעת לעת. על שינויים מהותיים תימסר הודעה לבעלי העסקים. המשך שימוש במערכת לאחר העדכון מהווה הסכמה לתנאים החדשים.
על תנאי שימוש אלו יחול הדין הישראלי בלבד. סמכות השיפוט הבלעדית בכל סכסוך הנוגע לשירות מסורה לבתי המשפט המוסמכים במחוז הדרום.

10. יצירת קשר
לכל שאלה, תקלה או בקשה ניתן לפנות אלינו:
טל סיגרון, יסמין תקשורת
טלפון / וואטסאפ: 050-4558444
מייל: talsigronuzan@gmail.com
`;

/* ─────────────────────────────────────────────
   CATEGORIES
───────────────────────────────────────────── */
const CATEGORIES = [
  { value: "nails", label: "בונות ציפורניים וביוטי" },
  { value: "fitness", label: "סטודיו וחדרי כושר" },
  { value: "other", label: "אחר (פרט)" },
];

/* ─────────────────────────────────────────────
   TERMS MODAL
───────────────────────────────────────────── */
function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(28,26,16,0.7)" }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-2xl leading-none w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
          <h2 className="text-base font-bold text-stone-900">תנאי שימוש</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <pre className="text-sm text-stone-600 whitespace-pre-wrap font-sans leading-relaxed" dir="rtl">
            {TERMS_TEXT.trim()}
          </pre>
        </div>
        <div className="px-6 py-4 border-t border-stone-100">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-bold text-base transition-opacity hover:opacity-90"
            style={{ background: "#1C1A10", color: "#F0C040" }}
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
      className="relative mx-auto shrink-0"
      style={{
        width: 210,
        height: 420,
        background: "#1C1A10",
        borderRadius: 38,
        padding: "10px 7px",
        boxShadow: "0 30px 70px rgba(28,26,16,0.35), 0 0 0 1px rgba(240,192,64,0.15)",
      }}
    >
      {/* notch */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 z-10"
        style={{ width: 56, height: 7, background: "#1C1A10", borderRadius: 4 }}
      />
      <div style={{ borderRadius: 30, overflow: "hidden", height: "100%" }}>
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
    <div dir="rtl" className="min-h-screen" style={{ background: "#FFFBEF" }}>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

      {/* ── NAVBAR ── */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md border-b"
        style={{ background: "rgba(255,251,239,0.92)", borderColor: "rgba(184,134,11,0.15)" }}
      >
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <button
            onClick={scrollToForm}
            className="text-sm font-bold px-5 py-2 rounded-full transition-opacity hover:opacity-80 active:scale-95"
            style={{ background: "#1C1A10", color: "#F0C040" }}
          >
            השאירו פרטים
          </button>
          <div className="flex items-center gap-2">
            <span
              className="text-base font-black tracking-tight"
              style={{ color: "#1C1A10" }}
            >
              יסמין תור
            </span>
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#C9940A" }}
            />
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section
        className="px-5 pt-12 pb-14 overflow-hidden"
        style={{
          background: "#FFFBEF",
          backgroundImage:
            "radial-gradient(circle, rgba(184,134,11,0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-10 sm:gap-14">
            {/* Text side */}
            <div className="flex-1 text-right">
              <div
                className="inline-block text-xs font-bold px-3 py-1.5 rounded-full mb-5"
                style={{ background: "rgba(201,148,10,0.15)", color: "#8B6914" }}
              >
                מחיר השקה — מקומות מוגבלים
              </div>

              <h1
                className="text-4xl sm:text-5xl font-black leading-tight mb-5"
                style={{ color: "#1C1A10" }}
              >
                מערכת התורים
                <br />
                <span
                  className="relative inline-block"
                  style={{ color: "#C9940A" }}
                >
                  לעסק שלך
                  <span
                    className="absolute bottom-0 right-0 w-full h-1 rounded-full opacity-40"
                    style={{ background: "#C9940A" }}
                  />
                </span>
              </h1>

              <p className="text-base leading-relaxed mb-8 max-w-sm" style={{ color: "#5A4E30" }}>
                הלקוחות קובעים תורים בעצמם — 24/7.
                <br />
                בלי וואטסאפים, בלי טלפונים, בלי בלגן.
                <br />
                תוך שעה העסק שלך מקבל לינק משלו.
              </p>

              <div className="flex flex-col sm:flex-row items-end gap-3">
                <button
                  onClick={scrollToForm}
                  className="font-bold text-base px-7 py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
                  style={{ background: "#1C1A10", color: "#F0C040" }}
                >
                  רוצה מערכת כזאת — השאר פרטים
                </button>
                <p className="text-xs pb-1" style={{ color: "#8B7840" }}>
                  חודש ראשון חינם · ללא התחייבות
                </p>
              </div>
            </div>

            {/* Phone side */}
            <div className="shrink-0">
              <PhoneFrame src="/screenshots/booking-mobile.png" alt="דף הזמנה מובייל" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES BAR ── */}
      <div
        className="py-4 px-5 overflow-x-auto"
        style={{ background: "#1C1A10" }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-6 sm:gap-10 whitespace-nowrap">
          {[
            "תורים 24/7",
            "דף הזמנה מותאם",
            "ניהול לקוחות",
            "ביט ופייבוקס",
            "לוח שנה",
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm font-medium" style={{ color: "#F0C040" }}>
              <span className="text-xs opacity-50">✦</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── SCREENSHOTS: CUSTOMER VIEW ── */}
      <section className="py-16 px-5" style={{ background: "#FFFFFF" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-10 sm:gap-14">
            {/* Desktop screenshot */}
            <div className="hidden sm:block rounded-2xl overflow-hidden shadow-xl flex-1"
              style={{ border: "1px solid rgba(184,134,11,0.15)", maxWidth: 520 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/screenshots/booking-desktop.png"
                alt="דף הזמנה"
                style={{ width: "100%", display: "block", objectFit: "cover", objectPosition: "top", height: 340 }}
              />
            </div>
            {/* Mobile screenshot */}
            <div className="sm:hidden">
              <PhoneFrame src="/screenshots/booking-mobile.png" alt="דף הזמנה מובייל" />
            </div>
            <div className="flex-1 text-right sm:max-w-xs">
              <p
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: "#C9940A" }}
              >
                ככה הלקוחות שלך קובעים תור
              </p>
              <h2 className="text-2xl font-black mb-3" style={{ color: "#1C1A10" }}>
                דף הזמנה מותאם לעסק שלך
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "#5A4E30" }}>
                לוגו, שם העסק, שירותים ומחירים — הכל מוגדר על ידך. הלקוח רואה בדיוק את העסק שלך, לא תבנית גנרית.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCREENSHOTS: ADMIN VIEW ── */}
      <section className="py-16 px-5" style={{ background: "#FFFBEF" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row-reverse items-center gap-10 sm:gap-14">
            {/* Desktop screenshot */}
            <div className="hidden sm:block rounded-2xl overflow-hidden shadow-xl flex-1"
              style={{ border: "1px solid rgba(184,134,11,0.15)", maxWidth: 520 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/screenshots/admin-desktop.png"
                alt="לוח ניהול"
                style={{ width: "100%", display: "block", objectFit: "cover", objectPosition: "top", height: 340 }}
              />
            </div>
            {/* Mobile screenshot */}
            <div className="sm:hidden">
              <PhoneFrame src="/screenshots/admin-services-mobile.png" alt="ניהול שירותים מובייל" />
            </div>
            <div className="flex-1 text-right sm:max-w-xs">
              <p
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: "#C9940A" }}
              >
                ככה נראית המערכת שלך
              </p>
              <h2 className="text-2xl font-black mb-3" style={{ color: "#1C1A10" }}>
                לוח ניהול פשוט ונוח
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "#5A4E30" }}>
                ניהול שירותים, תורים, לקוחות ולוחות זמנים — מהמובייל, בכל מקום. אין צורך בהכשרה מיוחדת.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (dark section) ── */}
      <section className="py-16 px-5" style={{ background: "#1C1A10" }}>
        <div className="max-w-2xl mx-auto">
          <p
            className="text-xs font-bold uppercase tracking-widest text-center mb-2"
            style={{ color: "#C9940A" }}
          >
            שלושה שלבים
          </p>
          <h2 className="text-2xl font-black text-center mb-12" style={{ color: "#FFFBEF" }}>
            מפנייה למערכת חיה — תוך יום
          </h2>
          <div className="flex flex-col gap-8">
            {[
              {
                n: "01",
                title: "שולחים פנייה",
                desc: "ממלאים טופס קצר — שם העסק, קטגוריה וטלפון. תוך 24 שעות אנחנו חוזרים אליך.",
              },
              {
                n: "02",
                title: "מקבלים סיסמה ולינק",
                desc: "נשלח לך לינק לדשבורד עם סיסמה ראשונית. מגדירים שירותים ושעות תוך 30 דקות.",
              },
              {
                n: "03",
                title: "מתחילים לקבל תורים",
                desc: "שולחים את הלינק ללקוחות בוואטסאפ — והתורים מתחילים להיכנס.",
              },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-5 items-start">
                <div
                  className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm"
                  style={{ background: "rgba(240,192,64,0.12)", color: "#F0C040", border: "1px solid rgba(240,192,64,0.25)" }}
                >
                  {n}
                </div>
                <div className="text-right pt-1">
                  <h3 className="font-bold mb-1" style={{ color: "#FFFBEF" }}>
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#A89868" }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-16 px-5" style={{ background: "#FFFFFF" }}>
        <div className="max-w-sm mx-auto">
          <p
            className="text-xs font-bold uppercase tracking-widest text-center mb-2"
            style={{ color: "#C9940A" }}
          >
            תמחור
          </p>
          <h2 className="text-2xl font-black text-center mb-8" style={{ color: "#1C1A10" }}>
            מחיר שקוף. ללא הפתעות.
          </h2>

          {/* Pricing card */}
          <div
            className="rounded-3xl p-7 text-center"
            style={{ background: "#1C1A10" }}
          >
            <div
              className="inline-block text-xs font-bold px-3 py-1.5 rounded-full mb-5"
              style={{ background: "rgba(240,192,64,0.15)", color: "#F0C040" }}
            >
              מחיר השקה — קבוע לצמיתות
            </div>

            <div className="flex items-end justify-center gap-3 mb-1">
              <span className="text-6xl font-black leading-none" style={{ color: "#F0C040" }}>
                50
              </span>
              <div className="pb-2 text-right">
                <div className="text-2xl font-black leading-none" style={{ color: "#F0C040" }}>₪</div>
                <div className="text-xs mt-1" style={{ color: "#8B7840" }}>לחודש</div>
              </div>
              <div className="pb-2 text-right">
                <div className="text-base font-semibold line-through" style={{ color: "#5A4E30" }}>100 ₪</div>
                <div className="text-xs" style={{ color: "#5A4E30" }}>מחיר רגיל</div>
              </div>
            </div>

            <div
              className="my-5 py-3 rounded-xl text-sm font-semibold"
              style={{ background: "rgba(240,192,64,0.1)", color: "#F0C040" }}
            >
              חודש ראשון חינם · ללא התחייבות
            </div>

            <ul className="text-sm text-right space-y-2.5 mb-7">
              {[
                "דף הזמנה מותאם לעסק",
                "לוח ניהול מלא",
                "ניהול לקוחות ותורים",
                "לוח שנה יומי/שבועי/חודשי",
                "ביט ופייבוקס מובנים",
                "תמיכה ב-WhatsApp",
                "מחיר קבוע לצמיתות לנרשמים עכשיו",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <span style={{ color: "#C9940A" }}>✓</span>
                  <span style={{ color: "#D4B878" }}>{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={scrollToForm}
              className="w-full py-4 rounded-2xl font-bold text-base active:scale-95 transition-transform"
              style={{ background: "#F0C040", color: "#1C1A10" }}
            >
              אני רוצה — השאר פרטים
            </button>
          </div>
        </div>
      </section>

      {/* ── REGISTRATION FORM ── */}
      <section
        ref={formRef}
        className="py-16 px-5"
        style={{ background: "#FFFBEF" }}
      >
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "#C9940A" }}
            >
              מתחילים?
            </p>
            <h2 className="text-2xl font-black mb-2" style={{ color: "#1C1A10" }}>
              נשמח לשמוע ממך
            </h2>
            <p className="text-sm" style={{ color: "#5A4E30" }}>
              ממלאים פרטים, ותוך 24 שעות חוזרים אליך עם הפרטים להתחלה
            </p>
          </div>

          {submitted ? (
            <div
              className="text-center py-10 rounded-3xl"
              style={{ background: "#1C1A10" }}
            >
              <div className="text-4xl mb-4">✦</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "#F0C040" }}>
                הפנייה נשלחה!
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#A89868" }}>
                נפתח חלון וואטסאפ לשליחת ההודעה לטל.
                <br />
                אם לא נפתח —{" "}
                <a
                  href="https://wa.me/972504558444"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#F0C040" }}
                  className="underline"
                >
                  לחץ כאן
                </a>
              </p>
            </div>
          ) : (
            <div
              className="rounded-3xl p-7"
              style={{ background: "#1C1A10" }}
            >
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-right" style={{ color: "#A89868" }}>
                    שם העסק
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="למשל: סטודיו לאן, ספא הדר..."
                    value={form.businessName}
                    onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-right focus:outline-none transition-colors"
                    style={{
                      background: "rgba(255,251,239,0.07)",
                      border: "1px solid rgba(240,192,64,0.2)",
                      color: "#FFFBEF",
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-right" style={{ color: "#A89868" }}>
                    שמך
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="שם מלא"
                    value={form.ownerName}
                    onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-right focus:outline-none transition-colors"
                    style={{
                      background: "rgba(255,251,239,0.07)",
                      border: "1px solid rgba(240,192,64,0.2)",
                      color: "#FFFBEF",
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-right" style={{ color: "#A89868" }}>
                    טלפון
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="05X-XXXXXXX"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none transition-colors"
                    style={{
                      background: "rgba(255,251,239,0.07)",
                      border: "1px solid rgba(240,192,64,0.2)",
                      color: "#FFFBEF",
                      direction: "ltr",
                      textAlign: "right",
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-right" style={{ color: "#A89868" }}>
                    סוג העסק
                  </label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none transition-colors"
                    style={{
                      background: "#252318",
                      border: "1px solid rgba(240,192,64,0.2)",
                      color: form.category ? "#FFFBEF" : "#6B5E2F",
                      direction: "rtl",
                    }}
                  >
                    <option value="" disabled style={{ color: "#6B5E2F" }}>
                      בחר קטגוריה
                    </option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value} style={{ color: "#1C1A10", background: "#fff" }}>
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
                    onChange={(e) => setForm((f) => ({ ...f, termsAccepted: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 rounded shrink-0"
                    style={{ accentColor: "#F0C040" }}
                  />
                  <span className="text-sm leading-relaxed text-right" style={{ color: "#7A6940" }}>
                    קראתי ואישרתי את{" "}
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      className="underline hover:opacity-80 transition-opacity"
                      style={{ color: "#C9940A" }}
                    >
                      תנאי השימוש
                    </button>
                  </span>
                </label>

                {error && (
                  <p className="text-sm text-right" style={{ color: "#E87070" }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl font-bold text-base mt-1 disabled:opacity-50 active:scale-95 transition-transform"
                  style={{ background: "#F0C040", color: "#1C1A10" }}
                >
                  {submitting ? "שולח..." : "שלח פנייה ופתח וואטסאפ"}
                </button>

                <p className="text-xs text-center" style={{ color: "#5A4E30" }}>
                  לא מנוי — פנייה לקבלת מידע. אין חיוב אוטומטי.
                </p>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="py-8 px-5 text-center"
        style={{ background: "#1C1A10", borderTop: "1px solid rgba(240,192,64,0.1)" }}
      >
        <p className="text-sm font-bold mb-1" style={{ color: "#F0C040" }}>
          יסמין תור
        </p>
        <p className="text-xs" style={{ color: "#5A4E30" }}>
          מערכת תורים לעסקים קטנים · יסמין תקשורת
        </p>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs" style={{ color: "#7A6940" }}>
          <a
            href="https://wa.me/972504558444"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
            style={{ color: "#A89868" }}
          >
            050-455-8444
          </a>
          <span>·</span>
          <span>talsigronuzan@gmail.com</span>
        </div>
      </footer>
    </div>
  );
}
