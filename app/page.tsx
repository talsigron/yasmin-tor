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
      { threshold: 0.06, rootMargin: "0px 0px -30px 0px" }
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
   CUSTOM CURSOR
   =================================================================== */

function CustomCursor() {
  const innerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    let mouseX = 0;
    let mouseY = 0;
    let outerX = 0;
    let outerY = 0;

    const handleMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (innerRef.current) {
        innerRef.current.style.left = `${mouseX}px`;
        innerRef.current.style.top = `${mouseY}px`;
      }
    };

    const animate = () => {
      outerX += (mouseX - outerX) * 0.12;
      outerY += (mouseY - outerY) * 0.12;
      if (outerRef.current) {
        outerRef.current.style.left = `${outerX}px`;
        outerRef.current.style.top = `${outerY}px`;
      }
      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMove);
    const animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <div ref={innerRef} className="cursor-glow" />
      <div ref={outerRef} className="cursor-glow-outer" />
    </>
  );
}

/* ===================================================================
   PARTICLE BACKGROUND (enhanced - more particles, denser connections)
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
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 10000), 140);
      for (let i = 0; i < count; i++) {
        const baseAlpha = Math.random() * 0.35 + 0.08;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 2 + 0.5,
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
        p.pulse += 0.015;
        p.alpha = p.baseAlpha + Math.sin(p.pulse) * 0.12;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(252, 211, 77, ${Math.max(0, p.alpha)})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(252, 211, 77, ${0.06 * (1 - dist / 140)})`;
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
   PHONE MOCKUP
   =================================================================== */

