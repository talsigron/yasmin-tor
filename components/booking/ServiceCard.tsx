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
  wide?: boolean;
}

export default function ServiceCard({ service, onBook, delay = 0, brandColor, wide = false }: ServiceCardProps) {
  const { config: { features, labels, id: tenantId, defaultColors } } = useTenant();
  const shouldShowPrice = service.showPrice ?? features.showPrice;
  const shouldShowDuration = service.showDuration ?? features.showDuration;

  return (
    <div
      className={`group bg-white rounded-2xl border border-gray-100 ${wide ? 'p-6' : 'p-4'} hover:border-mint-200 transition-all duration-300 animate-fade-in flex flex-col justify-between`}
      style={{
        animationDelay: `${delay}ms`,
        boxShadow: '0 0 12px rgba(110, 231, 183, 0.15)',
      }}
    >
      <div>
        <div className={`flex items-center gap-2 ${wide ? 'mb-2 justify-center' : 'mb-1.5'}`}>
          {tenantId === 'studio180'
            ? <Dumbbell size={wide ? 20 : 14} className="shrink-0" style={{ color: defaultColors.primary }} />
            : <Sparkles size={wide ? 20 : 14} className="text-mint-400 shrink-0" />
          }
          <h3 className={`font-bold text-gray-800 ${wide ? 'text-xl' : 'text-sm truncate'}`}>
            {service.name}
          </h3>
        </div>
        <p className={`text-gray-500 leading-relaxed ${wide ? 'text-sm mb-5 text-center' : 'text-xs line-clamp-2 mb-3'}`}>
          {service.description}
        </p>
      </div>
      <div>
        {(shouldShowPrice || shouldShowDuration) && (
          <div className={`flex items-center mb-3 ${wide ? 'justify-center gap-6' : 'justify-between mb-2'}`}>
            {shouldShowPrice && (
              <span className={`font-bold text-mint-600 ${wide ? 'text-2xl' : 'text-base'}`} style={brandColor ? { color: brandColor } : undefined}>
                {formatPrice(service.price)}
              </span>
            )}
            {shouldShowDuration && (
              <span className={`flex items-center gap-1 text-gray-500 ${wide ? 'text-sm' : 'text-[10px]'}`}>
                <Clock size={wide ? 14 : 10} />
                {formatDuration(service.duration)}
              </span>
            )}
          </div>
        )}
        <Button
          variant="primary"
          size={wide ? 'md' : 'sm'}
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
