import { Award, Medal, Shield } from 'lucide-react';

interface UserBadgeProps {
  averageRating: number | null;
  reviewCount: number;
  size?: 'sm' | 'md' | 'lg';
}

export function UserBadge({ averageRating, reviewCount, size = 'md' }: UserBadgeProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const iconSize = sizeClasses[size];

  if (averageRating === null || reviewCount === 0) {
    return (
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-600/30 border border-gray-500/30 cursor-help transition-all hover:scale-110"
        title="Recenzija korisnika: Nema recenzija"
      >
        <Shield className={`${iconSize} text-gray-400`} />
      </span>
    );
  }

  if (averageRating >= 4.5) {
    return (
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-yellow-600/30 to-yellow-500/30 border border-yellow-500/50 cursor-help transition-all hover:scale-110"
        title={`Recenzija korisnika: Zlatna značka - ${averageRating.toFixed(1)} ⭐ (${reviewCount} ${reviewCount === 1 ? 'recenzija' : reviewCount < 5 ? 'recenzije' : 'recenzija'})`}
      >
        <Award className={`${iconSize} text-yellow-400`} />
      </span>
    );
  }

  if (averageRating >= 3.5) {
    return (
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-gray-400/30 to-gray-300/30 border border-gray-400/50 cursor-help transition-all hover:scale-110"
        title={`Recenzija korisnika: Srebrna značka - ${averageRating.toFixed(1)} ⭐ (${reviewCount} ${reviewCount === 1 ? 'recenzija' : reviewCount < 5 ? 'recenzije' : 'recenzija'})`}
      >
        <Medal className={`${iconSize} text-gray-300`} />
      </span>
    );
  }

  if (averageRating >= 2.5) {
    return (
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-amber-700/30 to-amber-600/30 border border-amber-600/50 cursor-help transition-all hover:scale-110"
        title={`Recenzija korisnika: Bronzana značka - ${averageRating.toFixed(1)} ⭐ (${reviewCount} ${reviewCount === 1 ? 'recenzija' : reviewCount < 5 ? 'recenzije' : 'recenzija'})`}
      >
        <Medal className={`${iconSize} text-amber-500`} />
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600/20 border border-red-500/30 cursor-help transition-all hover:scale-110"
      title={`Recenzija korisnika: ${averageRating.toFixed(1)} ⭐ (${reviewCount} ${reviewCount === 1 ? 'recenzija' : reviewCount < 5 ? 'recenzije' : 'recenzija'})`}
    >
      <Shield className={`${iconSize} text-red-400`} />
    </span>
  );
}