function PhoneMockup() {
  return (
    <div className="phone-mockup relative mx-auto w-[220px] sm:w-[260px]">
      {/* Phone frame */}
      <div
        className="relative overflow-hidden rounded-[32px] border-2 border-[rgba(252,211,77,0.25)] bg-[#0a0a0a]"
        style={{
          boxShadow:
            "0 25px 60px rgba(252,211,77,0.12), 0 0 80px rgba(252,211,77,0.06), inset 0 0 30px rgba(252,211,77,0.03)",
          aspectRatio: "9/18",
        }}
      >
        {/* Notch */}
        <div className="phone-notch" />

        {/* Screen content */}
        <div className="flex h-full flex-col px-4 pt-10 pb-4">
          {/* Header bar */}
          <div className="mb-4 flex items-center justify-between">
            <div className="h-2.5 w-12 rounded-full bg-[rgba(252,211,77,0.3)]" />
            <div className="h-6 w-6 rounded-full bg-[rgba(252,211,77,0.15)] flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-[rgba(252,211,77,0.4)]" />
            </div>
          </div>

          {/* Calendar mockup */}
          <div className="mb-3 rounded-xl bg-[rgba(252,211,77,0.05)] border border-[rgba(252,211,77,0.1)] p-3">
            <div className="mb-2 h-2 w-16 rounded-full bg-[rgba(252,211,77,0.25)]" />
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-4 w-4 rounded-md ${
                    i === 5 || i === 9
                      ? "bg-[rgba(252,211,77,0.5)]"
                      : "bg-[rgba(255,255,255,0.06)]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Appointment slots */}
          {[0.4, 0.25, 0.3].map((opacity, i) => (
            <div
              key={i}
              className="mb-2 flex items-center gap-2 rounded-lg bg-[rgba(252,211,77,0.04)] border border-[rgba(252,211,77,0.08)] p-2"
            >
              <div
                className="h-7 w-7 rounded-lg flex-shrink-0"
                style={{ backgroundColor: `rgba(252,211,77,${opacity})` }}
              />
              <div className="flex-1 space-y-1">
                <div className="h-1.5 w-3/4 rounded-full bg-[rgba(255,255,255,0.15)]" />
                <div className="h-1.5 w-1/2 rounded-full bg-[rgba(255,255,255,0.08)]" />
              </div>
            </div>
          ))}

          {/* Bottom CTA button */}
          <div className="mt-auto">
            <div className="h-8 w-full rounded-full bg-gradient-to-l from-[#FCD34D] to-[#F59E0B] flex items-center justify-center">
              <div className="h-1.5 w-14 rounded-full bg-[rgba(5,5,5,0.4)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   HERO SECTION
   =================================================================== */

function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const mouse = useMousePosition();
  const [subtitleVisible, setSubtitleVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSubtitleVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

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

      {/* Animated grid mesh */}
      <div className="animated-mesh" />

      {/* Dot grid */}
      <div className="dot-grid" />

      {/* Floating glow orbs - bigger, more visible */}
      <div
        className="float-1 pointer-events-none absolute -right-20 -top-20 h-[600px] w-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(252,211,77,0.18), transparent 65%)",
        }}
      />
      <div
        className="float-2 pointer-events-none absolute -bottom-32 -left-32 h-[700px] w-[700px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(245,158,11,0.14), transparent 65%)",
        }}
      />
      <div
        className="float-3 pointer-events-none absolute left-1/3 top-1/4 h-[400px] w-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(252,211,77,0.12), transparent 65%)",
        }}
      />
      <div
        className="float-4 pointer-events-none absolute right-1/4 bottom-1/4 h-[350px] w-[350px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(252,211,77,0.1), transparent 65%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-right">
            <div className="mb-8 inline-block rounded-full border border-[rgba(252,211,77,0.25)] bg-[rgba(252,211,77,0.06)] px-6 py-2.5 backdrop-blur-sm">
              <span className="text-sm font-medium text-[#FCD34D] sm:text-base">
                14 יום ניסיון חינם
              </span>
            </div>

            <h1 className="gradient-text-animated mb-8 text-6xl font-black leading-[1.1] sm:text-7xl md:text-8xl lg:text-9xl">
              המערכת
              <br />
              שתנהל לך
              <br />
              את התורים
            </h1>

            <div
              className={`mx-auto mb-12 max-w-2xl transition-all duration-1000 lg:mx-0 ${
                subtitleVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <p className="text-lg leading-relaxed text-[#9CA3AF] sm:text-xl md:text-2xl">
                קביעת תורים, ניהול לקוחות, תשלומים ועוד - הכל במקום אחד.
                <br className="hidden sm:block" />
                בלי אפליקציה, בלי התקנה.
              </p>
            </div>

            <div className="flex flex-col items-center gap-5 lg:items-start">
              <a
                href="#cta"
                className="btn-gold pulse-gold px-10 py-4 text-lg font-bold sm:px-14 sm:py-5 sm:text-xl"
              >
                התחילו תקופת ניסיון חינם
              </a>
              <p className="text-sm text-[#9CA3AF]">
                ללא כרטיס אשראי. ללא התחייבות.
              </p>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="hidden flex-shrink-0 lg:block">
            <PhoneMockup />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 flex justify-center scroll-indicator-bounce">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-7 rounded-full border-2 border-[rgba(252,211,77,0.3)] flex items-start justify-center p-1.5">
              <div
                className="h-2.5 w-2 rounded-full bg-[#FCD34D]"
                style={{ animation: "float 2s ease-in-out infinite" }}
              />
            </div>
            <svg
              className="h-4 w-4 text-[rgba(252,211,77,0.4)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7"
              />
            </svg>
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
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
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
        transition:
          "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, box-shadow 0.4s ease",
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
        <div className="fade-section mb-20 text-center">
          <h2 className="gold-text-glow mb-6 text-3xl font-bold text-[#FCD34D] sm:text-4xl md:text-5xl lg:text-6xl">
            למה יסמין תור?
          </h2>
          <p className="mx-auto max-w-lg text-lg text-[#9CA3AF]">
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
                {/* Sparkles inside card */}
                <div
                  className="card-sparkle"
                  style={{
                    top: "20%",
                    right: "15%",
                    animationDelay: `${index * 0.7}s`,
                  }}
                />
                <div
                  className="card-sparkle"
                  style={{
                    top: "60%",
                    right: "80%",
                    animationDelay: `${index * 0.7 + 1.5}s`,
                  }}
                />
                <div
                  className="card-sparkle"
                  style={{
                    top: "40%",
                    right: "50%",
                    animationDelay: `${index * 0.7 + 0.8}s`,
                  }}
                />

                {/* Icon with glow */}
                <div className="icon-glow-circle mb-6 text-5xl">
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-xl font-bold text-white sm:text-2xl">
                  {feature.title}
                </h3>
                <p className="text-base leading-relaxed text-[#9CA3AF] sm:text-lg">
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
      <div className="mx-auto max-w-5xl" ref={sectionRef}>
        <div className="fade-section mb-20 text-center">
          <h2 className="gold-text-glow mb-6 text-3xl font-bold text-[#FCD34D] sm:text-4xl md:text-5xl lg:text-6xl">
            איך זה עובד?
          </h2>
          <p className="mx-auto max-w-lg text-lg text-[#9CA3AF]">
            שלושה צעדים פשוטים ואתם בפנים
          </p>
        </div>

        <div className="relative flex flex-col gap-16 md:flex-row md:items-start md:justify-between md:gap-8">
          {/* Connecting line (desktop) */}
          <div className="absolute left-0 right-0 top-10 hidden overflow-hidden md:block">
            <div
              className={lineVisible ? "step-line-animated" : ""}
              style={{
                background: lineVisible
                  ? "linear-gradient(to left, transparent, rgba(252,211,77,0.4), transparent)"
                  : "transparent",
                height: "2px",
                width: lineVisible ? "100%" : "0%",
                transition: "width 1.8s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </div>

          {steps.map((step, index) => (
            <div
              key={index}
              className={`fade-section step-glow-bg relative flex flex-1 flex-col items-center text-center stagger-${
                index + 1
              }`}
            >
              <div className="step-number relative z-10 mb-8 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#FCD34D] bg-[#050505] text-3xl font-black text-[#FCD34D]">
                {step.number}
              </div>
              <h3 className="mb-4 text-xl font-bold text-white sm:text-2xl">
                {step.title}
              </h3>
              <p className="max-w-xs text-base leading-relaxed text-[#9CA3AF] sm:text-lg">
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
  const [checksVisible, setChecksVisible] = useState(false);
  const priceRef = useRef<HTMLDivElement>(null);
  const displayPrice = useCountUp(50, 1500, countStarted);

  useEffect(() => {
    const node = priceRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCountStarted(true);
          setTimeout(() => setChecksVisible(true), 600);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" className="relative px-4 py-24 sm:py-32">
      <div className="section-divider mb-24" />

      {/* Radial gold bg */}
      <div className="pricing-radial-bg pointer-events-none absolute inset-0" />

      <div className="mx-auto max-w-xl">
        <div className="fade-section mb-20 text-center">
          <h2 className="gold-text-glow mb-6 text-3xl font-bold text-[#FCD34D] sm:text-4xl md:text-5xl lg:text-6xl">
            מחירון
          </h2>
          <p className="mx-auto max-w-lg text-lg text-[#9CA3AF]">
            מחיר אחד פשוט. בלי הפתעות.
          </p>
        </div>

        <div className="fade-section relative" ref={priceRef}>
          {/* Recommended badge */}
          <div className="absolute -top-4 left-1/2 z-20 -translate-x-1/2">
            <div className="badge-glow rounded-full bg-gradient-to-l from-[#FCD34D] to-[#F59E0B] px-6 py-1.5 text-sm font-bold text-[#050505]">
              מומלץ
            </div>
          </div>

          <div className="glow-border-card p-8 text-center sm:p-12">
            <div className="relative z-10">
              <div className="price-tag-float mb-4 inline-block">
                <div className="price-counter text-6xl font-black text-[#FCD34D] sm:text-8xl">
                  {displayPrice}&#8362;
                </div>
              </div>
              <div className="mb-2 text-2xl font-bold text-[#9CA3AF] sm:text-3xl">
                לחודש
              </div>
              <p className="mb-10 text-lg text-[#9CA3AF]">
                הכל כלול. בלי הפתעות.
              </p>

              <ul className="mb-10 space-y-4 text-right">
                {pricingFeatures.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3"
                    style={{
                      opacity: checksVisible ? 1 : 0,
                      transform: checksVisible
                        ? "translateX(0)"
                        : "translateX(10px)",
                      transition: `opacity 0.5s ease ${
                        index * 0.1
                      }s, transform 0.5s ease ${index * 0.1}s`,
                    }}
                  >
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(252,211,77,0.12)] border border-[rgba(252,211,77,0.2)]">
                      <svg
                        className="h-3.5 w-3.5 text-[#FCD34D]"
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
                    <span className="text-lg text-gray-200">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#cta"
                className="btn-gold inline-block px-10 py-4 text-lg font-bold sm:px-12 sm:py-5 sm:text-xl"
              >
                התחילו 14 יום חינם
              </a>
              <p className="mt-5 text-sm text-[#9CA3AF]">
                ללא כרטיס אשראי. ללא התחייבות.
              </p>
            </div>
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
        <div className="fade-section mb-20 text-center">
          <h2 className="gold-text-glow mb-6 text-3xl font-bold text-[#FCD34D] sm:text-4xl md:text-5xl lg:text-6xl">
            שאלות נפוצות
          </h2>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className={`fade-section faq-item stagger-${index + 1} ${
                openIndex === index ? "faq-item-open" : ""
              }`}
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="flex w-full items-center justify-between p-5 sm:p-6 text-right"
              >
                <span className="text-lg font-semibold text-white sm:text-xl">
                  {item.question}
                </span>
                <svg
                  className={`h-5 w-5 flex-shrink-0 text-[#FCD34D] transition-transform duration-500 ${
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
                style={{
                  display: "grid",
                  gridTemplateRows: openIndex === index ? "1fr" : "0fr",
                  opacity: openIndex === index ? 1 : 0,
                  transition:
                    "grid-template-rows 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease",
                }}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 sm:px-6 sm:pb-6 text-base leading-relaxed text-[#9CA3AF] sm:text-lg">
                    {item.answer}
                  </p>
                </div>
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
      className="relative overflow-hidden px-4 py-32 sm:py-40"
    >
      <div className="section-divider mb-24" />

      {/* Full CTA gradient background */}
      <div className="cta-gradient-bg pointer-events-none absolute inset-0" />

      {/* Extra floating orbs for density */}
      <div
        className="float-1 pointer-events-none absolute left-1/4 top-1/3 h-[500px] w-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(252,211,77,0.12), transparent 65%)",
        }}
      />
      <div
        className="float-2 pointer-events-none absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(252,211,77,0.1), transparent 65%)",
        }}
      />
      <div
        className="float-3 pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(252,211,77,0.15), transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="fade-section">
          <h2 className="gradient-text-animated mb-8 text-4xl font-black sm:text-5xl md:text-6xl lg:text-7xl">
            מוכנים להתחיל?
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-lg leading-relaxed text-[#9CA3AF] sm:text-xl md:text-2xl">
            הצטרפו לבעלי העסקים שכבר חוסכים שעות של ניהול תורים
          </p>
          <a
            href="#"
            className="btn-gold cta-pulse inline-block px-14 py-6 text-xl font-bold sm:text-2xl"
          >
            התחילו תקופת ניסיון חינם
          </a>
          <p className="mt-6 text-base text-[#9CA3AF]">
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
          <span
            className="text-xl font-bold gradient-text-animated"
            style={{ WebkitTextFillColor: "transparent" }}
          >
            יסמין תור
          </span>
          <div className="flex gap-6 text-sm text-[#9CA3AF]">
            <a
              href="#"
              className="transition-colors duration-300 hover:text-[#FCD34D]"
            >
              תנאי שימוש
            </a>
            <a
              href="#"
              className="transition-colors duration-300 hover:text-[#FCD34D]"
            >
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
      <CustomCursor />
      <div className="noise-overlay" />
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
