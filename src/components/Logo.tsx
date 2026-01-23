import { RefreshCw, Car } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-lg', spacing: 'gap-2' },
    md: { icon: 'w-8 h-8', text: 'text-2xl', spacing: 'gap-3' },
    lg: { icon: 'w-12 h-12', text: 'text-4xl', spacing: 'gap-4' }
  };

  const sizeConfig = sizes[size];

  return (
    <div className={`flex items-center ${sizeConfig.spacing} ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl blur-lg opacity-50 animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 p-2 rounded-xl shadow-xl">
          <div className="relative">
            <Car className={`${sizeConfig.icon} text-white`} />
            <RefreshCw className="absolute -bottom-1 -right-1 w-4 h-4 text-white animate-spin-slow" style={{ animationDuration: '3s' }} />
          </div>
        </div>
      </div>
      {showText && (
        <div className="flex flex-col -space-y-1">
          <span className={`${sizeConfig.text} font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 tracking-tight leading-none`}>
            zamijeniauto
          </span>
          <span className="text-xs font-bold text-gray-600 tracking-wider">.ba</span>
        </div>
      )}
    </div>
  );
}
