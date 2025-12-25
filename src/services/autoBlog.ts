/**
 * Serviço para publicação automática de posts de blog
 * 
 * Este serviço gera posts automáticos sobre produtos e novidades de tecnologia,
 * integrando com a API de IA e inserindo links de produtos relacionados.
 */

import { gerarPostComIA } from './api';
import type { DbProduct } from '@/hooks/useProducts';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface ProdutoRelacionado {
  id: string;
  title: string;
  affiliate_url: string;
  current_price: number;
}

export interface GerarPostAutomaticoRequest {
  tipo: 'produto' | 'novidade';
  produtoId?: string;
  tema?: string;
  descricaoProduto?: {
    title: string;
    description?: string;
    current_price?: number;
    category?: string;
    specs?: Record<string, string>;
    affiliate_url?: string;
  };
  produtosRelacionados?: ProdutoRelacionado[];
}

export interface ConteudoEstruturado {
  title: string;
  slug: string;
  metaDescription: string;
  coverImage: {
    source: 'site' | 'sugestao';
    reference: string;
  };
  content: Array<{
    type: 'paragraph' | 'heading' | 'image';
    text?: string;
    level?: number;
    source?: 'site' | 'sugestao';
    reference?: string;
    alt?: string;
  }>;
  tags: string[];
}

export interface GerarPostAutomaticoResponse {
  // Formato antigo (markdown)
  content?: string;
  // Formato novo (estruturado)
  title?: string;
  slug?: string;
  metaDescription?: string;
  coverImage?: {
    source: 'site' | 'sugestao';
    reference: string;
  };
  structuredContent?: ConteudoEstruturado['content'];
  tags?: string[];
  format?: 'markdown' | 'structured';
  error?: string;
}

/**
 * Gera post automático sobre produto ou novidade
 */
export async function gerarPostAutomatico(
  request: GerarPostAutomaticoRequest
): Promise<GerarPostAutomaticoResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/gerar-post-automatico`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: request.tipo,
        produtoId: request.produtoId,
        tema: request.tema?.trim(),
        descricaoProduto: request.descricaoProduto,
        produtosRelacionados: request.produtosRelacionados,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        content: '',
        error: data.error || `Erro ${response.status}: ${response.statusText}`,
      };
    }

    // Verificar se é formato estruturado ou markdown
    if (data.format === 'structured') {
      // Formato novo: JSON estruturado
      if (!data.title || !data.structuredContent || !Array.isArray(data.structuredContent)) {
        return {
          error: 'Resposta estruturada inválida do servidor',
        };
      }

      return {
        title: data.title,
        slug: data.slug || '',
        metaDescription: data.metaDescription || '',
        coverImage: data.coverImage || { source: 'sugestao', reference: '' },
        structuredContent: data.structuredContent,
        tags: data.tags || [],
        format: 'structured',
      };
    } else {
      // Formato antigo: markdown
      if (!data.content || typeof data.content !== 'string') {
        return {
          error: 'Resposta inválida do servidor',
        };
      }

      return {
        content: data.content,
        format: 'markdown',
      };
    }
  } catch (error) {
    console.error('[AutoBlog] Erro ao chamar endpoint de geração automática:', error);
    
    return {
      content: '',
      error: error instanceof Error 
        ? error.message 
        : 'Erro de conexão. Verifique sua internet e tente novamente.',
    };
  }
}

/**
 * Encontra produtos relacionados baseado em palavras-chave
 */
export function encontrarProdutosRelacionados(
  produtos: DbProduct[],
  palavrasChave: string[],
  limite: number = 3
): ProdutoRelacionado[] {
  if (!produtos || produtos.length === 0 || !palavrasChave || palavrasChave.length === 0) {
    return [];
  }

  // Normalizar palavras-chave
  const keywords = palavrasChave.map(k => k.toLowerCase().trim());

  // Calcular relevância de cada produto
  const produtosComRelevancia = produtos
    .filter(p => p.is_active && p.affiliate_url)
    .map(produto => {
      const textoBusca = `${produto.title} ${produto.description} ${produto.categories?.name || ''}`.toLowerCase();
      
      let relevancia = 0;
      keywords.forEach(keyword => {
        if (textoBusca.includes(keyword)) {
          relevancia += 1;
        }
        // Bonus se a palavra-chave está no título
        if (produto.title.toLowerCase().includes(keyword)) {
          relevancia += 2;
        }
      });

      return { produto, relevancia };
    })
    .filter(item => item.relevancia > 0)
    .sort((a, b) => b.relevancia - a.relevancia)
    .slice(0, limite)
    .map(item => ({
      id: item.produto.id,
      title: item.produto.title,
      affiliate_url: item.produto.affiliate_url,
      current_price: item.produto.current_price,
    }));

  return produtosComRelevancia;
}

/**
 * Extrai palavras-chave de um texto
 */
export function extrairPalavrasChave(texto: string): string[] {
  // Remover caracteres especiais e normalizar
  const palavras = texto
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(p => p.length > 3); // Filtrar palavras muito curtas

  // Remover palavras comuns (stop words)
  const stopWords = ['sobre', 'para', 'com', 'que', 'uma', 'mais', 'muito', 'este', 'essa', 'isso'];
  const palavrasFiltradas = palavras.filter(p => !stopWords.includes(p));

  // Retornar palavras únicas mais frequentes
  const frequencia: Record<string, number> = {};
  palavrasFiltradas.forEach(p => {
    frequencia[p] = (frequencia[p] || 0) + 1;
  });

  return Object.entries(frequencia)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([palavra]) => palavra);
}

/**
 * Gera temas de novidades de tecnologia atuais
 */
export function gerarTemasNovidades(): string[] {
  const anoAtual = new Date().getFullYear();
  
  return [
    `Novidades de Hardware em ${anoAtual}: O que esperar`,
    `Tendências de Tecnologia para ${anoAtual}: Guia Completo`,
    `Lançamentos de GPUs em ${anoAtual}: Análise e Comparação`,
    `Processadores ${anoAtual}: Performance e Custo-Benefício`,
    `Monitores Gaming ${anoAtual}: Tecnologias e Especificações`,
    `SSDs NVMe ${anoAtual}: Velocidade e Capacidade`,
    `Placas-mãe ${anoAtual}: Recursos e Compatibilidade`,
    `Memória RAM DDR5: Vantagens e Quando Migrar`,
    `Coolers e Refrigeração ${anoAtual}: Soluções Eficientes`,
    `Fontes de Alimentação ${anoAtual}: Eficiência e Potência`,
    `Gaming em ${anoAtual}: Hardware Essencial`,
    `Streaming e Criação de Conteúdo: Hardware Recomendado`,
    `Workstations ${anoAtual}: Configurações Profissionais`,
    `Overclocking em ${anoAtual}: Guia e Dicas`,
    `RGB e Estética ${anoAtual}: Personalização de PCs`,
  ];
}

