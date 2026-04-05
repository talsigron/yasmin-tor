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
    answer: "אם מתאים לך - ממשיכים ב-50 שקלים לחודש. אם לא - פשוט לא ממשיכים.",
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

    const elements = node.querySelectorAll(".fade-section");
    elements.forEach((el) => {
      el.classList.add("js-observed");
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return ref;
}

function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setPos({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return pos;
}

function useCountUp(target: number, duration: number, trigger: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const startTime = performance.now();

    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * target);
      setCount(start);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [target, duration, trigger]);

  return count;
}

/* ===================================================================
   PARTICLE BACKGROUND
   =================================================================== */

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      baseAlpha: number;
      pulse: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      resize();
      particles = [];
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 18000), 80);
      for (let i = 0; i < count; i++) {
        const baseAlpha = Math.random() * 0.3 + 0.05;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          size: Math.random() * 1.5 + 0.5,
          alpha: baseAlpha,
          baseAlpha,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.01;
        p.alpha = p.baseAlpha + Math.sin(p.pulse) * 0.1;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(252, 211, 77, ${Math.max(0, p.alpha)})`;
        ctx.fill();
      }

      // Draw connections between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(252, 211, 77, ${0.04 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    init();
    draw();

    window.addEventListener("resize", init);
    return () => {
      window.removeEventListener("resize", init);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
}

/* ===================================================================
   NAVBAR
   =================================================================== */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-nav" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between sm:h-20">
          <a
            href="#"
            className="text-xl font-bold sm:text-2xl gradient-text-animated"
            style={{ WebkitTextFillColor: "transparent" }}
          >
            יסמין תור
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#how"
              className="text-sm text-[#9CA3AF] transition-colors duration-300 hover:text-[#FCD34D]"
            >
              איך זה עובד
            </a>
            <a
              href="#pricing"
              className="text-sm text-[#9CA3AF] transition-colors duration-300 hover:text-[#FCD34D]"
            >
              מחירון
            </a>
            <a
              href="#faq"
              className="text-sm text-[#9CA3AF] transition-colors duration-300 hover:text-[#FCD34D]"
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

/* ===================================================================
   HERO SECTION
   =================================================================== */

function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const mouse = useMousePosition();

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const x = mouse.x - rect.left;
    const y = mouse.y - rect.top;
    hero.style.setProperty("--spotlight-x", `${x}px`);
    hero.style.setProperty("--spotlight-y", `${y}px`);
  }, [mouse]);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-20"
    >
      {/* Spotlight overlay */}
      <div className="hero-spotlight" />

      {/* Dot grid */}
      <div className="dot-grid" />

      {/* Floating glow orbs */}
      <div
        className="float-1 pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(252,211,77,0.12), transparent 70%)",
        }}
      />
      <div
        className="float-2 pointer-events-none absolute -bottom-48 -left-48 h-[600px] w-[600px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(245,158,11,0.1), transparent 70%)",
        }}
      />
      <div
        className="float-3 pointer-events-none absolute left-1/2 top-1/4 h-[300px] w-[300px] -translate-x-1/2 rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(252,211,77,0.1), transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-block rounded-full border border-[rgba(252,211,77,0.2)] bg-[rgba(252,211,77,0.05)] px-5 py-2">
          <span className="text-sm text-[#FCD34D]">14 יום ניסיון חינם</span>
        </div>

        <h1 className="gradient-text-animated mb-8 text-4xl font-black leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
          המערכת שתנהל
          <br />
          לך את התורים
        </h1>

        <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-[#9CA3AF] sm:text-xl md:text-2xl">
          קביעת תורים, ניהול לקוחות, תשלומים ועוד - הכל במקום אחד.
          <br className="hidden sm:block" />
          בלי אפליקציה, בלי התקנה.
        </p>

        <div className="flex flex-col items-center gap-5">
          <a
            href="#cta"
            className="btn-gold pulse-gold px-10 py-4 text-lg font-bold sm:text-xl"
          >
            התחילו תקופת ניסיון חינם
          </a>
          <p className="text-sm text-[#9CA3AF]">
            ללא כרטיס אשראי. ללא התחייבות.
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 flex justify-center">
          <div
            className="h-10 w-6 rounded-full border-2 border-[rgba(252,211,77,0.3)] flex items-start justify-center p-1"
          >
            <div
              className="h-2 w-1.5 rounded-full bg-[#FCD34D]"
              style={{
                animation: "float 2s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================================================================
   TILT CARD (for Features)
   =================================================================== */

function TiltCard({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.setProperty("--mouse-x", `${(x / rect.width) * 100}%`);
    card.style.setProperty("--mouse-y", `${(y / rect.height) * 100}%`);
  }, []);

  const handleLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  }, []);

  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        ...style,
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, box-shadow 0.4s ease",
        willChange: "transform",
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
}

/* ===================================================================
   FEATURES SECTION
   =================================================================== */

function FeaturesSection() {
  return (
    <section className="relative px-4 py-24 sm:py-32">
      <div className="section-divider mb-24" />
      <div className="mx-auto max-w-6xl">
        <div className="fade-section mb-16 text-center">
          <h2 className="gold-text-glow mb-4 text-3xl font-bold text-[#FCD34D] sm:text-4xl md:text-5xl">
            למה יסמין תור?
          </h2>
          <p className="mx-auto max-w-lg text-[#9CA3AF]">
            הכלים שיחסכו לך שעות של עבודה כל שבוע
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
          {features.map((feature, index) => (
            <TiltCard
              key={index}
              className={`fade-section glass-card stagger-${index + 1}`}
            >
              <div className="relative z-10">
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[rgba(252,211,77,0.08)] text-3xl">
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-[#9CA3AF]">
                  {feature.description}
                </p>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================================================================
   HOW IT WORKS
   =================================================================== */

function HowItWorksSection() {
  const [lineVisible, setLineVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLineVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how" className="relative px-4 py-24 sm:py-32">
      <div className="section-divider mb-24" />
      <div className="mx-auto max-w-4xl" ref={sectionRef}>
        <div className="fade-section mb-16 text-center">
          <h2 className="gold-text-glow mb-4 text-3xl font-bold text-[#FCD34D] sm:text-4xl md:text-5xl">
            איך זה עובד?
          </h2>
          <p className="mx-auto max-w-lg text-[#9CA3AF]">
            שלושה צעדים פשוטים ואתם בפנים
          </p>
        </div>

        <div className="relative flex flex-col gap-12 md:flex-row md:items-start md:justify-between md:gap-8">
          {/* Connecting line (desktop) */}
          <div className="absolute left-0 right-0 top-8 hidden md:block overflow-hidden">
            <div
              className={lineVisible ? "step-line-animated" : ""}
              style={{
                background: lineVisible
                  ? "linear-gradient(to left, transparent, rgba(252,211,77,0.3), transparent)"
                  : "transparent",
                height: "2px",
                width: lineVisible ? "100%" : "0%",
                transition: "width 1.5s ease-out",
              }}
            />
          </div>

          {steps.map((step, index) => (
            <div
              key={index}
              className={`fade-section relative flex flex-1 flex-col items-center text-center stagger-${index + 1}`}
            >
              <div className="step-number relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#FCD34D] bg-[#050505] text-2xl font-bold text-[#FCD34D]">
                {step.number}
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">
                {step.title}
              </h3>
              <p className="max-w-xs leading-relaxed text-[#9CA3AF]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================================================================
   PRICING SECTION
   =================================================================== */

function PricingSection() {
  const [countStarted, setCountStarted] = useState(false);
  const priceRef = useRef<HTMLDivElement>(null);
  const displayPrice = useCountUp(50, 1500, countStarted);

  useEffect(() => {
    const node = priceRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCountStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" className="relative px-4 py-24 sm:py-32">
      <div className="section-divider mb-24" />
      <div className="mx-auto max-w-xl">
        <div className="fade-section mb-16 text-center">
          <h2 className="gold-text-glow mb-4 text-3xl font-bold text-[#FCD34D] sm:text-4xl md:text-5xl">
            מחירון
          </h2>
          <p className="mx-auto max-w-lg text-[#9CA3AF]">
            מחיר אחד פשוט. בלי הפתעות.
          </p>
        </div>

        <div className="fade-section glow-border-card p-8 text-center sm:p-12" ref={priceRef}>
          <div className="relative z-10">
            <div className="mb-3 price-counter text-5xl font-black text-[#FCD34D] sm:text-7xl">
              {displayPrice}&#8362;{" "}
              <span className="text-2xl font-bold text-[#9CA3AF] sm:text-3xl">
                לחודש
              </span>
            </div>
            <p className="mb-10 text-lg text-[#9CA3AF]">
              הכל כלול. בלי הפתעות.
            </p>

            <ul className="mb-10 space-y-4 text-right">
              {pricingFeatures.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(252,211,77,0.1)]">
                    <svg
                      className="h-3 w-3 text-[#FCD34D]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
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
            <p className="mt-4 text-sm text-[#9CA3AF]">
              ללא כרטיס אשראי. ללא התחייבות.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================================================================
   FAQ SECTION
   =================================================================== */

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative px-4 py-24 sm:py-32">
      <div className="section-divider mb-24" />
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
              className={`fade-section faq-item stagger-${index + 1}`}
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
                  className={`h-5 w-5 flex-shrink-0 text-[#FCD34D] transition-transform duration-400 ${
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
                className={`overflow-hidden transition-all duration-400 ease-out ${
                  openIndex === index
                    ? "max-h-40 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <p className="px-5 pb-5 leading-relaxed text-[#9CA3AF]">
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

/* ===================================================================
   FINAL CTA
   =================================================================== */

function FinalCTASection() {
  return (
    <section
      id="cta"
      className="relative overflow-hidden px-4 py-24 sm:py-32"
    >
      <div className="section-divider mb-24" />

      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 80%, rgba(252,211,77,0.06), transparent)",
        }}
      />

      <div
        className="float-1 pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(252,211,77,0.15), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="fade-section">
          <h2 className="gradient-text-animated mb-6 text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
            מוכנים להתחיל?
          </h2>
          <p className="mx-auto mb-12 max-w-xl text-lg leading-relaxed text-[#9CA3AF] sm:text-xl">
            הצטרפו לבעלי העסקים שכבר חוסכים שעות של ניהול תורים
          </p>
          <a
            href="#"
            className="btn-gold pulse-gold inline-block px-12 py-5 text-lg font-bold sm:text-xl"
          >
            התחילו תקופת ניסיון חינם
          </a>
          <p className="mt-5 text-sm text-[#9CA3AF]">
            14 יום ניסיון חינם. ללא כרטיס אשראי.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ===================================================================
   FOOTER
   =================================================================== */

function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.05)] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="text-xl font-bold gradient-text-animated" style={{ WebkitTextFillColor: "transparent" }}>
            יסמין תור
          </span>
          <div className="flex gap-6 text-sm text-[#9CA3AF]">
            <a href="#" className="transition-colors duration-300 hover:text-[#FCD34D]">
              תנאי שימוש
            </a>
            <a href="#" className="transition-colors duration-300 hover:text-[#FCD34D]">
              מדיניות פרטיות
            </a>
          </div>
          <p className="text-sm text-[rgba(255,255,255,0.25)]">
            &copy; 2026 יסמין תור | טל סיגרון - יסמין תקשורת
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ===================================================================
   MAIN PAGE
   =================================================================== */

export default function Home() {
  const pageRef = useFadeIn();

  return (
    <div ref={pageRef} className="relative">
      <ParticleBackground />
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
