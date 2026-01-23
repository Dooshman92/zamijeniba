import { Zap } from 'lucide-react';

interface FeaturedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function FeaturedBadge({ size = 'md', onClick }: FeaturedBadgeProps) {
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
      className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold ${sizeClasses[size]} ${
        isClickable ? 'cursor-pointer hover:from-orange-600 hover:to-red-600 transition-all hover:scale-105 shadow-lg shadow-orange-500/30' : ''
      }`}
    >
      <Zap className={iconSizes[size]} />
      Istaknut
    </button>
  );
}
