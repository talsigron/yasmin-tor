'use client';

import { useState, useEffect } from 'react';
import { ShopItem } from '@/lib/types';
import { useTenant } from '@/contexts/TenantContext';
import { fetchShopItems } from '@/lib/supabase-store';
import { ShoppingBag } from 'lucide-react';

export default function ShopSection({ brandPrimary }: { brandPrimary: string }) {
  const { supabase, config } = useTenant();
  const [items, setItems] = useState<ShopItem[]>([]);

  const [error, setError] = useState('');

  useEffect(() => {
    fetchShopItems(supabase, config.businessId)
      .then(all => setItems(all.filter(i => i.isActive)))
      .catch((e) => { console.error('ShopSection fetch error:', e); setError(e?.message || 'שגיאה'); });
  }, []);

  if (error) return <section className="max-w-3xl mx-auto px-5 mt-8"><p className="text-xs text-red-400">שגיאה בטעינת החנות: {error}</p></section>;
  if (items.length === 0) return null;

  return (
    <section className="max-w-3xl mx-auto px-5 mt-8">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag size={18} style={{ color: brandPrimary }} />
        <h2 className="text-xl font-extrabold text-gray-800">חנות</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map(item => (
          <div key={item.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="w-full h-36 object-cover" />
            ) : (
              <div className="w-full h-36 bg-gray-100 flex items-center justify-center">
                <span className="text-3xl">🛍️</span>
              </div>
            )}
            <div className="p-3 flex-1 flex flex-col">
              <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
              {item.description && <p className="text-xs text-gray-500 mt-0.5 flex-1">{item.description}</p>}
              {item.price !== undefined && item.price !== null && (
                <span className="font-bold text-sm mt-2 block" style={{ color: brandPrimary }}>₪{item.price}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
