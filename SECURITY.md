# Política de Segurança - PechinTech

## 🔒 Princípios de Segurança

Este documento descreve as práticas de segurança implementadas no PechinTech e os padrões que devem ser seguidos.

---

## ✅ Implementações de Segurança

### 1. Sanitização de Conteúdo Dinâmico

**Status**: ✅ IMPLEMENTADO

- **DOMPurify**: Todas as strings dinâmicas são sanitizadas antes de renderização
- **Localização**: `src/utils/security.ts`
- **Funções**:
  - `sanitizeHtml()`: Remove HTML perigoso
  - `sanitizeText()`: Remove tags HTML e caracteres perigosos
- **Aplicado em**:
  - Títulos de produtos
  - Descrições
  - Comentários
  - Conteúdo de blog posts

**Proibido**:
- ❌ `dangerouslySetInnerHTML` sem sanitização
- ❌ Renderização direta de conteúdo de API sem validação

---

### 2. Content Security Policy (CSP)

**Status**: ✅ IMPLEMENTADO

- **Localização**: `index.html`
- **Políticas**:
  - `default-src 'self'`: Apenas recursos do próprio domínio
  - `script-src`: Apenas scripts autorizados (Google Analytics, etc.)
  - `frame-ancestors 'none'`: Proteção contra clickjacking
  - `upgrade-insecure-requests`: Força HTTPS

**Bloqueado**:
- Scripts inline não autorizados
- Execução de scripts externos não confiáveis
- Carregamento em iframes externos

---

### 3. Validação Rigorosa de Dados

**Status**: ✅ IMPLEMENTADO

- **Biblioteca**: Zod
- **Localização**: `src/utils/security.ts`
- **Schemas**:
  - `ProductSchema`: Validação completa de produtos
  - `CommentSchema`: Validação de comentários
  - `BlogPostSchema`: Validação de posts

**Validações**:
- UUIDs válidos
- URLs válidas
- Strings com limites de tamanho
- Números positivos
- Datas válidas

**Funções**:
- `validateProduct()`: Valida dados de produto
- `validateComment()`: Valida comentários
- `validateProductSlug()`: Valida slugs de URLs

---

### 4. Remoção de Dados Sensíveis

**Status**: ✅ IMPLEMENTADO

**Variáveis de Ambiente**:
- ✅ Apenas variáveis `VITE_*` são expostas (públicas por design)
- ✅ Nenhuma chave privada no código
- ✅ Tokens sensíveis apenas no backend

**Função de Sanitização**:
- `sanitizeSensitiveData()`: Remove campos sensíveis de objetos

**Checklist**:
- [x] Nenhuma chave privada no código
- [x] Tokens não armazenados em localStorage
- [x] Variáveis VITE_ tratadas como públicas

---

### 5. Proteção contra SEO Spam

**Status**: ✅ IMPLEMENTADO

**Controles Centralizados**:
- `src/components/SEO.tsx`: Componente único para meta tags
- `src/config/seo.ts`: Configurações centralizadas
- Validação de títulos e descrições

**Proteções**:
- Títulos limitados a 200 caracteres
- Descriptions limitadas a 160 caracteres
- URLs canônicas validadas
- Sem conteúdo diferente para bots

---

### 6. Controle de Redirecionamentos Externos

**Status**: ✅ IMPLEMENTADO

**Localização**: `src/utils/urlValidator.ts`

**Funcionalidades**:
- `validateAffiliateUrl()`: Valida URLs de afiliados
- `openAffiliateUrl()`: Abre URLs de forma segura
- `isTrustedDomain()`: Verifica domínios confiáveis

**Allowlist de Domínios**:
- Amazon (Brasil e internacional)
- Kabum, Magazine Luiza, Americanas
- Mercado Livre
- Lojas de tecnologia confiáveis

**Bloqueios**:
- Protocolos perigosos (javascript:, data:, etc.)
- Apenas HTTP/HTTPS permitidos
- Validação de hostname

---

### 7. Proteção contra Clickjacking

**Status**: ✅ IMPLEMENTADO

**Implementação**:
- CSP: `frame-ancestors 'none'`
- Bloqueia carregamento em iframes externos
- Headers de segurança (via servidor)

---

### 8. Auditoria de Dependências

**Status**: ⚠️ PENDENTE (Requer ação manual)

**Comando**:
```bash
npm audit
npm audit fix
```

**Recomendação**:
- Executar `npm audit` antes de cada deploy
- Atualizar dependências críticas regularmente
- Remover pacotes sem manutenção

**Vulnerabilidades Atuais**: 2 (moderate)
- Vulnerabilidades restantes são do servidor de desenvolvimento (esbuild/vite)
- **Não afetam produção** (apenas desenvolvimento local)
- Para corrigir completamente: `npm audit fix --force` (pode causar breaking changes)

---

### 9. Build de Produção Seguro

**Status**: ✅ IMPLEMENTADO

