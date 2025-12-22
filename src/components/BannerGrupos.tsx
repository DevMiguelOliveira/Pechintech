import { MessageCircle, Phone, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BannerGrupos() {
  const handleJoinWhatsApp = () => {
    window.open('https://chat.whatsapp.com/JwprOlOJlecIRHLZ2zJWpx', '_blank', 'noopener,noreferrer');
  };

  const handleJoinTelegram = () => {
    window.open('https://t.me/pechintech', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative bg-gradient-to-r from-primary/5 via-cyber-blue/5 to-primary/5 border border-primary/20 rounded-xl p-4 md:p-6 mb-6 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyber-blue/10 rounded-full blur-2xl" />
      </div>

      <div className="relative flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-6">
        {/* Left Side - Icon and Text */}
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-primary to-cyber-blue glow-primary shrink-0">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              Junte-se à nossa comunidade!
              <Zap className="w-4 h-4 text-primary hidden sm:inline" />
            </h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Receba as melhores promoções em primeira mão nos nossos grupos exclusivos.
            </p>
          </div>
        </div>

        {/* Right Side - Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Button
            onClick={handleJoinWhatsApp}
            className="bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 glow-green"
            size="sm"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden xs:inline">Entrar no WhatsApp</span>
            <span className="xs:hidden">WhatsApp</span>
          </Button>
          <Button
            onClick={handleJoinTelegram}
            variant="outline"
            className="border-blue-500/50 text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
            size="sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden xs:inline">Entrar no Telegram</span>
            <span className="xs:hidden">Telegram</span>
          </Button>
        </div>
      </div>
    </div>
  );
}