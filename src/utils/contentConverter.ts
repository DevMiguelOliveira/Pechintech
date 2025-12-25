/**
 * Utilitário para converter conteúdo estruturado em Markdown
 * 
 * Converte o formato JSON estruturado do Content Agent
 * para Markdown compatível com o sistema de blog
 */

import type { ConteudoEstruturado } from '@/services/autoBlog';

/**
 * Converte conteúdo estruturado para Markdown
 */
export function converterEstruturadoParaMarkdown(
  conteudoEstruturado: ConteudoEstruturado
): string {
  let markdown = '';

  // Adicionar título principal
  markdown += `# ${conteudoEstruturado.title}\n\n`;

  // Processar cada elemento do conteúdo
  conteudoEstruturado.content.forEach((elemento) => {
    switch (elemento.type) {
      case 'paragraph':
        if (elemento.text) {
          markdown += `${elemento.text}\n\n`;
        }
        break;

      case 'heading':
        if (elemento.text) {
          const level = elemento.level || 2;
          const hashes = '#'.repeat(level);
          markdown += `${hashes} ${elemento.text}\n\n`;
        }
        break;

      case 'image':
        if (elemento.reference) {
          const alt = elemento.alt || elemento.reference;
          if (elemento.source === 'site' && elemento.reference) {
            // Imagem do site - usar URL direta
            markdown += `![${alt}](${elemento.reference})\n\n`;
          } else {
            // Imagem sugerida - adicionar como comentário ou placeholder
            markdown += `<!-- Imagem sugerida: ${elemento.reference} -->\n![${alt}](placeholder)\n\n`;
          }
        }
        break;
    }
  });

  return markdown.trim();
}

/**
 * Gera excerpt a partir do conteúdo estruturado
 */
export function gerarExcerptEstruturado(
  conteudoEstruturado: ConteudoEstruturado,
  maxLength: number = 200
): string {
  // Buscar primeiro parágrafo
  const primeiroParagrafo = conteudoEstruturado.content.find(
    (e) => e.type === 'paragraph' && e.text
  );

  if (primeiroParagrafo?.text) {
    const texto = primeiroParagrafo.text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .trim();

    if (texto.length <= maxLength) {
      return texto;
    }

    return texto.substring(0, maxLength - 3) + '...';
  }

  // Fallback: usar metaDescription
  if (conteudoEstruturado.metaDescription) {
    return conteudoEstruturado.metaDescription;
  }

  // Fallback: usar título
  return conteudoEstruturado.title;
}

