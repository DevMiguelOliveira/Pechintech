import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  noindex?: boolean;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  structuredData?: object;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

const defaultTitle = 'PechinTech | Promoções de Tecnologia - Melhores Ofertas e Descontos';
const defaultDescription = 'Encontre as melhores promoções de tecnologia no Brasil! Hardware, games, smartphones e periféricos com os menores preços. Cupons exclusivos e ofertas verificadas pela comunidade. Compare preços e economize!';
const defaultKeywords = 'promoções tecnologia, ofertas hardware, descontos games, promoções smartphones, notebooks baratos, placa de vídeo promoção, processador barato, memória RAM oferta, SSD promoção, monitor gamer, teclado mecânico, mouse gamer, headset promoção, PC gamer barato, pechinchas tecnologia, cupom desconto tecnologia, onde comprar tecnologia barato, melhor custo benefício tecnologia';
const defaultImage = 'https://storage.googleapis.com/gpt-engineer-file-uploads/uGvIu746MfU4oUgKOxjO2PRbF313/social-images/social-1765503088493-Logo PechinTech.png';
const siteUrl = import.meta.env.VITE_SITE_URL || 'https://www.pechintech.com.br';
const siteName = 'PechinTech';

export function SEO({
  title = defaultTitle,
  description = defaultDescription,
  keywords = defaultKeywords,
  image = defaultImage,
  url = '/',
  noindex = false,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  structuredData,
  breadcrumbs,
  faqData,
}: SEOProps) {
  const fullTitle = title === defaultTitle ? title : `${title} | ${defaultTitle}`;
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  // Structured Data padrão
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : type === 'product' ? 'Product' : 'WebPage',
    '@id': fullUrl,
    name: fullTitle,
    description: description,
    url: fullUrl,
    image: fullImage,
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/web-app-manifest-512x512.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': fullUrl,
    },
  };

  // Structured Data para Article
  const articleStructuredData = type === 'article' ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': fullUrl,
    headline: title,
    description: description,
    image: fullImage,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: author ? {
      '@type': 'Person',
      name: author,
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/web-app-manifest-512x512.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': fullUrl,
    },
    articleSection: section,
    keywords: tags.length > 0 ? tags.join(', ') : keywords,
  } : null;

  // Structured Data para Breadcrumbs
  const breadcrumbStructuredData = breadcrumbs && breadcrumbs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `${siteUrl}${crumb.url}`,
    })),
  } : null;

  // Structured Data para Brand (apenas na página principal)
  const brandStructuredData = url === '/' ? {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: 'PechinTech',
    alternateName: 'Pechin Tech',
    url: siteUrl,
    logo: `${siteUrl}/web-app-manifest-512x512.png`,
    description: 'PechinTech é a marca líder em promoções de tecnologia no Brasil. Site oficial para encontrar as melhores ofertas de hardware, games, smartphones e periféricos.',
    slogan: 'As melhores promoções de tecnologia do Brasil',
    sameAs: [
      'https://www.facebook.com/pechintech',
      'https://www.twitter.com/pechintech',
      'https://www.instagram.com/pechintech',
    ],
  } : null;

  // Combinar structured data
  const finalStructuredData = structuredData || (type === 'article' ? articleStructuredData : defaultStructuredData);

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author || siteName} />
      <meta name="language" content="Portuguese" />
      <meta name="geo.region" content="BR" />
      <meta name="geo.placename" content="Brasil" />
      <meta name="revisit-after" content="1 days" />
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:locale:alternate" content="pt_PT" />
      {type === 'article' && publishedTime && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@pechintech" />
      <meta name="twitter:creator" content="@pechintech" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Alternate URLs para www e não-www */}
      <link rel="alternate" href={fullUrl.replace('www.', '')} />
      <link rel="alternate" href={fullUrl.includes('www.') ? fullUrl : fullUrl.replace('https://', 'https://www.')} />
      
      {/* Structured Data */}
      {finalStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(finalStructuredData)}
        </script>
      )}
      
      {/* Breadcrumbs Structured Data */}
      {breadcrumbStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </script>
      )}
      
      {/* Brand Structured Data (apenas na página principal) */}
      {brandStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(brandStructuredData)}
        </script>
      )}

      {/* FAQ Structured Data */}
      {faqData && faqData.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqData.map(faq => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          })}
        </script>
      )}
    </Helmet>
  );
}






