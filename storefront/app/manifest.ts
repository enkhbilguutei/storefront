import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Алимхан Дэлгүүр - Технологийн бүтээгдэхүүн',
    short_name: 'Алимхан',
    description: 'Технологийн сүүлийн үеийн бүтээгдэхүүнүүдийг баталгаат хугацаатай хэрэглэгчдэд нийлүүлж байна',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon.jpg',
        sizes: 'any',
        type: 'image/jpeg',
      },
    ],
  };
}
