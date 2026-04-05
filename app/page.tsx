"use client";

import { useEffect, useState, useRef } from "react";

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
      { threshold: 0.1 }
    );

    const elements = node.querySelectorAll(".fade-section");
    elements.forEach((el) => {
      el.classList.add("js-observed");
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return ref;
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-nav" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between sm:h-20">
          <a
            href="#"
            className="text-xl font-bold text-[#FCD34D] sm:text-2xl"
          >
            יסמין תור
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#how"
              className="text-sm text-gray-300 transition-colors hover:text-[#FCD34D]"
            >
              איך זה עובד
            </a>
            <a
              href="#pricing"
              className="text-sm text-gray-300 transition-colors hover:text-[#FCD34D]"
            >
              מחירון
            </a>
            <a
              href="#faq"
              className="text-sm text-gray-300 transition-colors hover:text-[#FCD34D]"
            >
              שאלות נפוצות
            </a>
          </div>

          <a
            href="#cta"
            className="btn-gold px-4 py-2 text-sm sm:px-6 sm:py-2.5 sm:text-base"
          >
            התחילו בחינם
          </a>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-20">
      <div className="glow-circle -right-32 -top-32 h-[500px] w-[500px] opacity-40" />
      <div className="glow-circle -bottom-48 -left-48 h-[600px] w-[600px] opacity-30" />
      <div className="glow-circle left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 opacity-20" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h1 className="gold-text-glow mb-6 text-4xl font-black leading-tight text-[#FCD34D] sm:text-5xl md:text-6xl lg:text-7xl">
          המערכת שתנהל לך את התורים
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-300 sm:text-xl md:text-2xl">
          קביעת תורים, ניהול לקוחות, תשלומים ועוד - הכל במקום אחד. בלי
          אפליקציה, בלי התקנה.
        </p>
        <div className="flex flex-col items-center gap-4">
          <a
            href="#cta"
            className="btn-gold pulse-gold px-8 py-4 text-lg font-bold sm:text-xl"
          >
            התחילו תקופת ניסיון חינם
          </a>
          <p className="text-sm text-gray-400">
            14 יום ניסיון חינם. ללא כרטיס אשראי.
          </p>
        </div>
      </div>
    </section>
  );
}

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

