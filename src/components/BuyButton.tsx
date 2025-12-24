import { ExternalLink, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BuyButtonProps {
  discount: number;
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'card' | 'modal' | 'page';
}

export function BuyButton({ 
  discount, 
  onClick, 
  className,
  size = 'md',
  variant = 'card'
}: BuyButtonProps) {
  const isHotDeal = discount >= 30;
  
  // Tamanhos padronizados
  const sizeClasses = {
    sm: 'h-11 sm:h-12 text-xs sm:text-sm px-3',
    md: 'h-12 sm:h-14 text-sm sm:text-base px-3 sm:px-4',
    lg: 'h-14 sm:h-16 text-base sm:text-lg px-4 sm:px-6',
  };

  // Variantes de texto responsivo
  const getButtonText = () => {
    if (isHotDeal) {
      // Desktop: texto completo, Mobile: texto curto
      if (variant === 'page') {
        // Página individual: mais espaço, texto completo no desktop
        return (
          <>
            <span className="hidden lg:inline">🔥 COMPRAR COM DESCONTO AGORA</span>
            <span className="hidden sm:inline lg:hidden">🔥 COMPRAR COM DESCONTO</span>
            <span className="sm:hidden">🔥 COMPRAR</span>
          </>
        );
      } else {
        // Card/Modal: texto mais curto
        return (
          <>
            <span className="hidden sm:inline">🔥 COMPRAR COM DESCONTO</span>
            <span className="sm:hidden">🔥 COMPRAR</span>
          </>
        );
      }
    }
    return 'COMPRAR AGORA';
  };

  // Ícones responsivos
  const iconSize = size === 'sm' ? 'h-4 w-4 sm:h-5 sm:w-5' : size === 'lg' ? 'h-5 w-5 sm:h-6 sm:w-6' : 'h-4 w-4 sm:h-5 sm:w-5';

  return (
    <Button
      variant="default"
      className={cn(
        "w-full font-black rounded-xl",
        "bg-gradient-to-r from-green-600 via-green-500 to-emerald-500",
        "hover:from-green-500 hover:via-green-400 hover:to-emerald-400",
        "shadow-2xl hover:shadow-green-500/50",
        "transition-all duration-300 hover:scale-[1.02]",
        variant === 'page' && "hover:-translate-y-1",
        "border-2 border-green-400/50 hover:border-green-300",
        "text-white font-extrabold tracking-tight",
        "group/cta relative overflow-hidden",
        sizeClasses[size],
        className
      )}
      onClick={onClick}
    >
      <span className="relative z-10 flex items-center justify-center" style={{ gap: 'clamp(0.375rem, 0.5vw, 0.75rem)' }}>
        <ExternalLink className={cn(iconSize, "shrink-0 group-hover/cta:translate-x-1 transition-transform")} aria-hidden="true" />
        <span className="leading-tight text-center whitespace-nowrap">
          {getButtonText()}
        </span>
        <TrendingUp className={cn(iconSize, "shrink-0 group-hover/cta:translate-x-1 transition-transform")} aria-hidden="true" />
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover/cta:translate-x-[100%] transition-transform duration-1000" />
      {variant === 'card' && (
        <div className="absolute inset-0 rounded-xl bg-green-400/20 animate-pulse opacity-0 group-hover/cta:opacity-100 transition-opacity" />
      )}
    </Button>
  );
}

