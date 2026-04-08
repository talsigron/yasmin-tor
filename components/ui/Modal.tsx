'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // Reset expanded when modal closes
  useEffect(() => {
    if (!isOpen) setExpanded(false);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Lift modal above keyboard on iOS
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;
    const viewport = window.visualViewport;
    if (!viewport) return;
    const handleViewport = () => {
      const offset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      setKeyboardOffset(offset);
    };
    viewport.addEventListener('resize', handleViewport);
    viewport.addEventListener('scroll', handleViewport);
    return () => {
      viewport.removeEventListener('resize', handleViewport);
      viewport.removeEventListener('scroll', handleViewport);
      setKeyboardOffset(0);
    };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const panel = panelRef.current;
    if (!panel) return;
    // Allow drag from top (to expand) or when at scroll top (to close/collapse)
    if (panel.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
    }
  }, []);

  const expandedRef = useRef(false);
  useEffect(() => { expandedRef.current = expanded; }, [expanded]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const panel = panelRef.current;
    if (!panel) return;
    currentY.current = e.touches[0].clientY - startY.current;

    if (currentY.current < -40 && !expandedRef.current) {
      // Swiping up — expand to full screen
      setExpanded(true);
      isDragging.current = false;
      currentY.current = 0;
      panel.style.transform = '';
      return;
    }

    if (currentY.current > 0) {
      panel.style.transform = `translateY(${currentY.current}px)`;
      panel.style.transition = 'none';
    } else {
      panel.style.transform = '';
      panel.style.transition = '';
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const panel = panelRef.current;
    if (!panel) return;

    if (currentY.current > 80) {
      if (expandedRef.current) {
        // Collapse back to partial
        setExpanded(false);
        panel.style.transform = '';
        panel.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
      } else {
        // Close
        panel.style.transform = `translateY(100%)`;
        panel.style.transition = 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)';
        setTimeout(onClose, 400);
      }
    } else {
      panel.style.transform = '';
      panel.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
    }
    currentY.current = 0;
  }, [onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full mx-4',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-[padding] duration-200"
      style={{ paddingBottom: keyboardOffset }}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          'relative w-full bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up',
          'flex flex-col transition-[max-height] duration-300',
          expanded ? 'max-h-[96vh]' : 'max-h-[85vh]',
          sizes[size]
        )}
      >
        {/* Swipe handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        {title && (
          <div className="bg-white/95 backdrop-blur-sm px-6 py-4 border-b border-gray-100 rounded-t-3xl flex items-center justify-between shrink-0">
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4">{children}</div>
        {footer && <div className="shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
