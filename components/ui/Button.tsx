'use client';

import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  brandColor?: string;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  brandColor,
  children,
  className,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-medium rounded-2xl transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary:
      'bg-mint-500 text-white hover:bg-mint-600 shadow-lg shadow-mint-500/25 hover:shadow-mint-500/40',
    secondary:
      'bg-mint-50 text-mint-700 hover:bg-mint-100',
    outline:
      'border-2 border-mint-200 text-mint-700 hover:bg-mint-50 hover:border-mint-300',
    ghost:
      'text-gray-600 hover:bg-gray-100 hover:text-gray-800',
    danger:
      'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const brandStyle: React.CSSProperties = brandColor && variant === 'primary'
    ? { backgroundColor: brandColor, boxShadow: `0 10px 15px -3px ${brandColor}40`, ...style }
    : style || {};

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      style={Object.keys(brandStyle).length > 0 ? brandStyle : undefined}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}
