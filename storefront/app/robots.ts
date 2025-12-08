import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/account/',
          '/checkout/',
          '/cart/',
          '/auth/',
        ],
      },
    ],
    sitemap: 'https://alimhan.mn/sitemap.xml',
  };
}
