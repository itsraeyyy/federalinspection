import { supabase } from '@/lib/supabaseClient';
import { NewsArticle } from '../types';

export const newsService = {
  getArticles: async (): Promise<NewsArticle[]> => {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .order('created', { ascending: false });
      
    if (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
    return data.map((d: any) => ({
      ...d,
      created: d.created ? new Date(d.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
      published: d.published ? new Date(d.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
    })) as NewsArticle[];
  },
  
  getArticle: async (id: string): Promise<NewsArticle | undefined> => {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching article:', error);
      return undefined;
    }
    return {
      ...data,
      created: data.created ? new Date(data.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
      published: data.published ? new Date(data.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
    } as NewsArticle;
  },
  
  createArticle: async (data: Partial<NewsArticle>): Promise<NewsArticle> => {
    // We assume the author name is passed in or derived from profile later
    const { data: newArticle, error } = await supabase
      .from('news_articles')
      .insert([data])
      .select()
      .single();
      
    if (error) throw error;
    return newArticle as NewsArticle;
  },
  
  updateArticle: async (id: string, data: Partial<NewsArticle>): Promise<void> => {
    const { error } = await supabase
      .from('news_articles')
      .update(data)
      .eq('id', id);
      
    if (error) throw error;
  },
  
  deleteArticle: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('news_articles')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
};
