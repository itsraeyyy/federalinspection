import { supabase } from '@/lib/supabaseClient';
import { NewsArticle } from '../types';
import { formatECDate } from '@/lib/date-formatter';

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
      videoUrl: d.video_url,
      images: d.images || [],
      excerpt: d.excerpt,
      created: d.created ? formatECDate(d.created) : '-',
      published: d.published ? formatECDate(d.published) : '-',
    })) as NewsArticle[];
  },
  
  getArticle: async (idOrSlug: string): Promise<NewsArticle | undefined> => {
    const rawInput = decodeURIComponent(idOrSlug).trim();
    if (!rawInput) return undefined;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawInput);

    if (isUuid) {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', rawInput)
        .maybeSingle();

      if (error || !data) {
        if (error) console.error('Error fetching article by UUID:', error);
        return undefined;
      }
      return {
        ...data,
        videoUrl: data.video_url,
        images: data.images || [],
        excerpt: data.excerpt,
        created: data.created ? formatECDate(data.created) : '-',
        published: data.published ? formatECDate(data.published) : '-',
      } as NewsArticle;
    }

    // Handle slug or short ID fallback
    const parts = rawInput.split('-');
    const shortId = parts[parts.length - 1];

    const { data: articles, error } = await supabase
      .from('news_articles')
      .select('*');

    if (error || !articles || articles.length === 0) {
      if (error) console.error('Error fetching articles list for slug:', error);
      return undefined;
    }

    const found = articles.find((a: any) => 
      a.id === rawInput ||
      (shortId && shortId.length >= 8 && a.id.startsWith(shortId)) ||
      (a.title && rawInput.includes(a.title.trim().slice(0, 10)))
    );

    if (!found) return undefined;

    return {
      ...found,
      videoUrl: found.video_url,
      images: found.images || [],
      excerpt: found.excerpt,
      created: found.created ? formatECDate(found.created) : '-',
      published: found.published ? formatECDate(found.published) : '-',
    } as NewsArticle;
  },
  
  createArticle: async (data: Partial<NewsArticle>): Promise<NewsArticle> => {
    // Map from JS object to DB columns
    const dbData = {
      ...data,
      video_url: data.videoUrl,
      images: data.images,
      excerpt: data.excerpt,
      article_type: data.article_type || 'News',
    };
    delete (dbData as any).videoUrl;

    const { data: newArticle, error } = await supabase
      .from('news_articles')
      .insert([dbData])
      .select()
      .single();
      
    if (error) throw error;
    return { ...newArticle, videoUrl: newArticle.video_url } as NewsArticle;
  },
  
  updateArticle: async (id: string, data: Partial<NewsArticle>): Promise<void> => {
    const dbData = {
      ...data,
      ...(data.videoUrl !== undefined && { video_url: data.videoUrl }),
      ...(data.article_type !== undefined && { article_type: data.article_type }),
    };
    delete (dbData as any).videoUrl;

    const { error } = await supabase
      .from('news_articles')
      .update(dbData)
      .eq('id', id);
      
    if (error) throw error;
  },
  
  deleteArticle: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('news_articles')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  },

  uploadImage: async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `news/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('personnel-photos')
      .upload(filePath, file);

    if (uploadError) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const { data } = supabase.storage
      .from('personnel-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
