'use client';

interface VerifiedBadgeProps {
  isVerified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  tooltipText?: string;
}

const sizeStyles = {
  sm: 'w-4 h-4 text-xs',
  md: 'w-5 h-5 text-sm',
  lg: 'w-6 h-6 text-base',
};

export function VerifiedBadge({
  isVerified = false,
  size = 'md',
  tooltipText = 'Verified Creator',
}: VerifiedBadgeProps) {
  if (!isVerified) {
    return null;
  }

  return (
    <div
      title={tooltipText}
      className={`inline-flex items-center justify-center ${sizeStyles[size]} bg-violet-600 rounded-full text-white font-bold hover:bg-violet-500 transition-colors`}
    >
      ✓
    </div>
  );
}
