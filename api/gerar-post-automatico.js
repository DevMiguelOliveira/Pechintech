/**
 * API Serverless para geração automática de posts de blog
 * 
 * Esta função gera posts sobre:
 * 1. Produtos existentes no site (com links de afiliado)
 * 2. Novidades de tecnologia, hardware e games (com links de produtos relacionados)
 * 
 * Endpoint: POST /api/gerar-post-automatico
 * Body: { 
 *   tipo: 'produto' | 'novidade',
 *   produtoId?: string,
 *   tema?: string,
 *   produtosRelacionados?: Array<{id, title, affiliate_url, current_price}>
 * }
 */

export default async function handler(req, res) {
  // Permitir apenas método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Método não permitido. Use POST.' 
    });
  }

  // Validar entrada
  const { tipo, produtoId, tema, produtosRelacionados, descricaoProduto } = req.body;

  if (!tipo || !['produto', 'novidade'].includes(tipo)) {
    return res.status(400).json({ 
      error: 'Campo "tipo" é obrigatório e deve ser "produto" ou "novidade".' 
    });
  }

  // Obter chave da API do ambiente (apenas no backend)
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('[API] GEMINI_API_KEY não configurada no ambiente');
    return res.status(500).json({ 
      error: 'Configuração do servidor incompleta. Contate o administrador.' 
    });
  }

  let prompt = '';

  if (tipo === 'produto') {
    // Gerar post sobre produto específico
    if (!produtoId || !descricaoProduto) {
      return res.status(400).json({ 
        error: 'Para tipo "produto", são necessários "produtoId" e "descricaoProduto".' 
      });
    }

    const produtosLinks = produtosRelacionados && produtosRelacionados.length > 0
      ? produtosRelacionados.map(p => `- [${p.title} - R$ ${p.current_price.toFixed(2)}](${p.affiliate_url})`).join('\n')
      : '';

    prompt = `Crie um artigo de blog completo e profissional em português brasileiro sobre o produto "${tema || descricaoProduto.title}".

INFORMAÇÕES DO PRODUTO:
- Título: ${descricaoProduto.title}
- Descrição: ${descricaoProduto.description || 'Produto de tecnologia de alta qualidade'}
- Preço: R$ ${descricaoProduto.current_price?.toFixed(2) || 'Consultar'}
- Categoria: ${descricaoProduto.category || 'Tecnologia'}
${descricaoProduto.specs ? `- Especificações: ${JSON.stringify(descricaoProduto.specs)}` : ''}

INSTRUÇÕES OBRIGATÓRIAS:
- O artigo deve ter entre 1200 e 1800 palavras
- Use formatação Markdown (títulos com #, listas, negrito, itálico, etc.)
- Seja informativo, útil e otimizado para SEO
- Inclua seções como: introdução, características principais, benefícios, comparações, dicas de uso, onde comprar
- Use linguagem natural, envolvente e acessível
- Seja específico sobre o produto e suas características técnicas
- Use parágrafos bem estruturados (3-5 linhas cada)
- Inclua listas quando apropriado
- Use subtítulos (##) para organizar o conteúdo

DIRETRIZES DE SEO:
- Use o nome do produto no primeiro parágrafo
- Distribua palavras-chave naturalmente (nome do produto, categoria, características)
- Crie conteúdo original e valioso
- Evite repetição excessiva
- Use sinônimos e variações

DIRETRIZES DE CONTEÚDO:
- Forneça informações precisas sobre o produto
- Cite características técnicas quando disponíveis
- Compare com produtos similares quando apropriado
- Inclua dicas práticas de uso
- Seja honesto sobre prós e contras
- Mencione a relação custo-benefício

PRODUTOS RELACIONADOS (para mencionar no artigo):
${produtosLinks || 'Nenhum produto relacionado fornecido.'}

IMPORTANTE:
- NO FINAL DO ARTIGO, adicione uma seção "Onde Comprar" com o link de afiliado do produto principal
- Mencione produtos relacionados de forma natural no conteúdo quando relevante
- Use a seguinte estrutura para links de produtos: [Nome do Produto - R$ Preço](link_afiliado)
- NÃO use linguagem promocional excessiva
- NÃO faça afirmações falsas ou exageradas
- Foque em valor para o leitor

Gere o conteúdo completo do artigo em Markdown, sendo detalhado, informativo e bem estruturado.`;

  } else if (tipo === 'novidade') {
    // Gerar post sobre novidade de tecnologia
    if (!tema || tema.trim().length < 10) {
      return res.status(400).json({ 
        error: 'Para tipo "novidade", é necessário um "tema" com pelo menos 10 caracteres.' 
      });
    }

    const produtosLinks = produtosRelacionados && produtosRelacionados.length > 0
      ? produtosRelacionados.map(p => `- [${p.title} - R$ ${p.current_price.toFixed(2)}](${p.affiliate_url})`).join('\n')
      : '';

    prompt = `Crie um artigo de blog completo e profissional em português brasileiro sobre a novidade de tecnologia: "${tema.trim()}".

INSTRUÇÕES OBRIGATÓRIAS:
- O artigo deve ter entre 1200 e 1800 palavras
- Use formatação Markdown (títulos com #, listas, negrito, itálico, etc.)
- Seja informativo, útil e otimizado para SEO
- Foque em NOVIDADES ATUAIS (2024-2025) de tecnologia, hardware ou games
- Inclua seções como: introdução, o que é essa novidade, impacto no mercado, benefícios, comparações, conclusão
- Use linguagem natural, envolvente e acessível
- Seja específico e atualizado sobre a novidade
- Use parágrafos bem estruturados (3-5 linhas cada)
- Inclua listas quando apropriado
- Use subtítulos (##) para organizar o conteúdo

DIRETRIZES DE SEO:
- Use o tema principal no primeiro parágrafo
- Distribua palavras-chave naturalmente
- Crie conteúdo original e valioso
- Evite repetição excessiva
- Use sinônimos e variações

DIRETRIZES DE CONTEÚDO:
- Forneça informações precisas e ATUALIZADAS sobre a novidade
- Cite características técnicas quando relevante
- Compare com tecnologias anteriores quando apropriado
- Inclua dicas práticas e aplicações
- Seja honesto sobre prós e contras
- Mencione o impacto no mercado

PRODUTOS RELACIONADOS DISPONÍVEIS NO SITE:
${produtosLinks || 'Nenhum produto relacionado fornecido.'}

IMPORTANTE:
- Mencione produtos relacionados de forma NATURAL no conteúdo quando fizer sentido
- NO FINAL DO ARTIGO, adicione uma seção "Produtos Relacionados" com links dos produtos fornecidos
- Use a seguinte estrutura para links: [Nome do Produto - R$ Preço](link_afiliado)
- NÃO use linguagem promocional excessiva
- NÃO faça afirmações falsas ou exageradas
- Foque em valor para o leitor
- Seja específico sobre a NOVIDADE e seu impacto atual

Gere o conteúdo completo do artigo em Markdown, sendo detalhado, informativo e bem estruturado.`;
  }

  try {
    // Chamar API do Google Gemini
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
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
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `Erro na API Gemini: ${response.status}`;
      
      console.error('[API] Erro na resposta do Gemini:', {
        status: response.status,
        error: errorMessage,
      });

      if (response.status === 400) {
        return res.status(400).json({ 
          error: 'Requisição inválida para a API de IA. Verifique os parâmetros.' 
        });
      }
      
      if (response.status === 401 || response.status === 403) {
        return res.status(500).json({ 
          error: 'Erro de autenticação com a API de IA. Contate o administrador.' 
        });
      }
      
      if (response.status === 429) {
        return res.status(429).json({ 
          error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' 
        });
      }

      return res.status(500).json({ 
        error: 'Erro ao gerar conteúdo. Tente novamente mais tarde.' 
      });
    }

    const data = await response.json();

    // Extrair conteúdo da resposta
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('[API] Resposta inválida do Gemini:', data);
      return res.status(500).json({ 
        error: 'Resposta inválida da API de IA.' 
      });
    }

    const content = data.candidates[0].content.parts[0].text;

    if (!content || content.trim().length === 0) {
      return res.status(500).json({ 
        error: 'Conteúdo vazio retornado pela API de IA.' 
      });
    }

    // Retornar apenas o conteúdo (sem expor chaves ou dados sensíveis)
    return res.status(200).json({ 
      content: content.trim(),
    });

  } catch (error) {
    console.error('[API] Erro ao processar requisição:', error);
    
    return res.status(500).json({ 
      error: 'Erro interno do servidor. Tente novamente mais tarde.' 
    });
  }
}

