import { RefreshCw, Car } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Logo({ className = '', showText = true, size = 'md', onClick }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-lg', spacing: 'gap-2' },
    md: { icon: 'w-8 h-8', text: 'text-2xl', spacing: 'gap-3' },
    lg: { icon: 'w-12 h-12', text: 'text-4xl', spacing: 'gap-4' }
  };

  const sizeConfig = sizes[size];

  return (
    <div
      className={`flex items-center ${sizeConfig.spacing} ${className} ${onClick ? 'cursor-pointer group' : ''}`}
      onClick={onClick}
    >
      <div className="relative">
        <div className={`absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl blur-lg opacity-50 animate-pulse ${onClick ? 'group-hover:opacity-75 transition-opacity' : ''}`}></div>
        <div className={`relative bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 p-2 rounded-xl shadow-xl ${onClick ? 'group-hover:scale-105 transition-transform' : ''}`}>
          <div className="relative">
            <Car className={`${sizeConfig.icon} text-white`} />
            <RefreshCw className="absolute -bottom-1 -right-1 w-4 h-4 text-white animate-spin-slow" style={{ animationDuration: '3s' }} />
          </div>
        </div>
      </div>
      {showText && (
        <div className="flex flex-col -space-y-1">
          <span className={`${sizeConfig.text} font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 tracking-tight leading-none ${onClick ? 'group-hover:from-cyan-600 group-hover:to-blue-600 transition-all' : ''}`}>
            zamijeniauto
          </span>
          <span className={`text-xs font-bold text-gray-600 tracking-wider ${onClick ? 'group-hover:text-gray-500 transition-colors' : ''}`}>.ba</span>
        </div>
      )}
    </div>
  );
}
