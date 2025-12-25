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
  // Tentar múltiplas variáveis de ambiente para compatibilidade
  // FALLBACK: Se nenhuma variável estiver configurada, usar a chave fornecida (apenas para desenvolvimento)
  const apiKey = process.env.GEMINI_API_KEY 
    || process.env.VITE_GEMINI_API_KEY 
    || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    || 'AIzaSyDxtqMoWu7HpLdsUiYIytffFk91_Rz7QVQ'; // Fallback temporário - REMOVER EM PRODUÇÃO

  if (!apiKey || apiKey === 'sua_chave_aqui' || apiKey === '') {
    console.error('[API] GEMINI_API_KEY não configurada no ambiente');
    console.error('[API] Variáveis de ambiente disponíveis:', Object.keys(process.env).filter(k => k.includes('GEMINI')));
    return res.status(500).json({ 
      error: 'API Key do Gemini não configurada. Configure a variável GEMINI_API_KEY no Vercel ou no arquivo .env.local.' 
    });
  }

  // Log de segurança (não logar a chave completa)
  console.log('[API] API Key do Gemini detectada:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NÃO ENCONTRADA');

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

    const imageUrl = descricaoProduto.image_url || '';

    prompt = `Atue como um Content Agent especializado em tecnologia, hardware e mercado tech, integrado diretamente ao código do projeto PechinTech.

Seu papel é gerar, estruturar e padronizar conteúdos de blog com foco em análises informativas e consumo inteligente.

CONTEXTO DO PRODUTO:
- Título: ${descricaoProduto.title}
- Descrição: ${descricaoProduto.description || 'Produto de tecnologia de alta qualidade'}
- Preço: R$ ${descricaoProduto.current_price?.toFixed(2) || 'Consultar'}
- Categoria: ${descricaoProduto.category || 'Tecnologia'}
- Link de Afiliado: ${descricaoProduto.affiliate_url || 'N/A'}
${descricaoProduto.specs ? `- Especificações: ${JSON.stringify(descricaoProduto.specs)}` : ''}
${imageUrl ? `- Imagem do Produto: ${imageUrl}` : ''}

PRODUTOS RELACIONADOS DISPONÍVEIS:
${produtosLinks || 'Nenhum produto relacionado fornecido.'}

REGRAS DE EXECUÇÃO (OBRIGATÓRIAS):

1. ESTRUTURA DE SAÍDA (NUNCA alterar):
Gere SEMPRE o conteúdo no seguinte formato JSON estruturado:

{
  "title": "Título atrativo e otimizado para SEO sobre o produto",
  "slug": "slug-amigavel-kebab-case",
  "metaDescription": "Meta description clara, objetiva e atrativa (150-160 caracteres)",
  "coverImage": {
    "source": "${imageUrl ? 'site' : 'sugestao'}",
    "reference": "${imageUrl || 'Imagem do produto ' + descricaoProduto.title}"
  },
  "content": [
    {
      "type": "paragraph",
      "text": "Primeiro parágrafo introduzindo o produto..."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Características Principais"
    },
    {
      "type": "paragraph",
      "text": "Conteúdo sobre características..."
    },
    {
      "type": "image",
      "source": "${imageUrl ? 'site' : 'sugestao'}",
      "reference": "${imageUrl || 'Imagem ilustrativa do produto'}",
      "alt": "Descrição da imagem"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Onde Comprar"
    },
    {
      "type": "paragraph",
      "text": "Texto sobre onde comprar incluindo link: [${descricaoProduto.title} - R$ ${descricaoProduto.current_price?.toFixed(2) || 'Consultar'}](${descricaoProduto.affiliate_url || '#'})"
    }
  ],
  "tags": ["hardware", "tecnologia", "${descricaoProduto.category?.toLowerCase() || 'produtos'}", "análise", "guia"]
}

2. ATUALIZAÇÃO E QUALIDADE:
- Produza conteúdo atual, relevante e útil sobre o produto
- Não gere texto genérico ou vago
- Escreva como um editor tech experiente
- Artigo deve ter entre 1200 e 1800 palavras

3. SEO E LEGIBILIDADE:
- Crie título com potencial de clique incluindo o nome do produto
- Gere slug amigável em kebab-case baseado no título
- Meta description clara, objetiva e atrativa (150-160 caracteres)
- Linguagem técnica acessível

4. IMAGENS:
${imageUrl ? `- Use "source": "site" e "reference": "${imageUrl}" para a imagem do produto` : `- Use "source": "sugestao" e descreva o tipo de imagem ideal do produto`}
- Priorize imagens de produtos do site quando disponíveis

5. CONTEÚDO EDITORIAL:
- Não use linguagem promocional direta
- Não use CTAs agressivos
- Posicione o PechinTech como fonte confiável e curadora
- Seja honesto sobre prós e contras do produto
- Mencione produtos relacionados de forma natural quando relevante

6. TAGS:
- Gere de 4 a 8 tags relevantes
- Exemplo: ["hardware", "tecnologia", "${descricaoProduto.category?.toLowerCase() || 'produtos'}", "análise", "guia", "review"]

7. REGRAS FINAIS:
- NÃO explique o que está fazendo
- NÃO adicione comentários fora do JSON
- Retorne APENAS o JSON válido
- O array "content" deve ter pelo menos 8-12 elementos (parágrafos, headings, imagens)
- Inclua seções como: introdução, características principais, benefícios, comparações, dicas de uso, onde comprar
- Use parágrafos bem estruturados (3-5 linhas cada)
- Inclua pelo menos 2-3 headings (level 2 ou 3) para organizar o conteúdo

Gere o conteúdo seguindo rigorosamente todas as regras acima. Retorne APENAS o JSON válido, sem explicações ou comentários adicionais.`;

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

    prompt = `Atue como um Content Agent especializado em tecnologia, hardware e mercado tech, integrado diretamente ao código do projeto PechinTech.

Seu papel é gerar, estruturar e padronizar conteúdos de blog com foco em:
- Novidades de tecnologia
- Lançamentos de hardware
- Tendências do mercado tech
- Análises informativas e consumo inteligente

TEMA DA NOVIDADE: "${tema.trim()}"

PRODUTOS RELACIONADOS DISPONÍVEIS NO SITE:
${produtosLinks || 'Nenhum produto relacionado fornecido.'}

REGRAS DE EXECUÇÃO (OBRIGATÓRIAS):

1. ESTRUTURA DE SAÍDA (NUNCA alterar):
Gere SEMPRE o conteúdo no seguinte formato JSON estruturado:

{
  "title": "Título atrativo e otimizado para SEO sobre a novidade",
  "slug": "slug-amigavel-kebab-case",
  "metaDescription": "Meta description clara, objetiva e atrativa sobre a novidade (150-160 caracteres)",
  "coverImage": {
    "source": "sugestao",
    "reference": "Imagem ilustrativa relacionada à novidade: ${tema.trim()}"
  },
  "content": [
    {
      "type": "paragraph",
      "text": "Primeiro parágrafo introduzindo a novidade..."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "O que é essa novidade?"
    },
    {
      "type": "paragraph",
      "text": "Conteúdo explicativo..."
    },
    {
      "type": "image",
      "source": "sugestao",
      "reference": "Imagem ilustrativa da novidade",
      "alt": "Descrição da imagem"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Impacto no Mercado"
    },
    {
      "type": "paragraph",
      "text": "Conteúdo sobre impacto..."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Produtos Relacionados"
    },
    {
      "type": "paragraph",
      "text": "Texto mencionando produtos relacionados de forma natural: ${produtosLinks || 'Nenhum produto relacionado disponível no momento.'}"
    }
  ],
  "tags": ["tecnologia", "novidades", "hardware", "tendências", "mercado-tech"]
}

2. ATUALIZAÇÃO E QUALIDADE:
- Produza conteúdo ATUAL e relevante sobre a novidade (foco em 2024-2025)
- Não gere texto genérico ou vago
- Escreva como um editor tech experiente
- Artigo deve ter entre 1200 e 1800 palavras
- Seja específico sobre a NOVIDADE e seu impacto atual

3. SEO E LEGIBILIDADE:
- Crie título com potencial de clique sobre a novidade
- Gere slug amigável em kebab-case baseado no título
- Meta description clara, objetiva e atrativa (150-160 caracteres)
- Linguagem técnica acessível

4. IMAGENS:
- Use "source": "sugestao" para imagens
- Descreva claramente o tipo de imagem ideal relacionada à novidade
- Exemplo: "Imagem ilustrativa de ${tema.trim()}"

5. CONTEÚDO EDITORIAL:
- Não use linguagem promocional direta
- Não use CTAs agressivos
- Posicione o PechinTech como fonte confiável e curadora
- Mencione produtos relacionados de forma NATURAL quando fizer sentido
- Seja honesto sobre prós e contras da novidade

6. TAGS:
- Gere de 4 a 8 tags relevantes
- Exemplo: ["tecnologia", "novidades", "hardware", "tendências", "mercado-tech", "lançamentos"]

7. REGRAS FINAIS:
- NÃO explique o que está fazendo
- NÃO adicione comentários fora do JSON
- Retorne APENAS o JSON válido
- O array "content" deve ter pelo menos 10-15 elementos (parágrafos, headings, imagens)
- Inclua seções como: introdução, o que é a novidade, impacto no mercado, benefícios, comparações, produtos relacionados, conclusão
- Use parágrafos bem estruturados (3-5 linhas cada)
- Inclua pelo menos 3-4 headings (level 2 ou 3) para organizar o conteúdo
- Foque em NOVIDADES ATUAIS (2024-2025) de tecnologia, hardware ou games

Gere o conteúdo seguindo rigorosamente todas as regras acima. Retorne APENAS o JSON válido, sem explicações ou comentários adicionais.`;
  }

  try {
    // Validar e limpar a API key
    const cleanApiKey = apiKey.trim();
    if (!cleanApiKey || cleanApiKey.length < 20) {
      console.error('[API] API Key inválida ou muito curta');
      return res.status(500).json({ 
        error: 'API Key inválida. Verifique a configuração.' 
      });
    }

    // Tentar múltiplos modelos e endpoints
    const models = [
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
    ];

    let lastError = null;
    let response = null;
    let data = null;

    // Tentar cada modelo até um funcionar
    for (const model of models) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanApiKey)}`;
        
        console.log(`[API] Tentando modelo: ${model}`);
        console.log(`[API] URL: ${geminiUrl.replace(cleanApiKey, cleanApiKey.substring(0, 10) + '...')}`);
        
        response = await fetch(geminiUrl, {
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

        if (response.ok) {
          console.log(`[API] Sucesso com modelo: ${model}`);
          data = await response.json();
          break;
        } else {
          const errorData = await response.json().catch(() => ({}));
          lastError = {
            model,
            status: response.status,
            error: errorData.error?.message || `Erro ${response.status}`,
          };
          console.warn(`[API] Modelo ${model} falhou:`, lastError);
          
          // Se for erro de autenticação, não tentar outros modelos
          if (response.status === 401 || response.status === 403) {
            break;
          }
        }
      } catch (fetchError) {
        console.error(`[API] Erro ao chamar modelo ${model}:`, fetchError);
        lastError = {
          model,
          error: fetchError.message,
        };
      }
    }

    // Se nenhum modelo funcionou, retornar erro
    if (!response || !response.ok) {

      // Tratar erro de autenticação especificamente
      if (response && (response.status === 401 || response.status === 403)) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || 'Erro de autenticação';
        
        console.error('[API] Erro de autenticação detalhado:', {
          status: response.status,
          error: errorMessage,
          errorData: errorData,
          apiKeyPrefix: cleanApiKey.substring(0, 10) + '...',
          apiKeyLength: cleanApiKey.length,
        });
        
        // Mensagens mais específicas baseadas no erro
        let userMessage = 'Erro de autenticação com a API de IA.';
        if (errorMessage.includes('API key not valid') || errorMessage.includes('invalid API key')) {
          userMessage = 'API Key inválida. Verifique se a chave está correta e ativa no Google AI Studio.';
        } else if (errorMessage.includes('permission') || errorMessage.includes('forbidden')) {
          userMessage = 'API Key sem permissões. Verifique as permissões da chave no Google AI Studio.';
        } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
          userMessage = 'Limite de quota excedido. Verifique sua quota no Google AI Studio.';
        }
        
        return res.status(500).json({ 
          error: userMessage,
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        });
      }
      
      // Outros erros
      if (response && response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        return res.status(400).json({ 
          error: 'Requisição inválida para a API de IA. Verifique os parâmetros.',
          details: process.env.NODE_ENV === 'development' ? errorData.error?.message : undefined,
        });
      }
      
      if (response && response.status === 429) {
        return res.status(429).json({ 
          error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' 
        });
      }

      // Se chegou aqui, nenhum modelo funcionou
      console.error('[API] Todos os modelos falharam:', lastError);
      return res.status(500).json({ 
        error: 'Erro ao gerar conteúdo. Nenhum modelo da API funcionou.',
        details: process.env.NODE_ENV === 'development' ? JSON.stringify(lastError) : undefined,
      });
    }

    // Se chegou aqui, temos uma resposta válida

    // Extrair conteúdo da resposta
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('[API] Resposta inválida do Gemini:', JSON.stringify(data, null, 2));
      return res.status(500).json({ 
        error: 'Resposta inválida da API de IA. A API pode ter retornado um formato inesperado.' 
      });
    }

    let content = data.candidates[0].content.parts[0].text;

    if (!content || content.trim().length === 0) {
      console.error('[API] Conteúdo vazio retornado pela API de IA');
      console.error('[API] Resposta completa:', JSON.stringify(data, null, 2));
      return res.status(500).json({ 
        error: 'Conteúdo vazio retornado pela API de IA. Tente novamente ou verifique se a API está funcionando corretamente.' 
      });
    }

    // Limpar o conteúdo (remover markdown code blocks se houver)
    content = content.trim();
    
    // Tentar extrair JSON se estiver dentro de code blocks
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      content = jsonMatch[1];
    }

    // Tentar parsear como JSON
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      // Se não for JSON válido, retornar como texto (compatibilidade com formato antigo)
      console.warn('[API] Resposta não é JSON válido, retornando como texto:', parseError);
      return res.status(200).json({ 
        content: content,
        format: 'markdown', // Formato antigo
      });
    }

    // Validar estrutura do JSON
    if (!parsedContent.title || !parsedContent.content || !Array.isArray(parsedContent.content)) {
      console.warn('[API] JSON inválido ou incompleto, retornando como texto');
      return res.status(200).json({ 
        content: content,
        format: 'markdown',
      });
    }

    // Retornar JSON estruturado
    return res.status(200).json({ 
      title: parsedContent.title,
      slug: parsedContent.slug || '',
      metaDescription: parsedContent.metaDescription || '',
      coverImage: parsedContent.coverImage || { source: 'sugestao', reference: '' },
      structuredContent: parsedContent.content, // Renomear para evitar conflito com content (markdown)
      tags: parsedContent.tags || [],
      format: 'structured', // Novo formato
    });

  } catch (error) {
    console.error('[API] Erro ao processar requisição:', error);
    
    return res.status(500).json({ 
      error: 'Erro interno do servidor. Tente novamente mais tarde.' 
    });
  }
}

