/**
 * API Serverless para buscar preview de links
 * Evita problemas de CORS e centraliza a lógica
 */

const LINK_PREVIEW_API_KEY = '4c11ed0c8afbeca20345e98639b25036';
const LINK_PREVIEW_API_URL = 'https://api.linkpreview.net';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Lidar com preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // Apenas aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { url } = req.body;

  if (!url || !url.trim()) {
    return res.status(400).json({ error: 'URL não fornecida' });
  }

  // Valida se é uma URL válida
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'URL inválida' });
  }

  try {
    // Timeout de 15 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(LINK_PREVIEW_API_URL, {
      method: 'POST',
      headers: {
        'X-Linkpreview-Api-Key': LINK_PREVIEW_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: url }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({ 
          error: 'Limite de requisições atingido. Tente novamente em alguns minutos.' 
        });
      }
      return res.status(response.status).json({ 
        error: `Erro na API: ${response.status}` 
      });
    }

    const data = await response.json();

    // Verifica se a resposta contém os dados esperados
    if (!data || (!data.title && !data.description && !data.image)) {
      return res.status(200).json({ 
        success: false,
        error: 'Não foi possível extrair informações desta URL',
        // Retorna dados básicos extraídos da URL
        fallback: extractBasicInfo(url),
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        title: data.title || '',
        description: data.description || '',
        image: data.image || '',
        url: data.url || url,
        siteName: extractStoreName(data.url || url),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar link preview:', error);
    
    // Se for timeout ou erro de conexão, retorna fallback
    if (error.name === 'AbortError' || error.message.includes('fetch')) {
      return res.status(200).json({
        success: false,
        error: 'Erro de conexão. Usando informações básicas da URL.',
        fallback: extractBasicInfo(url),
      });
    }

    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      fallback: extractBasicInfo(url),
    });
  }
}

/**
 * Extrai informações básicas da URL quando a API falha
 */
function extractBasicInfo(url) {
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
function extractStoreName(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    
    // Mapeamento de domínios conhecidos para nomes de lojas
    const storeMap = {
      'kabum.com.br': 'Kabum',
      'pichau.com.br': 'Pichau',
      'terabyteshop.com.br': 'Terabyte',
      'amazon.com.br': 'Amazon',
      'mercadolivre.com.br': 'Mercado Livre',
      'magazineluiza.com.br': 'Magazine Luiza',
      'casasbahia.com.br': 'Casas Bahia',
      'americanas.com.br': 'Americanas',
      'shopee.com.br': 'Shopee',
      'aliexpress.com': 'AliExpress',
      'pt.aliexpress.com': 'AliExpress',
      'chipart.com.br': 'Chipart',
    };

    // Retorna o nome mapeado ou formata o hostname
    for (const [domain, name] of Object.entries(storeMap)) {
      if (hostname.includes(domain)) {
        return name;
      }
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

