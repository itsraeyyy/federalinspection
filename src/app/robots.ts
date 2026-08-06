import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://federalinspection.gov.et';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/messages/',
        '/api/',
        '/auth/',
        '/files/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
