import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  noindex?: boolean;
}

const defaultTitle = 'PechinTech - Promoções de Tecnologia';
const defaultDescription = 'Encontre as melhores promoções de tecnologia. Hardware, periféricos, games e smartphones com os menores preços. Vote nas ofertas e compartilhe com a comunidade!';
const defaultKeywords = 'promoções, tecnologia, hardware, games, periféricos, ofertas, descontos, PC gamer, notebooks, smartphones, placa de vídeo, processador, memória RAM, SSD, monitor, teclado, mouse, headset, webcam';
const defaultImage = '/og-image.jpg';
const siteUrl = import.meta.env.VITE_SITE_URL || 'https://pechintech.com.br';

export function SEO({
  title = defaultTitle,
  description = defaultDescription,
  keywords = defaultKeywords,
  image = defaultImage,
  url = '/',
  noindex = false,
}: SEOProps) {
  const fullTitle = title === defaultTitle ? title : `${title} | ${defaultTitle}`;
  const fullUrl = `${siteUrl}${url}`;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
}





