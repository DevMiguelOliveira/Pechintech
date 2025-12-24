/**
 * Serviço de integração com Google Gemini API
 * Gera conteúdo de blog posts baseado em produtos
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Usando a versão mais recente da API (gemini-1.5-flash ou gemini-1.5-pro)
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface GeminiContentRequest {
  productTitle: string;
  productDescription: string;
  productPrice: number;
  productCategory: string;
  affiliateUrl: string;
}

export interface GeminiResponse {
  content: string;
  excerpt: string;
  error?: string;
}

/**
 * Gera conteúdo de blog post usando Google Gemini
 */
export async function generateBlogPostContent(
  request: GeminiContentRequest
): Promise<GeminiResponse> {
  // Verificar API Key de forma mais robusta
  const apiKey = GEMINI_API_KEY?.trim();
  // Validação: deve ter pelo menos 20 caracteres (API Keys do Google geralmente têm 39)
  const isValidKey = apiKey && apiKey.length >= 20 && !apiKey.includes('sua_chave') && !apiKey.includes('your_api_key');
  
  console.log('[Gemini] Verificando API Key:', {
    hasKey: !!GEMINI_API_KEY,
    hasTrimmedKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    isValidKey,
    keyPreview: apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}` : 'não encontrada',
    envKeys: Object.keys(import.meta.env).filter(k => k.includes('GEMINI')),
    allViteKeys: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')),
  });
  
  if (!isValidKey) {
    const errorMsg = 'VITE_GEMINI_API_KEY não está configurada ou é inválida. Configure a variável de ambiente no arquivo .env e reinicie o servidor.';
    console.error('[Gemini]', errorMsg, {
      rawKey: GEMINI_API_KEY,
      trimmedKey: apiKey,
      keyLength: apiKey?.length,
    });
    throw new Error(errorMsg);
  }

  const prompt = `Crie um artigo de blog completo e profissional em português brasileiro sobre o produto "${request.productTitle}".

INSTRUÇÕES:
- O artigo deve ter entre 800 e 1200 palavras
- Use formatação Markdown (títulos com #, listas, negrito, etc.)
- Seja informativo, útil e otimizado para SEO
- Inclua seções como: introdução, características principais, benefícios, comparações, dicas de uso
- Use linguagem natural e envolvente
- No final, adicione uma chamada para ação incentivando a compra
- NÃO inclua o link de afiliado no conteúdo (será adicionado separadamente)
- Seja específico sobre o produto e suas características

PRODUTO:
- Título: ${request.productTitle}
- Descrição: ${request.productDescription}
- Preço: R$ ${request.productPrice.toFixed(2)}
- Categoria: ${request.productCategory}

Gere o conteúdo completo do artigo em Markdown, sendo detalhado e informativo.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `Erro na API Gemini: ${response.status} ${response.statusText}`;
      console.error('[Gemini] Erro na resposta da API:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url: GEMINI_API_URL,
      });
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Resposta inválida da API Gemini');
    }

    const fullContent = data.candidates[0].content.parts[0].text;

    // Gerar excerpt (primeiras 2-3 frases ou até 200 caracteres)
    const excerpt = generateExcerpt(fullContent, request.productTitle);

    // Adicionar link de afiliado no final
    const contentWithAffiliate = `${fullContent}

---

## 🛒 Onde Comprar

Encontre este produto com o melhor preço e condições:

**👉 [Ver Oferta do ${request.productTitle}](${request.affiliateUrl})**

*Link afiliado - Ao comprar através deste link, você ajuda a manter o PechinTech funcionando sem custo adicional para você.*

---

*Artigo criado pelo PechinTech - As melhores promoções de tecnologia do Brasil.*

---

*Artigo criado pelo PechinTech - As melhores promoções de tecnologia do Brasil.*`;

    return {
      content: contentWithAffiliate,
      excerpt,
    };
  } catch (error) {
    console.error('[Gemini] Erro ao gerar conteúdo:', error);
    
    let errorMessage = 'Erro desconhecido ao gerar conteúdo com Gemini';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Tratamento específico para erros comuns
      if (error.message.includes('API key not valid') || error.message.includes('invalid API key')) {
        errorMessage = 'API Key inválida. Verifique se a chave está correta no arquivo .env e reinicie o servidor';
      } else if (error.message.includes('quota') || error.message.includes('Quota')) {
        errorMessage = 'Quota da API excedida. Verifique seu limite no Google AI Studio';
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        errorMessage = 'Acesso negado. Verifique se a API Key tem permissões adequadas';
      } else if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
        errorMessage = 'Muitas requisições. Aguarde alguns instantes e tente novamente';
      } else if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente';
      }
    }
    
    return {
      content: '',
      excerpt: '',
      error: errorMessage,
    };
  }
}

/**
 * Gera um excerpt a partir do conteúdo
 */
function generateExcerpt(content: string, productTitle: string): string {
  // Remove markdown headers e formatação
  const plainText = content
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .trim();

  // Pega o primeiro parágrafo ou primeiras 200 caracteres
  const firstParagraph = plainText.split('\n\n')[0] || plainText.substring(0, 200);

  // Limita a 200 caracteres
  if (firstParagraph.length > 200) {
    return firstParagraph.substring(0, 197) + '...';
  }

  // Se o excerpt for muito curto, adiciona contexto
  if (firstParagraph.length < 50) {
    return `Descubra tudo sobre ${productTitle}. ${firstParagraph}`;
  }

  return firstParagraph;
}

