/**
 * Script para criar 10 posts de blog sobre produtos de tecnologia
 * Execute com: npx tsx scripts/create-blog-posts.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para gerar slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Templates de posts sobre produtos
const blogPostsTemplates = [
  {
    title: 'Guia Completo: Como Escolher a Melhor Placa de Vídeo para Seu PC Gamer',
    excerpt: 'Descubra tudo que você precisa saber antes de investir em uma placa de vídeo. Análise técnica, comparações e dicas para montar o PC dos sonhos.',
    content: `# Guia Completo: Como Escolher a Melhor Placa de Vídeo para Seu PC Gamer

A placa de vídeo é um dos componentes mais importantes de um PC gamer. Ela é responsável por processar todos os gráficos dos seus jogos favoritos, garantindo uma experiência imersiva e fluida.

## Por que a Placa de Vídeo é Essencial?

A GPU (Graphics Processing Unit) trabalha em conjunto com o processador para renderizar imagens, vídeos e animações. Para jogos modernos, uma boa placa de vídeo é fundamental para:

- **Alta performance em jogos AAA**: Jogos como Cyberpunk 2077, Elden Ring e Hogwarts Legacy exigem GPUs poderosas
- **Ray Tracing**: Tecnologia que traz iluminação realista aos jogos
- **DLSS/FSR**: Upscaling inteligente que melhora FPS sem perder qualidade visual
- **Streaming e criação de conteúdo**: Essencial para quem cria conteúdo ou transmite jogos

## O que Considerar na Escolha?

### 1. **VRAM (Memória de Vídeo)**
- **4GB**: Básico para jogos antigos e e-sports
- **8GB**: Ideal para a maioria dos jogos em 1080p e 1440p
- **12GB+**: Necessário para 4K e jogos com texturas em alta resolução

### 2. **Performance por Preço**
Analise o custo-benefício. Uma placa intermediária pode oferecer 80% da performance de uma topo de linha por metade do preço.

### 3. **Compatibilidade**
- Verifique se sua fonte tem energia suficiente (geralmente 500W+)
- Confirme se cabe no seu gabinete
- Verifique se sua placa-mãe tem slot PCIe adequado

## Dicas de Economia

- **Aguarde promoções**: Black Friday e datas comemorativas trazem descontos significativos
- **Considere modelos anteriores**: GPUs de gerações anteriores ainda são excelentes
- **Monitore preços**: Use ferramentas de comparação para encontrar o melhor momento

## Encontre a Melhor Oferta

Estamos sempre atualizando nosso catálogo com as melhores promoções de placas de vídeo do mercado. Confira as ofertas disponíveis e encontre a GPU perfeita para seu setup!

**👉 [Ver Promoções de Placas de Vídeo](https://www.pechintech.com.br/?category=hardware)**

Não perca a oportunidade de montar o PC gamer dos seus sonhos com os melhores preços do Brasil!`,
  },
  {
    title: 'Processadores Intel vs AMD: Qual Escolher em 2024?',
    excerpt: 'Análise completa das diferenças entre processadores Intel e AMD. Performance, preço, eficiência energética e qual é a melhor escolha para você.',
    content: `# Processadores Intel vs AMD: Qual Escolher em 2024?

A guerra entre Intel e AMD continua acirrada em 2024. Ambas as marcas lançaram processadores incríveis, mas qual é a melhor escolha para suas necessidades?

## Intel: Tradição e Performance

A Intel continua sendo uma referência no mercado, especialmente com suas linhas Core i5, i7 e i9.

### Vantagens Intel:
- **Single-core performance**: Excelente para jogos e aplicações single-threaded
- **Compatibilidade**: Amplo suporte de software e drivers
- **Overclocking**: Processadores K-series oferecem grande potencial de overclock
- **Tecnologia**: Suporte a Thunderbolt e outras tecnologias proprietárias

### Desvantagens:
- **Preço**: Geralmente mais caros que equivalentes AMD
- **Consumo**: Processadores mais antigos consomem mais energia

## AMD: Custo-Benefício e Multitarefa

A AMD revolucionou o mercado com seus processadores Ryzen, oferecendo muitos núcleos por um preço acessível.

### Vantagens AMD:
- **Custo-benefício**: Mais núcleos e threads pelo mesmo preço
- **Eficiência**: Arquitetura Zen oferece excelente performance por watt
- **Multitarefa**: Ideal para quem trabalha com múltiplas aplicações
- **Plataforma**: Socket AM4/AM5 oferece longevidade

### Desvantagens:
- **Gaming puro**: Em alguns casos, Intel ainda tem vantagem em FPS
- **Compatibilidade**: Alguns softwares podem ter melhor otimização para Intel

## Qual Escolher?

### Para Gaming:
- **Orçamento limitado**: AMD Ryzen 5 5600X ou Intel Core i5-12400F
- **Performance alta**: AMD Ryzen 7 7800X3D ou Intel Core i7-13700K
- **Topo de linha**: AMD Ryzen 9 7950X3D ou Intel Core i9-13900K

### Para Trabalho/Criação:
- **Edição de vídeo**: AMD Ryzen 9 (mais núcleos = renderização mais rápida)
- **Desenvolvimento**: Ambos funcionam bem, AMD oferece melhor custo-benefício
- **Streaming**: AMD Ryzen 7 ou Intel Core i7 com muitos núcleos

## Dica de Economia

Processadores de gerações anteriores ainda são excelentes opções! Um Ryzen 5 5600 ou Core i5-12400 oferecem performance incrível por um preço muito mais acessível.

**👉 [Confira as Melhores Ofertas de Processadores](https://www.pechintech.com.br/?category=hardware)**

Encontre o processador perfeito para seu setup com os melhores preços do mercado brasileiro!`,
  },
  {
    title: 'Memória RAM: Quanto Você Realmente Precisa em 2024?',
    excerpt: 'Descubra quanta memória RAM seu PC realmente precisa. Guia completo sobre capacidades, velocidades e como escolher o kit ideal.',
    content: `# Memória RAM: Quanto Você Realmente Precisa em 2024?

A memória RAM é um componente essencial que afeta diretamente a performance do seu computador. Mas quanto você realmente precisa?

## O que é RAM e Por que é Importante?

A RAM (Random Access Memory) é a memória de curto prazo do seu computador. Ela armazena dados que estão sendo usados ativamente, permitindo acesso rápido pelo processador.

### Por que mais RAM ajuda?
- **Multitarefa**: Abra mais programas simultaneamente sem travamentos
- **Gaming**: Jogos modernos consomem muita RAM
- **Produtividade**: Aplicações pesadas como Photoshop e Premiere precisam de bastante memória
- **Navegação**: Múltiplas abas do navegador consomem RAM

## Quanto RAM Você Precisa?

### 8GB - Mínimo Aceitável
- **Ideal para**: Uso básico, navegação web, office
- **Limitações**: Pode travar com muitos programas abertos
- **Gaming**: Funciona, mas com limitações em jogos modernos

### 16GB - Recomendado para Maioria
- **Ideal para**: Gaming, trabalho, criação de conteúdo básico
- **Vantagens**: Confortável para multitarefa e jogos modernos
- **Custo-benefício**: Melhor relação preço/performance

### 32GB - Para Usuários Avançados
- **Ideal para**: Edição de vídeo profissional, streaming, desenvolvimento
- **Vantagens**: Nunca vai faltar memória, mesmo com múltiplas aplicações pesadas
- **Quando vale a pena**: Se você trabalha com projetos grandes regularmente

### 64GB+ - Profissionais e Entusiastas
- **Ideal para**: Estações de trabalho profissionais, servidores, VMs
- **Uso específico**: Para a maioria dos usuários, é excessivo

## Velocidade e Latência

Além da capacidade, considere:

- **Frequência (MHz)**: 3200MHz é o padrão atual, 3600MHz+ para overclock
- **Latência (CL)**: CL16 ou CL18 são ideais, CL14 é premium
- **Dual Channel**: Sempre use pares de pentes para melhor performance

## Dicas de Upgrade

1. **Verifique compatibilidade**: Confirme a velocidade máxima suportada pela sua placa-mãe
2. **Use pares**: 2x8GB é melhor que 1x16GB (dual channel)
3. **Marca confiável**: Corsair, Kingston, G.Skill são excelentes opções
4. **Aguarde promoções**: RAM frequentemente entra em promoção

## Encontre a Melhor Oferta

Estamos sempre atualizando nosso catálogo com kits de memória RAM das melhores marcas com preços incríveis!

**👉 [Ver Promoções de Memória RAM](https://www.pechintech.com.br/?category=hardware)**

Monte seu PC com a quantidade ideal de RAM e garanta performance máxima!`,
  },
  {
    title: 'SSD vs HD: Por que Migrar para SSD é Essencial em 2024',
    excerpt: 'Entenda as diferenças entre SSD e HD tradicional. Descubra por que migrar para SSD é uma das melhores melhorias que você pode fazer no seu PC.',
    content: `# SSD vs HD: Por que Migrar para SSD é Essencial em 2024

Se você ainda usa um HD tradicional, está perdendo uma das melhorias de performance mais impactantes disponíveis. Vamos entender por quê.

## Diferenças Fundamentais

### HD (Hard Disk) - Tecnologia Mecânica
- **Funcionamento**: Discos magnéticos girando com cabeçote de leitura
- **Velocidade**: 100-200 MB/s de leitura/escrita
- **Tempo de boot**: 1-3 minutos
- **Ruído**: Sim, devido às partes mecânicas
- **Durabilidade**: Sensível a impactos físicos

### SSD (Solid State Drive) - Tecnologia Flash
- **Funcionamento**: Chips de memória flash, sem partes móveis
- **Velocidade**: 500-7000+ MB/s (dependendo do tipo)
- **Tempo de boot**: 10-30 segundos
- **Ruído**: Silencioso
- **Durabilidade**: Mais resistente a impactos

## Impacto na Performance

### Boot do Sistema
- **HD**: 1-3 minutos para Windows iniciar completamente
- **SSD**: 10-30 segundos, sistema totalmente responsivo

### Abertura de Programas
- **HD**: Photoshop pode levar 30-60 segundos para abrir
- **SSD**: Abre em 5-10 segundos

### Gaming
- **HD**: Tempos de carregamento de 30-60 segundos entre níveis
- **SSD**: Carregamento quase instantâneo (5-10 segundos)

### Transferência de Arquivos
- **HD**: Copiar 10GB pode levar 5-10 minutos
- **SSD**: Mesma operação em 1-2 minutos

## Tipos de SSD

### SATA SSD
- **Velocidade**: ~500-550 MB/s
- **Interface**: SATA III (mesma do HD)
- **Ideal para**: Upgrade fácil em PCs antigos
- **Preço**: Mais acessível

### NVMe M.2 SSD
- **Velocidade**: 3000-7000+ MB/s
- **Interface**: PCIe (muito mais rápido)
- **Ideal para**: PCs modernos, performance máxima
- **Preço**: Um pouco mais caro, mas vale muito a pena

## Capacidade Recomendada

- **120-256GB**: Sistema operacional e programas essenciais
- **500GB-1TB**: Ideal para maioria dos usuários
- **2TB+**: Para quem trabalha com arquivos grandes

## Dica de Upgrade

Mesmo um SSD SATA básico de 240GB transforma completamente a experiência do seu PC. É o upgrade mais impactante que você pode fazer!

**👉 [Confira as Melhores Ofertas de SSD](https://www.pechintech.com.br/?category=hardware)**

Migre para SSD e sinta a diferença imediatamente!`,
  },
  {
    title: 'Monitores Gamer: Guia Definitivo para Escolher o Perfeito',
    excerpt: 'Resolução, taxa de atualização, tempo de resposta. Tudo que você precisa saber para escolher o monitor gamer ideal para sua experiência.',
    content: `# Monitores Gamer: Guia Definitivo para Escolher o Perfeito

O monitor é sua janela para o mundo dos jogos. Escolher o modelo certo pode transformar completamente sua experiência gaming.

## Características Essenciais

### Resolução

#### Full HD (1920x1080)
- **Ideal para**: PCs de entrada/médio, consoles
- **Vantagens**: Preço acessível, boa performance
- **Quando escolher**: Se sua GPU não é muito potente

#### Quad HD (2560x1440)
- **Ideal para**: PCs médio/alto desempenho
- **Vantagens**: Excelente equilíbrio qualidade/performance
- **Recomendado**: Melhor custo-benefício atual

#### 4K (3840x2160)
- **Ideal para**: PCs topo de linha, trabalho profissional
- **Vantagens**: Máxima qualidade visual
- **Considerações**: Exige GPU muito potente para gaming

### Taxa de Atualização (Hz)

- **60Hz**: Padrão básico, suficiente para jogos casuais
- **144Hz**: Ideal para FPS e jogos competitivos, diferença notável
- **240Hz+**: Para profissionais e entusiastas, diferença sutil mas presente

### Tempo de Resposta

- **1ms**: Ideal para gaming competitivo, elimina ghosting
- **4-5ms**: Aceitável para maioria dos jogos
- **8ms+**: Pode causar motion blur em cenas rápidas

## Tecnologias Importantes

### FreeSync/G-Sync
Sincronização adaptativa que elimina screen tearing e stuttering. **Essencial** para experiência fluida.

### HDR
High Dynamic Range oferece cores mais vibrantes e contraste melhorado. Vale a pena se o orçamento permitir.

### Curvatura
Monitores curvos oferecem imersão maior, especialmente em telas grandes (27"+).

## Tamanho Ideal

- **24"**: Ideal para 1080p, espaço limitado
- **27"**: Perfeito para 1440p, tamanho mais popular
- **32"**: Para 4K ou quem quer tela grande
- **Ultrawide (21:9)**: Experiência cinematográfica, ideal para alguns jogos

## Dicas de Compra

1. **Priorize 144Hz**: A diferença é enorme comparado a 60Hz
2. **FreeSync é essencial**: Mesmo com NVIDIA, funciona perfeitamente
3. **IPS vs VA vs TN**: IPS oferece melhor qualidade de cores
4. **Aguarde promoções**: Monitores frequentemente entram em promoção

## Setup Recomendado

- **Gaming Competitivo**: 24-27" 1080p/1440p, 144Hz+, 1ms, FreeSync
- **Gaming Casual**: 27" 1440p, 144Hz, IPS, FreeSync
- **Workstation**: 27-32" 4K, 60Hz, IPS, HDR

**👉 [Ver Promoções de Monitores Gamer](https://www.pechintech.com.br/?category=hardware)**

Encontre o monitor perfeito para elevar sua experiência gaming!`,
  },
  {
    title: 'Teclados Mecânicos: Vale a Pena o Investimento?',
    excerpt: 'Descubra por que teclados mecânicos são superiores. Switches, tipos, e como escolher o teclado mecânico perfeito para gaming e trabalho.',
    content: `# Teclados Mecânicos: Vale a Pena o Investimento?

Se você ainda usa um teclado de membrana tradicional, está perdendo uma experiência completamente diferente. Teclados mecânicos não são apenas para gamers!

## Por que Teclados Mecânicos são Superiores?

### Durabilidade
- **Membrana**: 5-10 milhões de toques
- **Mecânico**: 50-100 milhões de toques por switch
- **Resultado**: Dura anos a mais, mesmo com uso intenso

### Feedback Tátil
Cada tecla tem um switch individual que oferece feedback físico claro. Você sabe exatamente quando a tecla foi pressionada, sem precisar "apertar até o fundo".

### Velocidade e Precisão
- **Ativação mais rápida**: Switches mecânicos ativam antes de chegar ao fundo
- **Menos erros**: Feedback tátil reduz typos
- **Gaming**: Resposta instantânea é crucial em jogos competitivos

## Tipos de Switches

### Linear (Red/Speed)
- **Características**: Suave, sem feedback tátil
- **Ideal para**: Gaming, digitação rápida
- **Ruído**: Moderado

### Tátil (Brown)
- **Características**: Bump no meio do curso, sem clique
- **Ideal para**: Uso geral, trabalho
- **Ruído**: Baixo

### Clicky (Blue/Green)
- **Características**: Bump + som de clique
- **Ideal para**: Quem gosta de feedback auditivo
- **Ruído**: Alto (pode incomodar em escritórios)

## Tamanhos de Teclado

### Full Size (100%)
- **Vantagens**: Teclado numérico completo
- **Ideal para**: Trabalho, quem usa números frequentemente

### TKL (Tenkeyless - 87 teclas)
- **Vantagens**: Mais espaço na mesa, mais portátil
- **Ideal para**: Gaming, quem não usa teclado numérico

### 60% (Compacto)
- **Vantagens**: Máxima portabilidade, mais espaço para mouse
- **Ideal para**: Setup minimalista, viagens

## Recursos Importantes

### RGB vs Single Color vs Sem LED
- **RGB**: Estética, personalização completa
- **Single Color**: Visual limpo, mais barato
- **Sem LED**: Máxima economia, foco na funcionalidade

### Switches Hot-Swappable
Permite trocar switches sem soldar. Ideal para experimentar diferentes tipos.

### Keycaps PBT vs ABS
- **PBT**: Mais durável, não brilha com uso
- **ABS**: Mais barato, pode brilhar com tempo

## Dicas de Compra

1. **Teste antes de comprar**: Switches são questão de preferência pessoal
2. **Considere TKL**: Mais prático para maioria dos usuários
3. **Marca confiável**: Corsair, Logitech, HyperX, Keychron são excelentes
4. **Aguarde promoções**: Teclados mecânicos frequentemente entram em promoção

## Vale a Pena?

**Absolutamente sim!** A diferença é notável desde o primeiro uso. Se você digita ou joga regularmente, um teclado mecânico é um investimento que vale cada centavo.

**👉 [Ver Promoções de Teclados Mecânicos](https://www.pechintech.com.br/?category=perifericos)**

Eleve sua experiência de digitação e gaming com um teclado mecânico de qualidade!`,
  },
  {
    title: 'Mouses Gamer: DPI, Polling Rate e o que Realmente Importa',
    excerpt: 'Guia completo sobre mouses gamer. Entenda DPI, polling rate, sensores ópticos e como escolher o mouse perfeito para seu estilo de jogo.',
    content: `# Mouses Gamer: DPI, Polling Rate e o que Realmente Importa

O mouse é sua principal ferramenta de interação nos jogos. Escolher o modelo certo pode melhorar significativamente sua performance.

## Especificações que Importam

### DPI (Dots Per Inch)
- **O que é**: Sensibilidade do mouse
- **Mito**: Mais DPI não significa melhor mouse
- **Realidade**: 800-1600 DPI é suficiente para maioria
- **Alto DPI**: Útil apenas em monitores 4K ou muito grandes

### Polling Rate (Hz)
- **1000Hz**: Padrão atual, resposta de 1ms
- **500Hz**: Aceitável, mas pode sentir diferença
- **125Hz**: Evite para gaming
- **Importância**: Taxa de atualização da posição do mouse

### Sensor Óptico vs Laser
- **Óptico**: Mais preciso, sem aceleração, ideal para gaming
- **Laser**: Funciona em mais superfícies, mas pode ter aceleração
- **Recomendado**: Sensor óptico de qualidade (PixArt, etc)

## Tipos de Grip

### Palm Grip
- **Como**: Mão inteira repousa no mouse
- **Ideal para**: Mouses grandes, conforto
- **Jogos**: Estratégia, MMO

### Claw Grip
- **Como**: Dedos curvados, palma não toca mouse
- **Ideal para**: Mouses médios
- **Jogos**: FPS, precisão

### Fingertip Grip
- **Como**: Apenas pontas dos dedos tocam mouse
- **Ideal para**: Mouses pequenos
- **Jogos**: FPS competitivo, movimentos rápidos

## Peso do Mouse

### Leve (<80g)
- **Vantagens**: Movimentos rápidos, menos fadiga
- **Ideal para**: FPS competitivo, movimentos rápidos
- **Tendência**: Mouses ultraleves estão em alta

### Médio (80-100g)
- **Vantagens**: Equilíbrio entre velocidade e controle
- **Ideal para**: Uso geral, maioria dos jogos

### Pesado (>100g)
- **Vantagens**: Mais controle, menos tremores
- **Ideal para**: Jogos que precisam de precisão extrema

## Recursos Úteis

### Botões Programáveis
Úteis para MMO e MOBA. 2-6 botões laterais são suficientes para maioria.

### RGB
Estética pura, não afeta performance. Escolha se gostar do visual.

### Sem Fio vs Com Fio
- **Sem fio moderno**: Tecnologia avançada, latência igual a com fio
- **Com fio**: Sempre funciona, sem preocupação com bateria
- **Recomendado**: Sem fio de qualidade (Logitech G Pro X, etc)

## Dicas de Escolha

1. **Teste o formato**: Forma do mouse é muito pessoal
2. **Sensor de qualidade**: Priorize marcas conhecidas (Logitech, Razer, SteelSeries)
3. **Polling rate 1000Hz**: Essencial para gaming sério
4. **Peso ajustável**: Alguns modelos permitem ajustar peso

## Mouse Recomendado por Tipo

- **FPS Competitivo**: Leve, sensor preciso, formato ergonômico
- **MMO/MOBA**: Muitos botões, confortável para longas sessões
- **Uso Geral**: Equilíbrio entre todas as características

**👉 [Ver Promoções de Mouses Gamer](https://www.pechintech.com.br/?category=perifericos)**

Encontre o mouse perfeito para elevar seu nível de jogo!`,
  },
  {
    title: 'Headsets Gamer: Áudio de Qualidade para Vitórias',
    excerpt: 'Descubra como um bom headset pode melhorar sua performance nos jogos. Áudio posicional, microfone de qualidade e conforto para longas sessões.',
    content: `# Headsets Gamer: Áudio de Qualidade para Vitórias

O áudio é 50% da experiência gaming. Um bom headset não apenas soa melhor, mas pode literalmente te dar vantagem competitiva.

## Por que Áudio Importa nos Jogos?

### Áudio Posicional
- **FPS**: Ouvir passos, tiros e movimentos dos inimigos
- **Battle Royale**: Localizar oponentes pela direção do som
- **Survival Horror**: Imersão total, sustos mais intensos
- **Vantagem**: Saber de onde vem o perigo antes de ver

### Comunicação
- **Team-based games**: Coordenação é essencial
- **Microfone claro**: Seus companheiros precisam te ouvir bem
- **Cancelamento de ruído**: Foco no jogo, sem distrações

## Tipos de Headset

### Com Fio
- **Vantagens**: Sem latência, sem bateria, mais barato
- **Ideal para**: Setup fixo, máximo desempenho
- **Desvantagens**: Fio pode atrapalhar

### Sem Fio
- **Vantagens**: Liberdade de movimento, sem fios
- **Ideal para**: Quem valoriza praticidade
- **Considerações**: Bateria, latência (geralmente imperceptível hoje)

### USB vs P2 vs Wireless
- **USB**: Áudio digital, melhor qualidade, pode ter software dedicado
- **P2 (3.5mm)**: Compatível com tudo, simples
- **Wireless**: Conveniência máxima

## Qualidade de Áudio

### Drivers
- **40mm**: Padrão, suficiente para maioria
- **50mm**: Melhor resposta de graves, mais imersivo
- **53mm+**: Premium, máxima qualidade

### Frequência de Resposta
- **20Hz-20kHz**: Faixa audível humana
- **Mais ampla**: Geralmente significa melhor qualidade

### Surround Virtual
Simula áudio 7.1 com apenas 2 drivers. Funciona bem em muitos casos, mas não substitui surround real.

## Microfone

### Qualidade
- **Cardioide**: Capta som da frente, reduz ruído ambiente
- **Cancelamento de ruído**: Reduz barulhos de fundo
- **Mute rápido**: Botão no cabo ou headset

### Teste Antes
Alguns microfones têm qualidade excelente, outros são apenas "aceitáveis". Verifique reviews.

## Conforto

### Almofadas
- **Couro sintético**: Mais isolamento, pode esquentar
- **Veludo**: Mais confortável, respira melhor
- **Espuma**: Equilíbrio entre conforto e isolamento

### Ajuste
- **Ajuste de altura**: Essencial para diferentes tamanhos de cabeça
- **Peso**: Headsets leves são mais confortáveis para longas sessões
- **Pressão**: Não deve apertar demais

## Recursos Úteis

### Controles Integrados
- **Volume**: Controle no cabo ou headset
- **Mute**: Botão de fácil acesso
- **EQ**: Alguns modelos têm equalizador

### Software
Marcas como Logitech, SteelSeries e Razer oferecem software para:
- Equalizador personalizado
- Perfis por jogo
- Efeitos de áudio

## Dicas de Compra

1. **Teste o conforto**: Se possível, experimente antes de comprar
2. **Microfone removível**: Útil se quiser usar como fones normais
3. **Marca confiável**: Logitech, HyperX, SteelSeries, Razer são excelentes
4. **Aguarde promoções**: Headsets frequentemente entram em promoção

## Headset Recomendado por Uso

- **FPS Competitivo**: Áudio posicional excelente, microfone claro
- **Streaming**: Microfone de qualidade, conforto para longas sessões
- **Uso Geral**: Equilíbrio entre qualidade, conforto e preço

**👉 [Ver Promoções de Headsets Gamer](https://www.pechintech.com.br/?category=perifericos)**

Eleve sua experiência gaming com áudio de qualidade profissional!`,
  },
  {
    title: 'Smartphones em Promoção: Como Escolher o Melhor Custo-Benefício',
    excerpt: 'Guia completo para escolher smartphones. Processador, câmera, bateria e tudo que você precisa saber antes de comprar seu próximo celular.',
    content: `# Smartphones em Promoção: Como Escolher o Melhor Custo-Benefício

O mercado de smartphones está repleto de opções. Como escolher o modelo certo sem gastar uma fortuna? Vamos te ajudar!

## O que Realmente Importa?

### Processador (Chipset)
- **Flagship**: Snapdragon 8 Gen, Apple A17, MediaTek Dimensity 9000
- **Mid-range**: Snapdragon 7 Gen, Dimensity 8000
- **Entry-level**: Snapdragon 4 Gen, Helio G series
- **Dica**: Mid-range atual geralmente é suficiente para maioria

### RAM
- **4GB**: Básico, pode travar com muitos apps
- **6-8GB**: Ideal para maioria dos usuários
- **12GB+**: Para power users e multitarefa pesada

### Armazenamento
- **64GB**: Mínimo, pode ficar apertado rapidamente
- **128GB**: Recomendado para maioria
- **256GB+**: Para quem tira muitas fotos/vídeos

### Bateria
- **4000mAh**: Mínimo aceitável
- **5000mAh**: Ideal para uso intenso
- **6000mAh+**: Para quem não quer se preocupar

## Câmera: O que Procurar?

### Múltiplas Lentes
- **Ultrawide**: Essencial para paisagens e grupos
- **Telefoto**: Zoom óptico, útil para fotos distantes
- **Macro**: Para fotos de perto (geralmente gimmick)

### Megapixels Não São Tudo
- **12-48MP**: Mais que suficiente
- **108MP+**: Marketing, qualidade real depende do sensor
- **Importante**: Tamanho do sensor e processamento de imagem

### Vídeo
- **4K 30fps**: Padrão atual
- **4K 60fps**: Para quem grava muito
- **Estabilização**: OIS (óptica) é melhor que EIS (digital)

## Tela

### Tamanho
- **6.1-6.3"**: Ideal para maioria, uso com uma mão
- **6.5-6.7"**: Para quem gosta de telas grandes
- **6.8"+**: Phablets, muito grandes para alguns

### Tecnologia
- **OLED/AMOLED**: Cores vibrantes, pretos profundos, melhor bateria
- **LCD**: Mais barato, ainda muito bom
- **Refresh Rate**: 90Hz+ oferece experiência mais fluida

## Marcas e Linhas

### Premium
- **Apple iPhone**: iOS, ecossistema, câmeras excelentes
- **Samsung Galaxy S**: Android premium, telas incríveis
- **Google Pixel**: Melhor câmera, Android puro

### Mid-Range (Melhor Custo-Benefício)
- **Samsung Galaxy A**: Excelente qualidade, preço acessível
- **Xiaomi Redmi/POCO**: Performance alta, preço baixo
- **Motorola**: Confiável, Android quase puro

### Entry-Level
- **Samsung Galaxy M**: Básico mas confiável
- **Xiaomi Redmi**: Melhor custo-benefício na categoria

## Dicas de Economia

1. **Gerações anteriores**: iPhone 13 ou Galaxy S21 ainda são excelentes
2. **Promoções**: Black Friday e datas comemorativas trazem descontos grandes
3. **Reembolso**: Alguns modelos têm cashback ou bônus
4. **Plano**: Considere comprar à vista vs parcelado

## Quando Trocar?

- **Bateria**: Se não dura um dia com uso normal
- **Performance**: Se trava constantemente com apps básicos
- **Atualizações**: Se não recebe mais atualizações de segurança
- **Tela/Corpo**: Se está muito danificado

**👉 [Ver Promoções de Smartphones](https://www.pechintech.com.br/?category=smartphones)**

Encontre o smartphone perfeito com o melhor custo-benefício do mercado!`,
  },
  {
    title: 'Notebooks Gamer: Guia Completo para Escolher o Ideal',
    excerpt: 'Placa de vídeo dedicada, processador, tela e tudo que você precisa saber para escolher o notebook gamer perfeito para suas necessidades.',
    content: `# Notebooks Gamer: Guia Completo para Escolher o Ideal

Gaming portátil nunca foi tão acessível. Notebooks gamer modernos oferecem performance incrível em um formato compacto. Vamos te ajudar a escolher!

## Componentes Essenciais

### Placa de Vídeo Dedicada
- **RTX 4050/4060**: Entry-level, 1080p médio
- **RTX 4070**: Ideal para 1440p, excelente custo-benefício
- **RTX 4080/4090**: 4K gaming, topo de linha
- **Importante**: Notebook GPUs são menos potentes que desktop equivalentes

### Processador
- **Intel Core i5/i7**: Excelente para gaming
- **AMD Ryzen 5/7**: Ótimo custo-benefício
- **Geração**: Processadores mais recentes são mais eficientes

### RAM
- **16GB**: Mínimo recomendado para gaming moderno
- **32GB**: Ideal para multitarefa e jogos pesados
- **Upgrade**: Verifique se é possível adicionar mais RAM depois

### Armazenamento
- **SSD 512GB**: Mínimo, pode ficar apertado
- **SSD 1TB**: Recomendado
- **NVMe**: Mais rápido que SATA, preferível

## Tela

### Tamanho
- **15.6"**: Mais comum, bom equilíbrio
- **17.3"**: Mais imersivo, mas menos portátil
- **14"**: Mais portátil, mas menor para gaming

### Resolução
- **Full HD (1920x1080)**: Padrão, ideal para maioria
- **Quad HD (2560x1440)**: Melhor qualidade, exige GPU mais potente
- **4K**: Desnecessário na maioria dos casos, consome muita bateria

### Taxa de Atualização
- **144Hz**: Essencial para gaming competitivo
- **165Hz+**: Premium, diferença sutil
- **60Hz**: Evite para gaming sério

## Refrigeração

### Importante!
Notebooks gamer esquentam muito. Verifique:
- **Sistema de cooling**: Múltiplos fans e heatpipes
- **Ventilação**: Saídas de ar adequadas
- **Throttling**: Alguns modelos reduzem performance quando esquentam

## Bateria

- **Gaming**: 2-4 horas (normal, GPU consome muito)
- **Uso normal**: 4-8 horas dependendo do modelo
- **Dica**: Para gaming, use sempre conectado na tomada

## Marcas Recomendadas

### Premium
- **ASUS ROG**: Excelente qualidade, design agressivo
- **MSI**: Performance alta, boa refrigeração
- **Alienware**: Premium, design único

### Custo-Benefício
- **Acer Predator**: Boa relação preço/performance
- **Lenovo Legion**: Confiável, bom custo-benefício
- **Dell G Series**: Opção mais acessível da Dell

## Dicas de Compra

1. **Não compre apenas por GPU**: Refrigeração e tela são igualmente importantes
2. **Teste o teclado**: Você vai usar muito, precisa ser confortável
3. **Upgrade futuro**: Alguns modelos permitem trocar RAM/SSD
4. **Garantia**: Notebooks gamer podem ter problemas, garantia estendida vale a pena

## Quando Escolher Notebook vs Desktop?

### Notebook é Ideal Se:
- Precisa de portabilidade
- Espaço limitado
- Quer tudo em um só lugar

### Desktop é Melhor Se:
- Performance máxima é prioridade
- Orçamento limitado (desktop é mais barato)
- Não precisa portabilidade

**👉 [Ver Promoções de Notebooks Gamer](https://www.pechintech.com.br/?category=notebooks)**

Encontre o notebook gamer perfeito para levar seus jogos para qualquer lugar!`,
  },
];

async function createBlogPosts() {
  console.log('🚀 Iniciando criação de posts de blog...\n');

  // Primeiro, precisamos obter um usuário admin ou criar os posts diretamente
  // Vamos tentar obter produtos primeiro para referenciar nos posts
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, title, affiliate_url, category')
    .eq('is_active', true)
    .limit(10);

  if (productsError) {
    console.error('❌ Erro ao buscar produtos:', productsError);
    return;
  }

  if (!products || products.length === 0) {
    console.log('⚠️  Nenhum produto ativo encontrado. Criando posts genéricos...\n');
  } else {
    console.log(`✅ Encontrados ${products.length} produtos ativos\n`);
  }

  // Obter usuário atual (precisa estar autenticado)
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('❌ Erro: Você precisa estar autenticado para criar posts.');
    console.log('💡 Dica: Execute este script através da interface admin do site.\n');
    return;
  }

  console.log(`👤 Usuário autenticado: ${user.email}\n`);

  let created = 0;
  let errors = 0;

  for (let i = 0; i < blogPostsTemplates.length; i++) {
    const template = blogPostsTemplates[i];
    const slug = generateSlug(template.title);

    // Verificar se o slug já existe
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      console.log(`⏭️  Post "${template.title}" já existe (slug: ${slug})`);
      continue;
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([
        {
          title: template.title,
          slug: slug,
          content: template.content,
          excerpt: template.excerpt,
          author_id: user.id,
          published: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(`❌ Erro ao criar post "${template.title}":`, error.message);
      errors++;
    } else {
      console.log(`✅ Post criado: "${template.title}"`);
      console.log(`   Slug: ${slug}`);
      console.log(`   ID: ${data.id}\n`);
      created++;
    }

    // Pequeno delay para não sobrecarregar o banco
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Resumo:');
  console.log(`✅ Posts criados: ${created}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`📝 Total processado: ${blogPostsTemplates.length}\n`);

  if (created > 0) {
    console.log('🎉 Posts criados com sucesso!');
    console.log('👉 Acesse o blog em: https://www.pechintech.com.br/blog\n');
  }
}

// Executar
createBlogPosts().catch(console.error);

