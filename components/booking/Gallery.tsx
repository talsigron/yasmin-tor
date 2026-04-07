'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface GalleryProps {
  images: string[];
}

export default function Gallery({ images }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const closeImage = useCallback(() => setSelectedIndex(null), []);

  const goNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % images.length);
  }, [selectedIndex, images.length]);

  const goPrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
  }, [selectedIndex, images.length]);

  // Keyboard listener
  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeImage();
      else if (e.key === 'ArrowLeft') goNext();
      else if (e.key === 'ArrowRight') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIndex, closeImage, goNext, goPrev]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      // RTL: swipe left = next, swipe right = prev
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  if (images.length === 0) return null;

  const openImage = (index: number) => setSelectedIndex(index);

  return (
    <>
      <div
        className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar snap-x snap-mandatory justify-center"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => openImage(i)}
            className="shrink-0 snap-center cursor-pointer group flex flex-col items-center gap-1"
          >
            <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-br from-mint-300 via-mint-400 to-mint-500">
              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                <img
                  src={src}
                  alt={`עבודה ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
            </div>
          </button>
        ))}
      </div>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center animate-fade-in"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={closeImage}
            className="absolute top-4 left-4 p-4 text-white/70 hover:text-white transition-colors cursor-pointer z-10"
          >
            <X size={28} />
          </button>

          <button
            onClick={goPrev}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight size={32} />
          </button>

          <button
            onClick={goNext}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft size={32} />
          </button>

          <img
            src={images[selectedIndex]}
            alt={`עבודה ${selectedIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg animate-scale-in"
          />

          <div className="absolute bottom-4 text-white/50 text-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