function FeaturesSection() {
  return (
    <section className="relative px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="fade-section mb-16 text-center">
          <h2 className="gold-text-glow mb-4 text-3xl font-bold text-[#FCD34D] sm:text-4xl md:text-5xl">
            למה יסמין תור?
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="fade-section feature-card"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h3 className="mb-2 text-xl font-bold text-white">
                {feature.title}
              </h3>
              <p className="leading-relaxed text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

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

function HowItWorksSection() {
  return (
    <section id="how" className="relative px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="fade-section mb-16 text-center">
          <h2 className="gold-text-glow mb-4 text-3xl font-bold text-[#FCD34D] sm:text-4xl md:text-5xl">
            איך זה עובד?
          </h2>
        </div>

        <div className="relative flex flex-col gap-12 md:flex-row md:items-start md:justify-between md:gap-8">
          <div
            className="absolute left-0 right-0 top-8 hidden h-0.5 md:block"
            style={{
              background:
                "linear-gradient(to left, transparent, rgba(252,211,77,0.3), transparent)",
            }}
          />

          {steps.map((step, index) => (
            <div
              key={index}
              className="fade-section relative flex flex-1 flex-col items-center text-center"
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#FCD34D] bg-[#0a0a0a] text-2xl font-bold text-[#FCD34D] gold-glow">
                {step.number}
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">
                {step.title}
              </h3>
              <p className="max-w-xs leading-relaxed text-gray-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

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

function PricingSection() {
  return (
    <section id="pricing" className="relative px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-xl">
        <div className="fade-section mb-16 text-center">
          <h2 className="gold-text-glow mb-4 text-3xl font-bold text-[#FCD34D] sm:text-4xl md:text-5xl">
            מחירון
          </h2>
        </div>

        <div className="fade-section pricing-card p-8 text-center sm:p-12">
          <div className="mb-2 text-5xl font-black text-[#FCD34D] sm:text-6xl">
            50&#8362; <span className="text-2xl font-bold sm:text-3xl">לחודש</span>
          </div>
          <p className="mb-8 text-lg text-gray-300">
            הכל כלול. בלי הפתעות.
          </p>

          <ul className="mb-10 space-y-4 text-right">
            {pricingFeatures.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-[#FCD34D]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-200">{feature}</span>
              </li>
            ))}
          </ul>

          <a
            href="#cta"
            className="btn-gold inline-block px-8 py-4 text-lg font-bold"
          >
            התחילו 14 יום חינם
          </a>
          <p className="mt-4 text-sm text-gray-400">
            ללא כרטיס אשראי. ללא התחייבות.
          </p>
        </div>
      </div>
    </section>
  );
}

const faqItems = [
  {
    question: "האם צריך ידע טכני?",
    answer:
      "בכלל לא. ההרשמה לוקחת דקה והמערכת מוכנה לשימוש מיידי.",
  },
  {
    question: "האם הלקוחות שלי צריכים להתקין אפליקציה?",
    answer:
      "לא. הכל עובד דרך הדפדפן. הלקוחות פשוט לוחצים על הלינק.",
  },
  {
    question: "אפשר לבטל בכל עת?",
    answer: "כמובן. ללא התחייבות, ללא דמי ביטול.",
  },
  {
    question: "איך הלקוחות שלי משלמים?",
    answer:
      "דרך ביט או פייבוקס, ישירות אליך. בלי עמלות, בלי מתווכים.",
  },
  {
    question: "מה קורה אחרי תקופת הניסיון?",
    answer:
      "אם מתאים לך - ממשיכים ב-50 שקלים לחודש. אם לא - פשוט לא ממשיכים.",
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl">
        <div className="fade-section mb-16 text-center">
          <h2 className="gold-text-glow mb-4 text-3xl font-bold text-[#FCD34D] sm:text-4xl md:text-5xl">
            שאלות נפוצות
          </h2>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="fade-section faq-item"
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="flex w-full items-center justify-between p-5 text-right"
              >
                <span className="text-lg font-semibold text-white">
                  {item.question}
                </span>
                <svg
                  className={`h-5 w-5 flex-shrink-0 text-[#FCD34D] transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index
                    ? "max-h-40 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <p className="px-5 pb-5 leading-relaxed text-gray-400">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTASection() {
  return (
    <section
      id="cta"
      className="relative px-4 py-24 sm:py-32"
      style={{
        background:
          "linear-gradient(to bottom, #0a0a0a, rgba(252,211,77,0.03))",
      }}
    >
      <div className="glow-circle left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 opacity-20" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="fade-section">
          <h2 className="gold-text-glow mb-6 text-3xl font-bold text-[#FCD34D] sm:text-4xl md:text-5xl">
            מוכנים להתחיל?
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-gray-300 sm:text-xl">
            הצטרפו לבעלי העסקים שכבר חוסכים שעות של ניהול תורים
          </p>
          <a
            href="#"
            className="btn-gold pulse-gold inline-block px-10 py-4 text-lg font-bold sm:text-xl"
          >
            התחילו תקופת ניסיון חינם
          </a>
          <p className="mt-4 text-sm text-gray-400">
            14 יום ניסיון חינם. ללא כרטיס אשראי.
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-800 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="text-xl font-bold text-[#FCD34D]">יסמין תור</span>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="transition-colors hover:text-[#FCD34D]">
              תנאי שימוש
            </a>
            <a href="#" className="transition-colors hover:text-[#FCD34D]">
              מדיניות פרטיות
            </a>
          </div>
          <p className="text-sm text-gray-500">
            &copy; 2026 יסמין תור | טל סיגרון - יסמין תקשורת
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const pageRef = useFadeIn();

  return (
    <div ref={pageRef}>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
