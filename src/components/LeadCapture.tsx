import { useState } from 'react';
import { Mail, X, Check, Zap, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface LeadCaptureProps {
  variant?: 'inline' | 'modal' | 'banner';
  onClose?: () => void;
  productTitle?: string;
}

export function LeadCapture({ variant = 'inline', onClose, productTitle }: LeadCaptureProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, insira um email válido.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simular envio (substituir por integração real)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Salvar no localStorage para tracking
    const leads = JSON.parse(localStorage.getItem('pechintech_leads') || '[]');
    leads.push({
      email,
      timestamp: new Date().toISOString(),
      product: productTitle,
      source: variant,
    });
    localStorage.setItem('pechintech_leads', JSON.stringify(leads));

    setIsSuccess(true);
    setIsSubmitting(false);
    
    toast({
      title: 'Email cadastrado!',
      description: 'Você receberá as melhores promoções em primeira mão.',
    });

    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'lead_capture', {
        event_category: 'conversion',
        event_label: variant,
        value: 1,
      });
    }

    setTimeout(() => {
      setIsSuccess(false);
      setEmail('');
      if (onClose) onClose();
    }, 3000);
  };

  if (variant === 'modal') {
    return (
      <Card className="w-full max-w-md mx-auto border-2 border-primary/20 shadow-2xl">
        <CardHeader className="relative pb-4">
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/70">
              <Gift className="h-5 w-5 text-primary-foreground" />
            </div>
            <CardTitle className="text-xl font-black">Receba Promoções Exclusivas!</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Cadastre seu email e seja o primeiro a saber das melhores ofertas de tecnologia
          </p>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Email cadastrado com sucesso!</h3>
              <p className="text-sm text-muted-foreground">
                Você receberá as melhores promoções em primeira mão.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base"
                  required
                />
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Check className="h-3 w-3 mt-0.5 shrink-0 text-green-600" />
                  <span>Promoções exclusivas • Sem spam • Cancele quando quiser</span>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-black bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
              >
                {isSubmitting ? (
                  'Cadastrando...'
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Quero Receber Promoções!
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="w-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-y border-primary/20 py-4 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-bold text-sm sm:text-base mb-1">
              🔥 Receba as melhores promoções em primeira mão!
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Cadastre seu email e não perca nenhuma oferta exclusiva
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto">
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full sm:w-64"
              required
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-4 font-bold shrink-0"
            >
              {isSubmitting ? '...' : 'Cadastrar'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div className={cn(
      "rounded-xl border-2 border-primary/20 bg-gradient-to-br from-card to-card/50 p-4 sm:p-6",
      "shadow-lg"
    )}>
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/70 shrink-0">
          <Gift className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-base sm:text-lg mb-1">
            Receba Promoções Exclusivas por Email
          </h3>
          <p className="text-sm text-muted-foreground">
            Seja o primeiro a saber das melhores ofertas de tecnologia
          </p>
        </div>
      </div>
      
      {isSuccess ? (
        <div className="text-center py-4">
          <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-green-600">
            Email cadastrado com sucesso!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 flex-1"
              required
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-6 font-bold shrink-0"
            >
              {isSubmitting ? '...' : 'Cadastrar'}
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="h-3 w-3 shrink-0 text-green-600" />
            <span>100% gratuito • Sem spam • Cancele quando quiser</span>
          </div>
        </form>
      )}
    </div>
  );
}

