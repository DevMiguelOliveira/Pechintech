import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WhatsAppCTAProps {
  phone?: string; // Deprecated - não usado mais
  message?: string; // Deprecated - não usado mais
  variant?: 'floating' | 'inline' | 'banner';
  className?: string;
  groupLink?: string; // Link do grupo WhatsApp (opcional, sobrescreve o padrão)
}

const DEFAULT_GROUP_LINK = 'https://chat.whatsapp.com/JwprOlOJlecIRHLZ2zJWpx'; // Link do grupo Pechintech [VIP] - Alerta de Ofertas Tech

export function WhatsAppCTA({ 
  phone,
  message,
  variant = 'floating',
  className,
  groupLink
}: WhatsAppCTAProps) {
  // Sempre usar link do grupo do WhatsApp
  const whatsappUrl = groupLink || DEFAULT_GROUP_LINK;

  const handleClick = () => {
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'whatsapp_click', {
        event_category: 'conversion',
        event_label: variant,
        value: 1,
      });
    }
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'floating') {
    return (
      <Button
        onClick={handleClick}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full",
          "bg-gradient-to-r from-green-500 to-green-600",
          "hover:from-green-600 hover:to-green-700",
          "shadow-2xl hover:shadow-green-500/50",
          "animate-bounce hover:animate-none",
          "transition-all duration-300",
          className
        )}
        aria-label="Entrar no grupo do WhatsApp"
        title="Entrar no grupo Pechintech [VIP] - Alerta de Ofertas Tech"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={cn(
        "w-full bg-gradient-to-r from-green-500/10 to-green-600/10",
        "border-y border-green-500/20 py-3 px-4",
        className
      )}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm mb-1">
              💬 Entre no nosso grupo do WhatsApp
            </h3>
            <p className="text-xs text-muted-foreground">
              Receba promoções exclusivas e tire suas dúvidas
            </p>
          </div>
          <Button
            onClick={handleClick}
            className="bg-green-500 hover:bg-green-600 text-white font-bold h-10 px-6"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Entrar no Grupo
          </Button>
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className={cn(
        "w-full h-12 bg-green-500/10 hover:bg-green-500/20",
        "border-green-500/30 hover:border-green-500/50",
        "text-green-700 hover:text-green-800 font-bold",
        className
      )}
    >
      <MessageCircle className="h-5 w-5 mr-2" />
      Entrar no Grupo
    </Button>
  );
}

