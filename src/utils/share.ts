/**
 * Gera o slug do produto para URLs amigáveis
 */
export function generateProductSlug(product: { id: string; title: string }): string {
  const slug = product.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') + '-' + product.id.slice(0, 8);
  
  return slug;
}

/**
 * Gera a URL completa do produto
 */
export function getProductUrl(product: { id: string; title: string }): string {
  const slug = generateProductSlug(product);
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://www.pechintech.com.br';
  return `${siteUrl}/produto/${slug}`;
}

/**
 * Compartilha o produto usando Web Share API ou fallback para WhatsApp
 */
export async function shareProduct(
  product: {
    id: string;
    title: string;
    current_price: number;
    original_price: number;
    store: string;
    coupon_code?: string | null;
  },
  onShare?: (method: string) => void
): Promise<void> {
  const discount = Math.round(
    ((product.original_price - product.current_price) / product.original_price) * 100
  );
  
  const productUrl = getProductUrl(product);
  
  let message = `🔥 *PROMOÇÃO IMPERDÍVEL!* 🔥\n\n`;
  message += `*${product.title}*\n\n`;
  message += `💰 De ~R$ ${product.original_price.toFixed(2)}~ por apenas:\n`;
  message += `✅ *R$ ${product.current_price.toFixed(2)}* (-${discount}%)\n\n`;
  message += `🏪 Loja: ${product.store}\n`;
  
  if (product.coupon_code) {
    message += `🎫 Cupom: *${product.coupon_code}*\n`;
  }
  
  message += `\n🔗 Confira: ${productUrl}\n\n`;
  message += `_Encontrado no PechinTech - As melhores promoções de tecnologia!_`;

  // Tentar usar Web Share API (mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${product.title} - Promoção ${discount}% OFF`,
        text: message.replace(/\*/g, '').replace(/_/g, ''),
        url: productUrl,
      });
      onShare?.('native');
      return;
    } catch (error) {
      // Usuário cancelou ou erro, continuar com fallback
      if ((error as Error).name !== 'AbortError') {
        console.error('Erro ao compartilhar:', error);
      }
    }
  }

  // Fallback: WhatsApp Web
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message + '\n\n' + productUrl)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  onShare?.('whatsapp');
}

