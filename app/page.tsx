"use client";

import { useEffect, useState, useRef, useCallback } from "react";

/* ===================================================================
   DATA
   =================================================================== */

const features = [
  {
    icon: "\uD83C\uDFA8",
    title: "אתר מותאם אישית",
    description: "העסק שלך מקבל אתר מעוצב עם הלוגו, הצבעים והתמונות שלך",
  },
  {
    icon: "\uD83D\uDCC5",
    title: "ניהול תורים חכם",
    description: "לקוחות קובעים תורים 24/7, בלי טלפונים ובלי וואטסאפים",
  },
  {
    icon: "\uD83D\uDC65",
    title: "ניהול לקוחות",
    description: "רשימת לקוחות, אישור הרשמות, היסטוריית תורים",
  },
  {
    icon: "\uD83D\uDCB3",
    title: "תשלומים מובנים",
    description: "ביט, פייבוקס - הלקוחות משלמים ישירות אליך",
  },
];

const steps = [
  {
    number: 1,
    title: "נרשמים",
    description: "ממלאים פרטים ובוחרים סיסמה. תוך דקה יש לך מערכת",
  },
  {
    number: 2,
    title: "מגדירים",
    description: "מעלים לוגו, בוחרים צבעים, מוסיפים שירותים ושעות עבודה",
  },
  {
    number: 3,
    title: "מתחילים לקבל תורים",
    description: "שולחים את הלינק ללקוחות והתורים מתחילים להיכנס",
  },
];

const pricingFeatures = [
  "אתר מותאם אישית",
  "קביעת תורים 24/7",
  "ניהול לקוחות",
  "יומן תורים חכם",
  "תמיכה בביט ופייבוקס",
  "התראות בזמן אמת",
  "גלריית תמונות",
  "ללא הגבלת לקוחות",
];

const testimonials = [
  {
    name: "מטר סיגרון",
    title: "Menta Nail - סטודיו לציפורניים",
    initials: "מס",
    quote:
      "מאז שעברתי ליסמין תור החיים שלי השתנו. לקוחות קובעות לבד, אני לא מפספסת תורים, והכל מסודר במקום אחד. ממליצה בחום!",
  },
  {
    name: "אורן דוד",
    title: "David Barber - מספרה",
    initials: "אד",
    quote:
      "פשוט וקל לשימוש. הלקוחות שלי אוהבים את זה ואני חוסך שעות של טלפונים כל שבוע. שווה כל שקל.",
  },
  {
    name: "שירה לוי",
    title: "שירה ביוטי - קוסמטיקה",
    initials: "של",
    quote:
      "ניסיתי כמה מערכות לפני. יסמין תור הכי פשוטה והכי יפה. גם המחיר משתלם בטירוף.",
  },
];

const faqItems = [
  {
    question: "האם צריך ידע טכני?",
    answer: "בכלל לא. ההרשמה לוקחת דקה והמערכת מוכנה לשימוש מיידי.",
  },
  {
    question: "האם הלקוחות שלי צריכים להתקין אפליקציה?",
    answer: "לא. הכל עובד דרך הדפדפן. הלקוחות פשוט לוחצים על הלינק.",
  },
  {
    question: "אפשר לבטל בכל עת?",
    answer: "כמובן. ללא התחייבות, ללא דמי ביטול.",
  },
  {
    question: "איך הלקוחות שלי משלמים?",
    answer: "דרך ביט או פייבוקס, ישירות אליך. בלי עמלות, בלי מתווכים.",
  },
  {
    question: "מה קורה אחרי תקופת הניסיון?",
    answer:
      "אם מתאים לך - ממשיכים ב-50 שקלים לחודש. אם לא - פשוט לא ממשיכים.",
  },
  {
    question: "כמה זה עולה?",
    answer:
      "50\u20AA לחודש, הכל כלול. החודש הראשון חינם לגמרי, בלי כרטיס אשראי. וגם אפשר לבטל בכל עת.",
  },
];

