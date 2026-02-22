import { Award, Medal, Shield } from 'lucide-react';

interface UserBadgeProps {
  averageRating: number | null;
  reviewCount: number;
  size?: 'sm' | 'md' | 'lg';
}

export function UserBadge({ averageRating, reviewCount, size = 'md' }: UserBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSize = sizeClasses[size];

  if (reviewCount === 0 || averageRating === null) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-600/30 border border-gray-500/30"
        title="Nema recenzija"
      >
        <Shield className={`${iconSize} text-gray-400`} />
        <span className="text-xs font-medium text-gray-400">Novi</span>
      </span>
    );
  }

  if (averageRating >= 4.5) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-600/30 to-yellow-500/30 border border-yellow-500/50"
        title={`Zlatna znaka - ${averageRating.toFixed(1)} ⭐ (${reviewCount} ${reviewCount === 1 ? 'recenzija' : reviewCount < 5 ? 'recenzije' : 'recenzija'})`}
      >
        <Award className={`${iconSize} text-yellow-400`} />
        <span className="text-xs font-medium text-yellow-300">Zlatni</span>
      </span>
    );
  }

  if (averageRating >= 3.5) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-gray-400/30 to-gray-300/30 border border-gray-400/50"
        title={`Srebrna znaka - ${averageRating.toFixed(1)} ⭐ (${reviewCount} ${reviewCount === 1 ? 'recenzija' : reviewCount < 5 ? 'recenzije' : 'recenzija'})`}
      >
        <Medal className={`${iconSize} text-gray-300`} />
        <span className="text-xs font-medium text-gray-200">Srebrni</span>
      </span>
    );
  }

  if (averageRating >= 2.5) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-700/30 to-amber-600/30 border border-amber-600/50"
        title={`Bronzana znaka - ${averageRating.toFixed(1)} ⭐ (${reviewCount} ${reviewCount === 1 ? 'recenzija' : reviewCount < 5 ? 'recenzije' : 'recenzija'})`}
      >
        <Medal className={`${iconSize} text-amber-500`} />
        <span className="text-xs font-medium text-amber-400">Bronzani</span>
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/20 border border-red-500/30"
      title={`${averageRating.toFixed(1)} ⭐ (${reviewCount} ${reviewCount === 1 ? 'recenzija' : reviewCount < 5 ? 'recenzije' : 'recenzija'})`}
    >
      <Shield className={`${iconSize} text-red-400`} />
      <span className="text-xs font-medium text-red-300">Početnik</span>
    </span>
  );
}
