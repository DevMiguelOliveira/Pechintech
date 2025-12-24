/**
 * Utilitários de Segurança
 * Centraliza todas as funções de segurança e validação
 */

import DOMPurify from 'dompurify';
import { z } from 'zod';

/**
 * Lista de domínios confiáveis para links externos
 */
const TRUSTED_DOMAINS = [
  'amazon.com.br',
  'amazon.com',
  'kabum.com.br',
  'magazineluiza.com.br',
  'americanas.com.br',
  'submarino.com.br',
  'shoptime.com.br',
  'mercadolivre.com.br',
  'aliexpress.com',
  'aliexpress.com.br',
  'terabyteshop.com.br',
  'pichau.com.br',
  'chat.whatsapp.com',
  'wa.me',
  'whatsapp.com',
] as const;

/**
 * Sanitiza HTML para prevenir XSS
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    // Server-side: retorna string limpa sem HTML
    return dirty.replace(/<[^>]*>/g, '');
  }
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // Não permite tags HTML
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitiza texto para exibição segura
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';
  
  // Remove HTML tags
  const withoutHtml = text.replace(/<[^>]*>/g, '');
  
  // Remove caracteres perigosos
  return withoutHtml
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '')
    .trim();
}

/**
 * Valida e sanitiza URL
 */
export function validateAndSanitizeUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  
  try {
    const urlObj = new URL(url);
    
    // Bloqueia protocolos perigosos
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    if (dangerousProtocols.some(proto => urlObj.protocol.toLowerCase().startsWith(proto))) {
      console.warn('URL bloqueada por protocolo perigoso:', url);
      return null;
    }
    
    // Apenas HTTP/HTTPS permitidos
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }
    
    return urlObj.href;
  } catch {
    return null;
  }
}

/**
 * Verifica se URL é de domínio confiável
 */
export function isTrustedDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return TRUSTED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Abre URL externa de forma segura
 */
export function openExternalUrl(url: string, options?: { noopener?: boolean; noreferrer?: boolean }) {
  const sanitizedUrl = validateAndSanitizeUrl(url);
  
  if (!sanitizedUrl) {
    console.error('URL inválida ou não permitida:', url);
    return;
  }
  
  const features = [
    options?.noopener !== false ? 'noopener' : '',
    options?.noreferrer !== false ? 'noreferrer' : '',
  ].filter(Boolean).join(' ');
  
  window.open(sanitizedUrl, '_blank', features || undefined);
}

/**
 * Schemas de validação Zod
 */
export const ProductSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(2000),
  image_url: z.string().url(),
  current_price: z.number().positive(),
  original_price: z.number().positive(),
  affiliate_url: z.string().url(),
  category: z.string().min(1),
  temperature: z.number().int().min(0).max(100),
  hot_votes: z.number().int().min(0),
  cold_votes: z.number().int().min(0),
  comments_count: z.number().int().min(0),
  store: z.string().min(1).max(100),
  created_at: z.string().datetime(),
  specs: z.record(z.string()).optional(),
  coupon_code: z.string().nullable().optional(),
});

export const CommentSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  user_id: z.string().uuid(),
  content: z.string().min(1).max(1000),
  created_at: z.string().datetime(),
});

export const BlogPostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  content: z.string().min(1),
  excerpt: z.string().nullable().optional(),
  author_id: z.string().uuid().nullable().optional(),
  published: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  image_url: z.string().url().nullable().optional(),
});

/**
 * Valida dados de produto
 */
export function validateProduct(data: unknown) {
  try {
    return ProductSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Erro de validação de produto:', error.errors);
    }
    return null;
  }
}

/**
 * Valida dados de comentário
 */
export function validateComment(data: unknown) {
  try {
    return CommentSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Erro de validação de comentário:', error.errors);
    }
    return null;
  }
}

/**
 * Valida slug de produto
 */
export function validateProductSlug(slug: string | undefined): boolean {
  if (!slug) return false;
  
  // Formato esperado: titulo-produto-abc12345
  const slugPattern = /^[a-z0-9-]+-[a-f0-9]{8,}$/i;
  return slugPattern.test(slug) && slug.length <= 200;
}

/**
 * Rate limiting simples (client-side)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

/**
 * Limpa dados sensíveis de objetos
 */
export function sanitizeSensitiveData<T extends Record<string, any>>(obj: T): Partial<T> {
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'api_key', 'private_key', 'access_token'];
  const sanitized = { ...obj };
  
  sensitiveKeys.forEach(key => {
    if (key in sanitized) {
      delete sanitized[key];
    }
  });
  
  return sanitized;
}

