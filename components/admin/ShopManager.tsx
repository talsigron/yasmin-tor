'use client';

import { useState, useEffect } from 'react';
import { ShopItem } from '@/lib/types';
import { useTenant } from '@/contexts/TenantContext';
import { fetchShopItems, createShopItem, updateShopItem, deleteShopItem } from '@/lib/supabase-store';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

export default function ShopManager() {
  const { supabase, config } = useTenant();
  const { businessId } = config;
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setItems(await fetchShopItems(supabase, businessId)); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function save() {
    if (!form.name) return;
    try {
      const d = { name: form.name, description: form.description || undefined, price: form.price ? Number(form.price) : undefined, isActive: true, displayOrder: items.length };
      if (editingItem) await updateShopItem(supabase, editingItem.id, d);
      else await createShopItem(supabase, businessId, d);
      setShowForm(false); setEditingItem(null); setForm({ name: '', description: '', price: '' }); load();
    } catch (e) { console.error(e); }
  }

  if (loading) return <div className="flex justify-center py-8"><div className="w-5 h-5 rounded-full border-2 border-gray-200 animate-spin border-t-indigo-500" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-gray-800">פריטי תפריט</p>
          <p className="text-xs text-gray-500 mt-0.5">יוצגו בדף הבית מתחת לאימונים</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingItem(null); setForm({ name: '', description: '', price: '' }); }}
          className="flex items-center gap-1 px-3 py-2 bg-indigo-500 text-white rounded-xl text-xs font-medium cursor-pointer">
          <Plus size={13} /> הוסף
        </button>
      </div>

      {showForm && (
        <div className="bg-indigo-50 rounded-xl p-4 space-y-2.5 border border-indigo-100">
          <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
            placeholder="שם הפריט" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm" />
          <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
            placeholder="תיאור (אופציונלי)" rows={2} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm resize-none" />
          <input type="number" value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))}
            placeholder="מחיר ₪ (אופציונלי)" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm" />
          <div className="flex gap-2">
            <button onClick={save} className="flex-1 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium cursor-pointer">שמור</button>
            <button onClick={() => { setShowForm(false); setEditingItem(null); }} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium cursor-pointer">ביטול</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.length === 0 && <p className="text-center text-gray-400 text-sm py-6">אין פריטים עדיין</p>}
        {items.map(item => (
          <div key={item.id} className={`bg-white border rounded-xl p-3 flex items-center gap-3 transition-opacity ${item.isActive ? 'border-gray-100' : 'border-gray-100 opacity-50'}`}>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 text-sm">{item.name}</p>
              {item.description && <p className="text-xs text-gray-500 truncate">{item.description}</p>}
              {item.price !== undefined && item.price !== null && <p className="text-sm font-bold text-indigo-600 mt-0.5">₪{item.price}</p>}
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => updateShopItem(supabase, item.id, { isActive: !item.isActive }).then(load)}
                className="p-1.5 text-gray-400 hover:text-indigo-500 cursor-pointer">
                {item.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
              <button onClick={() => { setEditingItem(item); setForm({ name: item.name, description: item.description||'', price: item.price?.toString()||'' }); setShowForm(true); }}
                className="p-1.5 text-gray-400 hover:text-indigo-500 cursor-pointer"><Edit2 size={13} /></button>
              <button onClick={() => { if (confirm('למחוק?')) deleteShopItem(supabase, item.id).then(load); }}
                className="p-1.5 text-gray-400 hover:text-red-400 cursor-pointer"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
