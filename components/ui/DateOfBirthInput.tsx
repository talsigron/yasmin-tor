'use client';

import { useState, useEffect, useRef } from 'react';

interface Props {
  value: string; // YYYY-MM-DD or empty
  onChange: (value: string) => void;
  label?: string;
}

export default function DateOfBirthInput({ value, onChange, label }: Props) {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1].replace(/^0/, ''));
        setDay(parts[2].replace(/^0/, ''));
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const emitChange = (d: string, m: string, y: string) => {
    if (d && m && y && y.length === 4) {
      const dd = d.padStart(2, '0');
      const mm = m.padStart(2, '0');
      onChange(`${y}-${mm}-${dd}`);
    } else if (!d && !m && !y) {
      onChange('');
    }
  };

  const handleDay = (val: string) => {
    const num = val.replace(/\D/g, '').slice(0, 2);
    setDay(num);
    if (num.length === 2 || (num.length === 1 && parseInt(num) > 3)) {
      monthRef.current?.focus();
    }
    emitChange(num, month, year);
  };

  const handleMonth = (val: string) => {
    const num = val.replace(/\D/g, '').slice(0, 2);
    setMonth(num);
    if (num.length === 2 || (num.length === 1 && parseInt(num) > 1)) {
      yearRef.current?.focus();
    }
    emitChange(day, num, year);
  };

  const handleYear = (val: string) => {
    const num = val.replace(/\D/g, '').slice(0, 4);
    setYear(num);
    emitChange(day, month, num);
  };

  const inputClass = 'w-full text-center px-1 py-2.5 rounded-xl border-2 border-gray-200 bg-white focus:border-mint-400 focus:ring-4 focus:ring-mint-100 focus:outline-none transition-all text-sm';

  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      <div className="flex items-center gap-1.5" dir="ltr">
        <div className="flex-1">
          <input
            type="text"
            inputMode="numeric"
            placeholder="יום"
            value={day}
            onChange={(e) => handleDay(e.target.value)}
            className={inputClass}
          />
        </div>
        <span className="text-gray-400 text-sm">/</span>
        <div className="flex-1">
          <input
            ref={monthRef}
            type="text"
            inputMode="numeric"
            placeholder="חודש"
            value={month}
            onChange={(e) => handleMonth(e.target.value)}
            className={inputClass}
          />
        </div>
        <span className="text-gray-400 text-sm">/</span>
        <div className="flex-[1.3]">
          <input
            ref={yearRef}
            type="text"
            inputMode="numeric"
            placeholder="שנה"
            value={year}
            onChange={(e) => handleYear(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
