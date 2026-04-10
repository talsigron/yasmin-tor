'use client';

import { useTenant } from '@/contexts/TenantContext';
import { useProfile } from '@/hooks/useSupabase';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  const { config } = useTenant();
  const { profile } = useProfile();
  const businessName = profile?.name || config.slug;
  const brandPrimary = config.defaultColors.primary;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href={`/${config.slug}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ChevronRight size={16} />
          חזרה ל{businessName}
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h1 className="text-xl font-bold text-gray-800" style={{ color: brandPrimary }}>
            מדיניות פרטיות
          </h1>
          <p className="text-sm text-gray-500">{businessName}</p>

          <Section title="1. כללי">
            <p>
              {businessName} מכבד/ת את פרטיות המשתמשים באתר. מדיניות פרטיות זו מפרטת כיצד נאסף, נשמר ונשתמש במידע אישי שנמסר באמצעות האתר.
            </p>
          </Section>

          <Section title="2. מידע שנאסף">
            <p>במסגרת ההרשמה לשירותים, נאסף המידע הבא:</p>
            <ul className="list-disc pr-5 space-y-1 mt-2">
              <li>שם מלא</li>
              <li>מספר טלפון</li>
              <li>כתובת דואר אלקטרוני</li>
              <li>תאריך לידה</li>
              <li>מין</li>
              <li>מספר תעודת זהות (במידה ונדרש)</li>
              <li>אמצעי תשלום מועדף</li>
              <li>הצהרת בריאות (במידה ונדרש)</li>
            </ul>
          </Section>

          <Section title="3. מטרות השימוש במידע">
            <ul className="list-disc pr-5 space-y-1">
              <li>ניהול תורים וקביעת מועדים</li>
              <li>יצירת קשר בנוגע לשירותים</li>
              <li>שליחת תזכורות ועדכונים (בהסכמה)</li>
              <li>ניהול חשבון ותשלומים</li>
              <li>שיפור השירות</li>
            </ul>
          </Section>

          <Section title="4. שמירה ואבטחת המידע">
            <p>
              המידע נשמר במערכות מאובטחות (Supabase) עם הצפנה. הגישה למידע מוגבלת לבעל/ת העסק בלבד. לא נעביר מידע אישי לצדדים שלישיים ללא הסכמה מפורשת, אלא אם נדרש על פי חוק.
            </p>
          </Section>

          <Section title="5. זכויות המשתמש">
            <p>כל משתמש רשאי:</p>
            <ul className="list-disc pr-5 space-y-1 mt-2">
              <li>לבקש לעיין במידע הנשמר עליו</li>
              <li>לבקש לתקן מידע שגוי</li>
              <li>לבקש למחוק את המידע שלו</li>
              <li>לבטל הסכמה לקבלת עדכונים</li>
            </ul>
            <p className="mt-2">
              לכל בקשה ניתן לפנות ישירות ל{businessName} באמצעות הטלפון או הוואטסאפ המופיעים באתר.
            </p>
          </Section>

          <Section title="6. עוגיות (Cookies)">
            <p>
              האתר עשוי להשתמש באחסון מקומי (localStorage) לצורך שמירת העדפות והגדרות. לא נעשה שימוש בעוגיות מעקב של צדדים שלישיים.
            </p>
          </Section>

          <Section title="7. שינויים במדיניות">
            <p>
              {businessName} שומר/ת לעצמו/ה את הזכות לעדכן מדיניות זו מעת לעת. שינויים יפורסמו באתר.
            </p>
          </Section>

          <div className="pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">
            עודכן לאחרונה: אפריל 2026
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-bold text-gray-700">{title}</h2>
      <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
    </div>
  );
}
