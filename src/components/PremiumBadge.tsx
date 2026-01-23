import { Crown } from 'lucide-react';

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function PremiumBadge({ size = 'md', onClick }: PremiumBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const isClickable = !!onClick;

  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full font-semibold ${sizeClasses[size]} ${
        isClickable ? 'cursor-pointer hover:from-yellow-500 hover:to-yellow-700 transition-all hover:scale-105 shadow-lg shadow-yellow-500/30' : ''
      }`}
    >
      <Crown className={iconSizes[size]} />
      Premium
    </button>
  );
}
