import { MetadataRoute } from 'next';
import { getCategories } from '@/lib/data/categories';
import { API_KEY, API_URL } from '@/lib/config/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://alimhan.mn';
  const FETCH_TIMEOUT_MS = 2000;

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  // Get all products
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const response = await fetch(
      `${API_URL}/store/products?limit=1000&fields=handle,updated_at`,
      {
        headers: {
          'x-publishable-api-key': API_KEY,
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch products for sitemap: ${response.statusText}`);
    }

    const { products } = (await response.json()) as {
      products: Array<{ handle: string; updated_at?: string | null }>;
    };

    productPages = products.map((product) => ({
      url: `${baseUrl}/products/${product.handle}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Failed to fetch products for sitemap:', error);
  }

  // Get all categories
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await getCategories();

    categoryPages = categories.map((category) => ({
      url: `${baseUrl}/categories/${category.handle}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Failed to fetch categories for sitemap:', error);
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
