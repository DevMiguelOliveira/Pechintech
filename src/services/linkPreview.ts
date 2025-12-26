// Link Preview API Service
// Extrai automaticamente título, descrição e imagem de URLs
// Usa API serverless para evitar problemas de CORS

export interface LinkPreviewData {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName?: string;
}

export interface LinkPreviewResponse {
  success: boolean;
  data?: LinkPreviewData;
  error?: string;
  fallback?: LinkPreviewData;
}

/**
 * Extrai informações de uma URL usando a API LinkPreview via serverless
 * @param url - URL do produto/página a ser analisada
 * @returns Dados extraídos (título, descrição, imagem) ou erro
 */
export async function fetchLinkPreview(url: string): Promise<LinkPreviewResponse> {
  if (!url || !url.trim()) {
    return {
      success: false,
      error: 'URL não fornecida',
    };
  }

  // Valida se é uma URL válida
  try {
    new URL(url);
  } catch {
    return {
      success: false,
      error: 'URL inválida',
    };
  }

  try {
    // Usa API serverless para evitar problemas de CORS
    // Em desenvolvimento, pode precisar usar localhost:3000 se estiver rodando Vercel dev
    // Em produção, usa o caminho relativo que será resolvido pelo Vercel
    const apiUrl = '/api/link-preview';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      
      // Se tiver fallback, usa ele
      if (errorData.fallback) {
        return {
          success: false,
          error: errorData.error || 'Erro ao buscar informações',
          fallback: errorData.fallback,
        };
      }

      return {
        success: false,
        error: errorData.error || `Erro: ${response.status}`,
        fallback: extractBasicInfo(url),
      };
    }

    const data = await response.json();

    // Se a API retornou sucesso, retorna os dados
    if (data.success && data.data) {
      return {
        success: true,
        data: data.data,
      };
    }

    // Se não teve sucesso mas tem fallback, retorna o fallback
    if (data.fallback) {
      return {
        success: false,
        error: data.error || 'Informações limitadas disponíveis',
        fallback: data.fallback,
      };
    }

    // Último recurso: extrair informações básicas
    return {
      success: false,
      error: data.error || 'Não foi possível extrair informações',
      fallback: extractBasicInfo(url),
    };
  } catch (error) {
    console.error('Erro ao buscar link preview:', error);
    
    // Em caso de erro, sempre retorna fallback com informações básicas
    return {
      success: false,
      error: 'Erro de conexão. Usando informações básicas da URL.',
      fallback: extractBasicInfo(url),
    };
  }
}

/**
 * Extrai informações básicas da URL quando a API falha
 */
function extractBasicInfo(url: string): LinkPreviewData {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    return {
      title: '',
      description: '',
      image: '',
      url: url,
      siteName: extractStoreName(url),
    };
  } catch {
    return {
      title: '',
      description: '',
      image: '',
      url: url,
      siteName: '',
    };
  }
}

/**
 * Extrai o nome da loja a partir da URL
 */
function extractStoreName(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    
    // Mapeamento de domínios conhecidos para nomes de lojas
    const storeMap: Record<string, string> = {
      'kabum.com.br': 'Kabum',
      'www.kabum.com.br': 'Kabum',
      'pichau.com.br': 'Pichau',
      'www.pichau.com.br': 'Pichau',
      'terabyteshop.com.br': 'Terabyte',
      'www.terabyteshop.com.br': 'Terabyte',
      'amazon.com.br': 'Amazon',
      'www.amazon.com.br': 'Amazon',
      'mercadolivre.com.br': 'Mercado Livre',
      'www.mercadolivre.com.br': 'Mercado Livre',
      'magazineluiza.com.br': 'Magazine Luiza',
      'www.magazineluiza.com.br': 'Magazine Luiza',
      'casasbahia.com.br': 'Casas Bahia',
      'www.casasbahia.com.br': 'Casas Bahia',
      'americanas.com.br': 'Americanas',
      'www.americanas.com.br': 'Americanas',
      'shopee.com.br': 'Shopee',
      'www.shopee.com.br': 'Shopee',
      'aliexpress.com': 'AliExpress',
      'pt.aliexpress.com': 'AliExpress',
      'chipart.com.br': 'Chipart',
      'www.chipart.com.br': 'Chipart',
    };

    // Retorna o nome mapeado ou formata o hostname
    if (storeMap[hostname]) {
      return storeMap[hostname];
    }

    // Formata o hostname removendo www e .com.br/.com
    let storeName = hostname
      .replace(/^www\./, '')
      .replace(/\.com\.br$/, '')
      .replace(/\.com$/, '')
      .split('.')[0];
    
    // Capitaliza a primeira letra
    return storeName.charAt(0).toUpperCase() + storeName.slice(1);
  } catch {
    return '';
  }
}

/**
 * Extrai o nome da loja a partir da URL
 */
function extractStoreName(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    
    // Mapeamento de domínios conhecidos para nomes de lojas
    const storeMap: Record<string, string> = {
      'kabum.com.br': 'Kabum',
      'www.kabum.com.br': 'Kabum',
      'pichau.com.br': 'Pichau',
      'www.pichau.com.br': 'Pichau',
      'terabyteshop.com.br': 'Terabyte',
      'www.terabyteshop.com.br': 'Terabyte',
      'amazon.com.br': 'Amazon',
      'www.amazon.com.br': 'Amazon',
      'mercadolivre.com.br': 'Mercado Livre',
      'www.mercadolivre.com.br': 'Mercado Livre',
      'magazineluiza.com.br': 'Magazine Luiza',
      'www.magazineluiza.com.br': 'Magazine Luiza',
      'casasbahia.com.br': 'Casas Bahia',
      'www.casasbahia.com.br': 'Casas Bahia',
      'americanas.com.br': 'Americanas',
      'www.americanas.com.br': 'Americanas',
      'shopee.com.br': 'Shopee',
      'www.shopee.com.br': 'Shopee',
      'aliexpress.com': 'AliExpress',
      'pt.aliexpress.com': 'AliExpress',
      'chipart.com.br': 'Chipart',
      'www.chipart.com.br': 'Chipart',
    };

    // Retorna o nome mapeado ou formata o hostname
    if (storeMap[hostname]) {
      return storeMap[hostname];
    }

    // Formata o hostname removendo www e .com.br/.com
    let storeName = hostname
      .replace(/^www\./, '')
      .replace(/\.com\.br$/, '')
      .replace(/\.com$/, '');
    
    // Capitaliza a primeira letra
    return storeName.charAt(0).toUpperCase() + storeName.slice(1);
  } catch {
    return '';
  }
}