**Configurações** (`vite.config.ts`):
- ✅ Minificação ativa em produção
- ✅ Remoção de `console.log` em produção
- ✅ Source maps apenas em desenvolvimento
- ✅ Code splitting otimizado

**Build**:
```bash
npm run build  # Produção segura
```

---

### 10. Proteções contra Abuso Automatizado

**Status**: ✅ IMPLEMENTADO (Básico)

**Localização**: `src/utils/security.ts`

**Função**:
- `checkRateLimit()`: Rate limiting client-side
- Delay progressivo em ações repetidas
- Preparado para integração com CAPTCHA

**Uso**:
```typescript
if (!checkRateLimit('vote', 10, 60000)) {
  // Bloquear ação
}
```

---

### 11. Monitoramento de Erros

**Status**: ⚠️ PENDENTE (Opcional)

**Recomendação**: Integrar Sentry ou similar

**Monitorar**:
- Erros inesperados
- Loops de renderização
- Payloads anômalos
- Comportamento suspeito

---

### 12. Padronização de Links Externos

**Status**: ✅ IMPLEMENTADO

**Atributos Padrão**:
- `rel="nofollow noopener noreferrer"`
- `target="_blank"`
- Validação de URL antes de abrir

**Função**: `getSafeLinkAttributes()` em `src/utils/urlValidator.ts`

**Avisos**:
- Badge "Link afiliado" visível
- Transparência total sobre comissões

---

### 13. Redução de Engenharia Reversa

**Status**: ✅ IMPLEMENTADO

**Implementado**:
- Minificação completa
- Remoção de console.log em produção
- Code splitting
- Source maps apenas em dev

**Pode melhorar**:
- Ofuscação avançada (opcional)
- Remoção de nomes de variáveis

---

### 14. Documentação de Segurança

**Status**: ✅ IMPLEMENTADO

**Este arquivo**: `SECURITY.md`

---

## 🚫 Padrões Proibidos

### ❌ NUNCA FAÇA:

1. **Usar `dangerouslySetInnerHTML` sem sanitização**
   ```tsx
   // ❌ ERRADO
   <div dangerouslySetInnerHTML={{ __html: userContent }} />
   
   // ✅ CORRETO
   <div>{sanitizeHtml(userContent)}</div>
   ```

2. **Abrir URLs sem validação**
   ```tsx
   // ❌ ERRADO
   window.open(userInput, '_blank');
   
   // ✅ CORRETO
   openAffiliateUrl(userInput);
   ```

3. **Expor dados sensíveis no frontend**
   ```tsx
   // ❌ ERRADO
   const API_KEY = 'sk_live_1234567890';
   
   // ✅ CORRETO
   const API_KEY = import.meta.env.VITE_PUBLIC_API_KEY; // Apenas chaves públicas
   ```

4. **Renderizar conteúdo sem validação**
   ```tsx
   // ❌ ERRADO
   <h1>{product.title}</h1>
   
   // ✅ CORRETO
   <h1>{sanitizeText(product.title)}</h1>
   ```

5. **Permitir redirects baseados em input direto**
   ```tsx
   // ❌ ERRADO
   window.location.href = userInput;
   
   // ✅ CORRETO
   const validated = validateAndSanitizeUrl(userInput);
   if (validated) window.location.href = validated;
   ```

---

## ✅ Checklist de Revisão Antes do Deploy

### Segurança Básica
- [ ] Executar `npm audit` e corrigir vulnerabilidades críticas
- [ ] Verificar que não há `console.log` em produção
- [ ] Confirmar que CSP está ativo
- [ ] Validar que todas as URLs externas são validadas

### Validação de Dados
- [ ] Todos os dados de API são validados com Zod
- [ ] Conteúdo dinâmico é sanitizado
- [ ] Slugs de URL são validados

### Links Externos
- [ ] Todos os links externos usam `openAffiliateUrl()`
- [ ] Atributos `rel="nofollow noopener noreferrer"` presentes
- [ ] URLs são validadas antes de abrir

### Build
- [ ] Build de produção testado
- [ ] Source maps desabilitados em produção
- [ ] Minificação ativa
- [ ] Console.log removido

### Monitoramento
- [ ] Erros são logados (se Sentry configurado)
- [ ] Comportamento anômalo monitorado

---

## 🔧 Comandos Úteis

```bash
# Auditoria de dependências
npm audit
npm audit fix

# Build de produção
npm run build

# Verificar vulnerabilidades
npm audit --audit-level=moderate

# Atualizar dependências
npm update
```

---

## 📞 Reportar Vulnerabilidades

Se você encontrar uma vulnerabilidade de segurança:

1. **NÃO** abra uma issue pública
2. Entre em contato diretamente com a equipe
3. Forneça detalhes sobre a vulnerabilidade
4. Aguarde confirmação antes de divulgar

---

## 📚 Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Zod Documentation](https://zod.dev/)

---

**Última atualização**: Dezembro 2024
**Versão**: 1.0

