/**
 * API Serverless para geração de posts de blog usando Google Gemini
 * 
 * Esta função serverless roda no backend (Vercel) e nunca expõe a chave da API.
 * O frontend apenas chama este endpoint, que por sua vez chama a API do Gemini.
 * 
 * Endpoint: POST /api/gerar-post
 * Body: { tema: string, descricao?: string, palavrasChave?: string[] }
 */

export default async function handler(req, res) {
  // Permitir apenas método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Método não permitido. Use POST.' 
    });
  }

  // Validar entrada
  const { tema, descricao, palavrasChave } = req.body;

  if (!tema || typeof tema !== 'string' || tema.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Campo "tema" é obrigatório e deve ser uma string não vazia.' 
    });
  }

  // Validar comprimento do tema
  if (tema.trim().length < 5) {
    return res.status(400).json({ 
      error: 'O tema deve ter pelo menos 5 caracteres.' 
    });
  }

  if (tema.trim().length > 200) {
    return res.status(400).json({ 
      error: 'O tema deve ter no máximo 200 caracteres.' 
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

  // Construir prompt otimizado para SEO e marketing de afiliados
  const keywordsText = palavrasChave && palavrasChave.length > 0
    ? `\n- Palavras-chave a incluir: ${palavrasChave.join(', ')}`
    : '';

  const prompt = `Crie um artigo de blog completo e profissional em português brasileiro sobre "${tema.trim()}".

${descricao ? `CONTEXTO ADICIONAL: ${descricao.trim()}\n` : ''}

INSTRUÇÕES OBRIGATÓRIAS:
- O artigo deve ter entre 1000 e 1500 palavras
- Use formatação Markdown (títulos com #, listas, negrito, itálico, etc.)
- Seja informativo, útil e otimizado para SEO
- Inclua seções como: introdução, desenvolvimento do tema, exemplos práticos, dicas úteis, conclusão
- Use linguagem natural, envolvente e acessível
- Seja específico e detalhado sobre o assunto
- Use parágrafos bem estruturados (3-5 linhas cada)
- Inclua listas quando apropriado
- Use subtítulos (##) para organizar o conteúdo
${keywordsText}

DIRETRIZES DE SEO:
- Use o tema/título principal no primeiro parágrafo
- Distribua palavras-chave naturalmente ao longo do texto
- Crie conteúdo original e valioso
- Evite repetição excessiva de palavras-chave
- Use sinônimos e variações

DIRETRIZES DE CONTEÚDO:
- Forneça informações precisas e atualizadas
- Cite características técnicas quando relevante
- Compare opções quando apropriado
- Inclua dicas práticas e acionáveis
- Seja honesto sobre prós e contras

IMPORTANTE:
- NÃO inclua links de afiliado no conteúdo (serão adicionados separadamente)
- NÃO use linguagem promocional excessiva
- NÃO faça afirmações falsas ou exageradas
- Foque em valor para o leitor

Gere o conteúdo completo do artigo em Markdown, sendo detalhado, informativo e bem estruturado.`;

  try {
    // Validar e limpar a API key
    const cleanApiKey = apiKey.trim();
    if (!cleanApiKey || cleanApiKey.length < 20) {
      console.error('[API] API Key inválida ou muito curta');
      return res.status(500).json({ 
        error: 'API Key inválida. Verifique a configuração.' 
      });
    }

    // Tentar múltiplos modelos (ordem: mais recentes primeiro)
    const models = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest',
    ];

    let lastError = null;
    let response = null;
    let data = null;

    // Tentar cada modelo até um funcionar
    for (const model of models) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanApiKey)}`;
        
        console.log(`[API] Tentando modelo: ${model}`);
        
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
    
    // Não expor detalhes do erro em produção
    return res.status(500).json({ 
      error: 'Erro interno do servidor. Tente novamente mais tarde.' 
    });
  }
}

