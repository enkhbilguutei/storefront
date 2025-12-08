import { MetadataRoute } from 'next';
import { medusa } from '@/lib/medusa';
import { getCategories } from '@/lib/data/categories';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://alimhan.mn';

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
    const { products } = await medusa.store.product.list({
      limit: 1000,
      fields: 'handle,updated_at',
    });

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
