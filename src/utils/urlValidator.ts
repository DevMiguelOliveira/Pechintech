/**
 * Validador de URLs para links externos
 * Garante que apenas URLs seguras e confiáveis sejam abertas
 */

import { validateAndSanitizeUrl, isTrustedDomain, openExternalUrl } from './security';

/**
 * Lista de domínios permitidos para links de afiliados
 */
const ALLOWED_AFFILIATE_DOMAINS = [
  'amazon.com.br',
  'amazon.com',
  'kabum.com.br',
  'magazineluiza.com.br',
  'americanas.com.br',
  'submarino.com.br',
  'shoptime.com.br',
  'mercadolivre.com.br',
  'terabyteshop.com.br',
  'pichau.com.br',
  'casasbahia.com.br',
  'extra.com.br',
  'pontofrio.com.br',
] as const;

/**
 * Valida URL de afiliado
 */
export function validateAffiliateUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  const sanitized = validateAndSanitizeUrl(url);
  if (!sanitized) return false;
  
  try {
    const urlObj = new URL(sanitized);
    const hostname = urlObj.hostname.toLowerCase();
    
    return ALLOWED_AFFILIATE_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Abre link de afiliado de forma segura
 */
export function openAffiliateUrl(url: string, fallbackUrl?: string) {
  if (!validateAffiliateUrl(url)) {
    console.error('URL de afiliado não permitida:', url);
    if (fallbackUrl && validateAffiliateUrl(fallbackUrl)) {
      openExternalUrl(fallbackUrl);
    }
    return;
  }
  
  openExternalUrl(url, { noopener: true, noreferrer: true });
}

/**
 * Gera atributos seguros para links externos
 */
export function getSafeLinkAttributes(url: string) {
  const isValid = validateAndSanitizeUrl(url) !== null;
  
  return {
    href: isValid ? url : '#',
    target: '_blank',
    rel: 'nofollow noopener noreferrer',
    onClick: (e: React.MouseEvent) => {
      if (!isValid) {
        e.preventDefault();
        return;
      }
      // Validação adicional no clique
      const sanitized = validateAndSanitizeUrl(url);
      if (sanitized) {
        openExternalUrl(sanitized, { noopener: true, noreferrer: true });
      }
      e.preventDefault();
    },
  };
}

