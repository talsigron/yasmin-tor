'use client';

import { Service } from '@/lib/types';
import { useTenant } from '@/contexts/TenantContext';
import { formatPrice, formatDuration } from '@/lib/utils';
import { Clock, Sparkles, Dumbbell } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ServiceCardProps {
  service: Service;
  onBook: (service: Service) => void;
  delay?: number;
  brandColor?: string;
}

export default function ServiceCard({ service, onBook, delay = 0, brandColor }: ServiceCardProps) {
  const { config: { features, labels, id: tenantId, defaultColors } } = useTenant();
  const shouldShowPrice = service.showPrice ?? features.showPrice;
  const shouldShowDuration = service.showDuration ?? features.showDuration;

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 p-4 hover:border-mint-200 transition-all duration-300 animate-fade-in flex flex-col justify-between"
      style={{
        animationDelay: `${delay}ms`,
        boxShadow: '0 0 12px rgba(110, 231, 183, 0.15)',
      }}
    >
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          {tenantId === 'studio180'
            ? <Dumbbell size={14} className="shrink-0" style={{ color: defaultColors.primary }} />
            : <Sparkles size={14} className="text-mint-400 shrink-0" />
          }
          <h3 className="font-bold text-gray-800 text-sm truncate">
            {service.name}
          </h3>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {service.description}
        </p>
      </div>
      <div>
        {(shouldShowPrice || shouldShowDuration) && (
          <div className="flex items-center justify-between mb-2">
            {shouldShowPrice && (
              <span className="text-base font-bold text-mint-600" style={brandColor ? { color: brandColor } : undefined}>
                {formatPrice(service.price)}
              </span>
            )}
            {shouldShowDuration && (
              <span className="flex items-center gap-1 text-[10px] text-gray-500">
                <Clock size={10} />
                {formatDuration(service.duration)}
              </span>
            )}
          </div>
        )}
        <Button
          variant="primary"
          size="sm"
          onClick={() => onBook(service)}
          className="w-full"
          brandColor={brandColor}
        >
          {labels.makeBooking}
        </Button>
      </div>
    </div>
  );
}
