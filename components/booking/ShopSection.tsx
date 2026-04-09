'use client';

import { useState, useEffect } from 'react';
import { ShopItem } from '@/lib/types';
import { useTenant } from '@/contexts/TenantContext';
import { fetchShopItems } from '@/lib/supabase-store';
import { ShoppingBag } from 'lucide-react';

export default function ShopSection({ brandPrimary }: { brandPrimary: string }) {
  const { supabase, config } = useTenant();
  const [items, setItems] = useState<ShopItem[]>([]);

  useEffect(() => {
    fetchShopItems(supabase, config.businessId)
      .then(all => setItems(all.filter(i => i.isActive)))
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="max-w-3xl mx-auto px-5 mt-8">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag size={18} style={{ color: brandPrimary }} />
        <h2 className="text-xl font-extrabold text-gray-800">חנות</h2>
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
            <div>
              <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
              {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
            </div>
            {item.price !== undefined && item.price !== null && (
              <span className="font-bold text-sm" style={{ color: brandPrimary }}>₪{item.price}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