/* ===================================================================
   HOOKS
   =================================================================== */

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    const elements = node.querySelectorAll(".fade-up");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
}

function useCountUp(target: number, duration: number, trigger: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    const startTime = performance.now();

    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [target, duration, trigger]);

  return count;
}

/* ===================================================================
   COMPONENTS
   =================================================================== */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "איך זה עובד", href: "#how" },
    { label: "מחירון", href: "#pricing" },
    { label: "המלצות", href: "#testimonials" },
    { label: "שאלות נפוצות", href: "#faq" },
  ];

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-nav" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <a
          href="#"
          className="text-xl font-bold"
          style={{ color: "#D4A017" }}
        >
          יסמין תור
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[#6B7280] hover:text-[#D4A017] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA + Mobile toggle */}
        <div className="flex items-center gap-3">
          <a
            href="#pricing"
            className="hidden md:inline-block btn-gold text-sm py-2.5 px-5"
          >
            התחילו בחינם
          </a>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-[#6B7280]"
            aria-label="תפריט"
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#E5E7EB] px-4 pb-4 pt-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2.5 text-sm font-medium text-[#6B7280] hover:text-[#D4A017]"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#pricing"
            onClick={() => setMenuOpen(false)}
            className="block mt-2 btn-gold text-center text-sm py-2.5"
          >
            התחילו בחינם
          </a>
        </div>
      )}
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="blob-1 absolute rounded-full"
          style={{
            width: 500,
            height: 500,
            top: "-10%",
            right: "-5%",
            background:
              "radial-gradient(circle, rgba(212,160,23,0.08), transparent 70%)",
          }}
        />
        <div
          className="blob-2 absolute rounded-full"
          style={{
            width: 400,
            height: 400,
            bottom: "10%",
            left: "5%",
            background:
              "radial-gradient(circle, rgba(245,158,11,0.06), transparent 70%)",
          }}
        />
        <div
          className="blob-3 absolute rounded-full"
          style={{
            width: 300,
            height: 300,
            top: "40%",
            left: "40%",
            background:
              "radial-gradient(circle, rgba(212,160,23,0.05), transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text content - right side in RTL */}
          <div className="flex-1 text-center lg:text-right">
            <span className="badge-gold inline-block mb-6">
              חודש ראשון חינם 🎁
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              <span className="gold-gradient-text">ניהול התורים שלך</span>
              <br />
              <span className="text-[#1A1A1A]">ברמה אחרת</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#6B7280] max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
              הלקוחות קובעים תורים בקלות, אתם מנהלים הכל ממקום אחד. בלי
              אפליקציה, בלי התקנה, בלי כאב ראש.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <a
                href="#pricing"
                className="btn-gold text-base py-3.5 px-8"
              >
                התחילו חודש ניסיון חינם
              </a>
            </div>

            <p className="mt-4 text-sm text-[#9CA3AF]">
              ללא כרטיס אשראי. ללא התחייבות.
            </p>
          </div>

          {/* Phone mockup - left side in RTL */}
          <div className="flex-1 hidden lg:flex justify-center">
            <div className="phone-mockup relative" style={{ width: 280 }}>
              {/* Phone frame */}
              <div
                className="relative rounded-[36px] overflow-hidden border-[6px] border-[#E5E7EB]"
                style={{
                  background: "#FFFFFF",
                  boxShadow:
                    "0 25px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
                  aspectRatio: "9/19",
                }}
              >
                {/* Notch */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[22px] rounded-b-2xl z-10"
                  style={{ background: "#E5E7EB" }}
                />

                {/* Screen content */}
                <div className="pt-8 px-4 pb-4 h-full flex flex-col">
                  {/* Status bar */}
                  <div className="flex justify-between items-center text-[10px] text-[#6B7280] mb-4 px-1">
                    <span>9:41</span>
                    <span>100%</span>
                  </div>

                  {/* App header */}
                  <div
                    className="text-center py-3 rounded-xl mb-4"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(212,160,23,0.1), rgba(245,158,11,0.08))",
                    }}
                  >
                    <div className="text-sm font-bold text-[#D4A017]">
                      יסמין תור
                    </div>
                    <div className="text-[10px] text-[#6B7280]">
                      בחרו שירות
                    </div>
                  </div>

                  {/* Service items */}
                  {["תספורת גברים", "תספורת + זקן", "צבע שיער"].map(
                    (service, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-3 px-3 mb-2 rounded-lg"
                        style={{
                          background: i === 0 ? "rgba(212,160,23,0.06)" : "transparent",
                          border:
                            i === 0
                              ? "1px solid rgba(212,160,23,0.2)"
                              : "1px solid #E5E7EB",
                        }}
                      >
                        <span className="text-xs font-medium text-[#1A1A1A]">
                          {service}
                        </span>
                        <span className="text-[10px] text-[#6B7280]">
                          {[50, 70, 120][i]}\u20AA
                        </span>
                      </div>
                    )
                  )}

                  {/* Book button */}
                  <div className="mt-auto">
                    <div
                      className="text-center py-2.5 rounded-lg text-xs font-bold text-white"
                      style={{
                        background: "linear-gradient(135deg, #D4A017, #F59E0B)",
                      }}
                    >
                      קביעת תור
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  const c1 = useCountUp(1200, 2000, visible);
  const c2 = useCountUp(50, 1500, visible);
  const c3 = useCountUp(99, 1800, visible);

  const stats = [
    { value: `${c1.toLocaleString()}+`, label: "תורים נקבעו" },
    { value: `${c2}+`, label: "עסקים פעילים" },
    { value: `${c3}%`, label: "שביעות רצון" },
  ];

  return (
    <div ref={ref} className="stats-strip py-10">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-around gap-8">
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#D4A017] mb-1">
              {s.value}
            </div>
            <div className="text-sm text-[#6B7280] font-medium">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 fade-up">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] mb-4">
            למה <span className="gold-gradient-text">יסמין תור</span>?
          </h2>
          <p className="text-[#6B7280] text-lg max-w-xl mx-auto">
            כל מה שצריך לנהל את העסק שלך במקום אחד
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className={`feature-card fade-up stagger-${i + 1}`}
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="py-20 lg:py-28" style={{ background: "#F3F4F6" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 fade-up">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] mb-4">
            איך זה <span className="gold-gradient-text">עובד</span>?
          </h2>
          <p className="text-[#6B7280] text-lg max-w-xl mx-auto">
            שלושה צעדים פשוטים ואתם באוויר
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-start justify-center gap-8 md:gap-4">
          {steps.map((s, i) => (
            <div key={i} className="flex-1 relative fade-up stagger-${i + 1}">
              <div className="flex flex-col items-center text-center">
                <div className="step-number mb-5">{s.number}</div>

                {/* Connecting line (desktop only, between steps) */}
                {i < steps.length - 1 && (
                  <div
                    className="hidden md:block absolute top-7 left-0 w-full step-line"
                    style={{ transform: "translateX(-50%)" }}
                  />
                )}

                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-[#6B7280] leading-relaxed max-w-[260px]">
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 fade-up">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] mb-4">
            מה אומרים <span className="gold-gradient-text">עלינו</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`testimonial-card fade-up stagger-${i + 1}`}
            >
              {/* Quote mark */}
              <div className="text-4xl text-[#D4A017] opacity-30 mb-3 leading-none">
                &ldquo;
              </div>

              <p className="text-[#4B5563] text-sm leading-relaxed mb-5">
                {t.quote}
              </p>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, si) => (
                  <svg
                    key={si}
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    fill="#D4A017"
                  >
                    <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.44.91-5.32L2.27 6.62l5.34-.78z" />
                  </svg>
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, #D4A017, #F59E0B)",
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="font-bold text-sm text-[#1A1A1A]">
                    {t.name}
                  </div>
                  <div className="text-xs text-[#9CA3AF]">{t.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section
      id="pricing"
      className="py-20 lg:py-28"
      style={{ background: "#F3F4F6" }}
    >
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 fade-up">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] mb-4">
            <span className="gold-gradient-text">מחירון</span>
          </h2>
        </div>

        <div className="pricing-card p-8 sm:p-10 fade-up">
          {/* Badge */}
          <div className="text-center mb-8">
            <span className="badge-gold">חודש ראשון חינם 🎁</span>
          </div>

          {/* Pricing options */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Monthly */}
            <div className="text-center p-4 rounded-xl border border-[#E5E7EB]">
              <div className="text-sm text-[#6B7280] mb-1">חודשי</div>
              <div className="text-3xl font-extrabold text-[#1A1A1A]">
                50<span className="text-lg">\u20AA</span>
              </div>
              <div className="text-xs text-[#9CA3AF]">לחודש</div>
            </div>

            {/* Annual */}
            <div
              className="text-center p-4 rounded-xl border-2"
              style={{ borderColor: "#D4A017" }}
            >
              <div className="text-sm text-[#6B7280] mb-1">
                שנתי{" "}
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold"
                  style={{ background: "#D4A017" }}
                >
                  חוסכים 100\u20AA
                </span>
              </div>
              <div className="text-3xl font-extrabold text-[#1A1A1A]">
                500<span className="text-lg">\u20AA</span>
              </div>
              <div className="text-xs text-[#9CA3AF]">
                לשנה, כולל 2 חודשים מתנה
              </div>
            </div>
          </div>

          {/* Feature list */}
          <ul className="space-y-3 mb-8">
            {pricingFeatures.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-[#4B5563]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="#D4A017"
                  className="shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <a
            href="#"
            className="btn-gold block text-center w-full py-3.5 text-base"
          >
            התחילו חודש חינם
          </a>
          <p className="text-center text-xs text-[#9CA3AF] mt-3">
            ללא כרטיס אשראי. ביטול בכל עת.
          </p>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback(
    (i: number) => setOpenIndex((prev) => (prev === i ? null : i)),
    []
  );

  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 fade-up">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] mb-4">
            שאלות <span className="gold-gradient-text">נפוצות</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <div
              key={i}
              className={`faq-item fade-up stagger-${Math.min(i + 1, 6)} ${
                openIndex === i ? "faq-item-open" : ""
              }`}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-5 py-4 text-right"
              >
                <span className="font-bold text-[#1A1A1A] text-sm sm:text-base">
                  {item.question}
                </span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="#D4A017"
                  className={`shrink-0 transition-transform duration-300 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div
                className="overflow-hidden transition-all duration-400"
                style={{
                  maxHeight: openIndex === i ? "200px" : "0px",
                  opacity: openIndex === i ? 1 : 0,
                }}
              >
                <div className="px-5 pb-4 text-sm text-[#6B7280] leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="cta-gradient-bg py-20 lg:py-24">
      <div className="max-w-2xl mx-auto px-4 text-center fade-up">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] mb-4">
          מוכנים לחסוך שעות של ניהול תורים?
        </h2>
        <p className="text-[#6B7280] text-lg mb-8">
          הצטרפו לעסקים שכבר עובדים חכם
        </p>
        <a href="#pricing" className="btn-gold inline-block text-base py-3.5 px-10">
          התחילו חודש ניסיון חינם
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-10 border-t border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <div className="text-xl font-bold text-[#D4A017] mb-3">יסמין תור</div>
        <p className="text-sm text-[#9CA3AF]">
          &copy; 2026 יסמין תור | טל סיגרון - יסמין תקשורת
        </p>
      </div>
    </footer>
  );
}

/* ===================================================================
   MAIN PAGE
   =================================================================== */

export default function HomePage() {
  const fadeRef = useFadeIn();

  return (
    <div ref={fadeRef}>
      <Navbar />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <HowItWorks />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
