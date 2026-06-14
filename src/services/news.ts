import { apiClient } from '../lib/api-client';
import { NewsArticle } from '../types';

// Mock Data
const mockNews: NewsArticle[] = [
  { id: '1', title: 'Annual Commission Report 2026 Published', lang: 'English', status: 'Published', author: 'Helen T.', created: 'Oct 10, 2026', published: 'Oct 12, 2026' },
  { id: '2', title: 'የ2018 ዓ.ም በጀት ዓመት እቅድ ትውውቅ', lang: 'Amharic', status: 'Draft', author: 'Abebe B.', created: 'Oct 11, 2026', published: '-' },
  { id: '3', title: 'New Digital ID Services Announced', lang: 'English', status: 'Published', author: 'Helen T.', created: 'Oct 05, 2026', published: 'Oct 08, 2026' },
  { id: '4', title: 'Oduu Haaraa: Tajaajila Dijitaalaa', lang: 'Afaan Oromo', status: 'Draft', author: 'Chala D.', created: 'Oct 12, 2026', published: '-' },
];

export const newsService = {
  getArticles: async (): Promise<NewsArticle[]> => {
    await apiClient.get('/news');
    return mockNews;
  },
  getArticle: async (id: string): Promise<NewsArticle | undefined> => {
    await apiClient.get(`/news/${id}`);
    return mockNews.find(n => n.id === id);
  },
  createArticle: async (data: Partial<NewsArticle>): Promise<NewsArticle> => {
    await apiClient.post('/news', data);
    const newArticle = { ...data, id: Date.now().toString(), created: 'Today' } as NewsArticle;
    mockNews.push(newArticle);
    return newArticle;
  },
  updateArticle: async (id: string, data: Partial<NewsArticle>): Promise<void> => {
    await apiClient.put(`/news/${id}`, data);
  },
  deleteArticle: async (id: string): Promise<void> => {
    await apiClient.delete(`/news/${id}`);
  }
};
