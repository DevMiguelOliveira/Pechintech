# 🔧 Configuração da API Gemini

## ⚠️ Erro: "API Key do Gemini não configurada"

Se você está vendo este erro, significa que a chave da API do Gemini não está configurada corretamente.

## 📋 Solução

### Para Desenvolvimento Local

1. **Crie o arquivo `.env.local` na raiz do projeto:**
```bash
# Windows PowerShell
New-Item -Path .env.local -ItemType File
```

2. **Adicione a chave da API:**
```env
GEMINI_API_KEY=sua_chave_aqui
VITE_GEMINI_API_KEY=sua_chave_aqui
```

3. **Reinicie o servidor de desenvolvimento:**
```bash
# Pare o servidor (Ctrl+C) e reinicie
npm run dev
```

### Para Produção (Vercel)

1. **Acesse o painel do Vercel:**
   - Vá para https://vercel.com
   - Selecione seu projeto PechinTech

2. **Configure as variáveis de ambiente:**
   - Vá em **Settings** > **Environment Variables**
   - Adicione:
     - **Nome:** `GEMINI_API_KEY`
     - **Valor:** Sua chave da API Gemini
     - **Ambiente:** Production, Preview, Development (marque todos)

3. **Redeploy:**
   - Após adicionar a variável, faça um novo deploy
   - Ou aguarde o redeploy automático

## 🔑 Como Obter a Chave da API Gemini

1. Acesse [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em **"Create API Key"** ou **"Get API Key"**
4. Copie a chave gerada
5. Cole no `.env.local` (desenvolvimento) ou no Vercel (produção)

## ✅ Verificação

Após configurar, teste a geração de posts:

1. Acesse `/admin/blog`
2. Use o componente "Publicação Automática de Posts"
3. Tente gerar um post sobre um produto ou novidade
4. Se funcionar, a configuração está correta!

## 🐛 Troubleshooting

### Erro persiste após configurar

1. **Verifique se a variável está correta:**
   ```bash
   # Windows PowerShell
   Get-Content .env.local | Select-String "GEMINI"
   ```

2. **Limpe o cache do Vite:**
   ```bash
   rm -rf node_modules/.vite
   # ou no Windows
   Remove-Item -Recurse -Force node_modules\.vite
   ```

3. **Reinicie o servidor completamente:**
   - Pare o servidor (Ctrl+C)
   - Feche o terminal
   - Abra um novo terminal
   - Execute `npm run dev` novamente

### No Vercel

1. Verifique se a variável está configurada em **todos os ambientes** (Production, Preview, Development)
2. Verifique se o nome da variável está exatamente como `GEMINI_API_KEY` (sem espaços, case-sensitive)
3. Faça um novo deploy após adicionar a variável

## 📝 Notas Importantes

- ⚠️ **NUNCA** commite arquivos `.env` ou `.env.local` no Git
- ✅ O arquivo `.env.local` já está no `.gitignore`
- 🔄 Sempre reinicie o servidor após modificar variáveis de ambiente
- 🌐 No Vercel, as variáveis são carregadas automaticamente em cada deploy

