'use client';

import { useState } from 'react';
import { useServices } from '@/hooks/useSupabase';
import { Service } from '@/lib/types';
import { formatPrice, formatDuration, cn } from '@/lib/utils';
import {
  Plus,
  Edit3,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  Check,
  Clock,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

export default function ServicesManager() {
  const { services, loading, add, update, remove, reorder } = useServices();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleSave = async (data: {
    name: string;
    price: number;
    duration: number;
    description: string;
  }) => {
    try {
      if (editingService) {
        await update(editingService.id, data);
      } else {
        await add({ ...data, active: true });
      }
      setEditingService(null);
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to save service:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('למחוק שירות זה?')) {
      try {
        await remove(id);
      } catch (err) {
        console.error('Failed to delete service:', err);
      }
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await update(id, { active: !active });
    } catch (err) {
      console.error('Failed to toggle service:', err);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newServices = [...services];
    [newServices[index - 1], newServices[index]] = [newServices[index], newServices[index - 1]];
    const ordered = newServices.map((s, i) => ({ id: s.id, order: i + 1 }));
    try {
      await reorder(ordered);
    } catch (err) {
      console.error('Failed to reorder:', err);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === services.length - 1) return;
    const newServices = [...services];
    [newServices[index], newServices[index + 1]] = [newServices[index + 1], newServices[index]];
    const ordered = newServices.map((s, i) => ({ id: s.id, order: i + 1 }));
    try {
      await reorder(ordered);
    } catch (err) {
      console.error('Failed to reorder:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 rounded-full border-3 border-mint-200 border-t-mint-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">שירותים</h2>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={16} />}
          onClick={() => setIsAdding(true)}
        >
          הוספה
        </Button>
      </div>

      <div className="space-y-2">
        {services.map((service, index) => (
          <div
            key={service.id}
            className={cn(
              'bg-white rounded-xl border border-gray-100 p-4 transition-all',
              !service.active && 'opacity-60'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              {/* Move up/down buttons */}
              <div className="flex flex-col gap-0.5 shrink-0 pt-1">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className={cn(
                    'p-1 rounded transition-colors cursor-pointer',
                    index === 0 ? 'text-gray-200' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  )}
                  title="הזז למעלה"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === services.length - 1}
                  className={cn(
                    'p-1 rounded transition-colors cursor-pointer',
                    index === services.length - 1 ? 'text-gray-200' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  )}
                  title="הזז למטה"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-800 text-sm">
                    {service.name}
                  </h3>
                  {!service.active && (
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      מוסתר
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2">{service.description}</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-mint-600">
                    {formatPrice(service.price)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={11} />
                    {formatDuration(service.duration)}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => handleToggleActive(service.id, service.active)}
                  className={cn(
                    'p-2 rounded-lg transition-colors cursor-pointer',
                    service.active
                      ? 'text-mint-500 bg-mint-50 hover:bg-mint-100'
                      : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                  )}
                  title={service.active ? 'הסתר' : 'הצג'}
                >
                  {service.active ? <Check size={14} /> : <X size={14} />}
                </button>
                <button
                  onClick={() => setEditingService(service)}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAdding || !!editingService}
        onClose={() => {
          setIsAdding(false);
          setEditingService(null);
        }}
        title={editingService ? 'עריכת שירות' : 'שירות חדש'}
      >
        <ServiceForm
          service={editingService}
          onSave={handleSave}
          onCancel={() => {
            setIsAdding(false);
            setEditingService(null);
          }}
        />
      </Modal>
    </div>
  );
}

function ServiceForm({
  service,
  onSave,
  onCancel,
}: {
  service: Service | null;
  onSave: (data: {
    name: string;
    price: number;
    duration: number;
    description: string;
  }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(service?.name || '');
  const [price, setPrice] = useState(service?.price?.toString() || '');
  const [duration, setDuration] = useState(service?.duration?.toString() || '45');
  const [description, setDescription] = useState(service?.description || '');

  const [priceError, setPriceError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price === '' || !duration) return;
    const priceNum = parseInt(price);
    if (priceNum < 0) {
      setPriceError('מחיר לא יכול להיות שלילי 🙅‍♀️');
      return;
    }
    setPriceError('');
    onSave({
      name: name.trim(),
      price: priceNum,
      duration: parseInt(duration),
      description: description.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="שם השירות"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="לדוגמה: מניקור ג'ל"
        autoFocus
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="מחיר (₪)"
          type="number"
          value={price}
          onChange={(e) => { setPrice(e.target.value); setPriceError(''); }}
          placeholder="120"
          dir="ltr"
          error={priceError}
        />
        <Input
          label="משך (דקות)"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="60"
          dir="ltr"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          תיאור
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="תיאור קצר של השירות"
          rows={2}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-mint-400 focus:ring-4 focus:ring-mint-100 focus:outline-none transition-all duration-200 placeholder:text-gray-400 resize-none"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          ביטול
        </Button>
        <Button type="submit" variant="primary" className="flex-1">
          {service ? 'עדכון' : 'הוספה'}
        </Button>
      </div>
    </form>
  );
}
