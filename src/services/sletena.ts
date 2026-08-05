import { supabase } from '@/lib/supabaseClient';
import { TrainingCategory, SletenaSubmission, SatisfactionSubmission } from '@/types/sletena';
import {
  INITIAL_TRAINING_CATEGORIES,
  INITIAL_SATISFACTION_CATEGORIES,
} from '@/data/sletenaDirectives';

// Fallback in-memory/localStorage stores to ensure non-blocking UI
const LOCAL_STORAGE_NEED_CATS_KEY = 'icods_sletena_need_categories_v2';
const LOCAL_STORAGE_SAT_CATS_KEY = 'icods_sletena_sat_categories_v2';
const LOCAL_STORAGE_NEED_SUBS_KEY = 'icods_sletena_need_submissions_v2';
const LOCAL_STORAGE_SAT_SUBS_KEY = 'icods_sletena_sat_submissions_v2';

function getLocalData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving local storage:', err);
  }
}

export const sletenaService = {
  // ==========================================
  // 1. NEED CATEGORIES (Forms)
  // ==========================================
  getNeedCategories: async (): Promise<TrainingCategory[]> => {
    try {
      const { data, error } = await supabase
        .from('sletena_categories')
        .select('*')
        .eq('category_type', 'NEED')
        .order('date_created', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          dateCreated: d.date_created,
          isActive: d.is_active ?? true,
          categoryType: 'NEED' as const,
          submittersCount: d.submitters_count || 0,
          shareableLink: d.shareable_link || `https://icods.raey.work/sletena/form?cat=${d.id}`,
        }));
        setLocalData(LOCAL_STORAGE_NEED_CATS_KEY, mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase fetch error for need categories, falling back to storage:', err);
    }
    return getLocalData(LOCAL_STORAGE_NEED_CATS_KEY, INITIAL_TRAINING_CATEGORIES);
  },

  // ==========================================
  // 2. SATISFACTION CATEGORIES (Forms)
  // ==========================================
  getSatisfactionCategories: async (): Promise<TrainingCategory[]> => {
    try {
      const { data, error } = await supabase
        .from('sletena_categories')
        .select('*')
        .eq('category_type', 'SATISFACTION')
        .order('date_created', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          dateCreated: d.date_created,
          isActive: d.is_active ?? true,
          categoryType: 'SATISFACTION' as const,
          submittersCount: d.submitters_count || 0,
          shareableLink: d.shareable_link || `https://icods.raey.work/sletena/erkata?cat=${d.id}`,
        }));
        setLocalData(LOCAL_STORAGE_SAT_CATS_KEY, mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase fetch error for sat categories, falling back to storage:', err);
    }
    return getLocalData(LOCAL_STORAGE_SAT_CATS_KEY, INITIAL_SATISFACTION_CATEGORIES);
  },

  // ==========================================
  // 3. CREATE CATEGORY
  // ==========================================
  createCategory: async (
    categoryData: Omit<TrainingCategory, 'id' | 'submittersCount' | 'shareableLink'>
  ): Promise<TrainingCategory> => {
    const newId = `cat-${Date.now()}`;
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://icods.raey.work';
    const linkPath = categoryData.categoryType === 'SATISFACTION' ? '/sletena/erkata?cat=' : '/sletena/form?cat=';
    const shareableLink = `${origin}${linkPath}${newId}`;

    const newCategory: TrainingCategory = {
      ...categoryData,
      id: newId,
      submittersCount: 0,
      shareableLink,
    };

    // Save to Supabase
    try {
      await supabase.from('sletena_categories').insert([
        {
          id: newId,
          title: categoryData.title,
          description: categoryData.description,
          date_created: categoryData.dateCreated,
          is_active: categoryData.isActive,
          category_type: categoryData.categoryType,
          submitters_count: 0,
          shareable_link: shareableLink,
        },
      ]);
    } catch (err) {
      console.warn('Supabase insert error for category:', err);
    }

    // Save local
    const key = categoryData.categoryType === 'SATISFACTION' ? LOCAL_STORAGE_SAT_CATS_KEY : LOCAL_STORAGE_NEED_CATS_KEY;
    const current = getLocalData<TrainingCategory[]>(key, []);
    setLocalData(key, [newCategory, ...current]);

    return newCategory;
  },

  // ==========================================
  // 4. DELETE CATEGORY
  // ==========================================
  deleteCategory: async (id: string, categoryType: 'NEED' | 'SATISFACTION'): Promise<void> => {
    try {
      await supabase.from('sletena_categories').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }

    const key = categoryType === 'SATISFACTION' ? LOCAL_STORAGE_SAT_CATS_KEY : LOCAL_STORAGE_NEED_CATS_KEY;
    const current = getLocalData<TrainingCategory[]>(key, []);
    setLocalData(key, current.filter((c) => c.id !== id));
  },

  // ==========================================
  // 5. GET NEED SUBMISSIONS
  // ==========================================
  getNeedSubmissions: async (): Promise<SletenaSubmission[]> => {
    try {
      const { data, error } = await supabase
        .from('sletena_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: SletenaSubmission[] = data.map((d: any) => ({
          id: d.id,
          categoryId: d.category_id,
          memberName: d.member_name,
          memberId: d.member_id,
          contact: d.contact || '',
          region: d.region,
          zone: d.zone,
          membershipLevel: d.membership_level,
          ratings: d.ratings || {},
          topPriorityDirectives: d.top_priority_directives || [],
          qualitativeFeedback: d.qualitative_feedback,
          createdAt: d.created_at || new Date().toISOString(),
          updatedAt: d.updated_at || d.created_at || new Date().toISOString(),
        }));
        setLocalData(LOCAL_STORAGE_NEED_SUBS_KEY, mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase fetch error for need submissions:', err);
    }
    return getLocalData(LOCAL_STORAGE_NEED_SUBS_KEY, []);
  },

  // ==========================================
  // 6. SAVE NEED SUBMISSION
  // ==========================================
  saveNeedSubmission: async (submission: SletenaSubmission): Promise<void> => {
    try {
      await supabase.from('sletena_submissions').insert([
        {
          id: submission.id,
          category_id: submission.categoryId,
          member_name: submission.memberName,
          member_id: submission.memberId,
          contact: submission.contact,
          region: submission.region,
          zone: submission.zone,
          membership_level: submission.membershipLevel,
          ratings: submission.ratings,
          top_priority_directives: submission.topPriorityDirectives,
          qualitative_feedback: submission.qualitativeFeedback,
          created_at: submission.createdAt,
          updated_at: submission.updatedAt || submission.createdAt,
        },
      ]);
    } catch (err) {
      console.warn('Supabase insert error for need submission:', err);
    }

    const current = getLocalData<SletenaSubmission[]>(LOCAL_STORAGE_NEED_SUBS_KEY, []);
    setLocalData(LOCAL_STORAGE_NEED_SUBS_KEY, [submission, ...current]);

    // Increment count in local storage
    const cats = getLocalData<TrainingCategory[]>(LOCAL_STORAGE_NEED_CATS_KEY, []);
    const updatedCats = cats.map((c) => (c.id === submission.categoryId ? { ...c, submittersCount: c.submittersCount + 1 } : c));
    setLocalData(LOCAL_STORAGE_NEED_CATS_KEY, updatedCats);
  },

  // ==========================================
  // 7. GET SATISFACTION SUBMISSIONS
  // ==========================================
  getSatisfactionSubmissions: async (): Promise<SatisfactionSubmission[]> => {
    try {
      const { data, error } = await supabase
        .from('sletena_satisfaction_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: SatisfactionSubmission[] = data.map((d: any) => ({
          id: d.id,
          categoryId: d.category_id,
          participantName: d.participant_name,
          region: d.region,
          trainerRating: d.trainer_rating,
          contentRating: d.content_rating,
          venueLogisticsRating: d.venue_logistics_rating,
          relevanceRating: d.relevance_rating,
          overallRating: d.overall_rating,
          recommendScore: d.recommend_score,
          positiveAspects: d.positive_aspects,
          improvementSuggestions: d.improvement_suggestions,
          createdAt: d.created_at || d.submitted_at || new Date().toISOString(),
          submittedAt: d.submitted_at || d.created_at || new Date().toISOString(),
        }));
        setLocalData(LOCAL_STORAGE_SAT_SUBS_KEY, mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase fetch error for satisfaction submissions:', err);
    }
    return getLocalData(LOCAL_STORAGE_SAT_SUBS_KEY, []);
  },

  // ==========================================
  // 8. SAVE SATISFACTION SUBMISSION
  // ==========================================
  saveSatisfactionSubmission: async (submission: SatisfactionSubmission): Promise<void> => {
    try {
      await supabase.from('sletena_satisfaction_submissions').insert([
        {
          id: submission.id,
          category_id: submission.categoryId,
          participant_name: submission.participantName,
          region: submission.region,
          trainer_rating: submission.trainerRating,
          content_rating: submission.contentRating,
          venue_logistics_rating: submission.venueLogisticsRating,
          relevance_rating: submission.relevanceRating,
          overall_rating: submission.overallRating,
          recommend_score: submission.recommendScore,
          positive_aspects: submission.positiveAspects,
          improvement_suggestions: submission.improvementSuggestions,
          created_at: submission.createdAt || submission.submittedAt || new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.warn('Supabase insert error for sat submission:', err);
    }

    const current = getLocalData<SatisfactionSubmission[]>(LOCAL_STORAGE_SAT_SUBS_KEY, []);
    setLocalData(LOCAL_STORAGE_SAT_SUBS_KEY, [submission, ...current]);

    const cats = getLocalData<TrainingCategory[]>(LOCAL_STORAGE_SAT_CATS_KEY, []);
    const updatedCats = cats.map((c) => (c.id === submission.categoryId ? { ...c, submittersCount: c.submittersCount + 1 } : c));
    setLocalData(LOCAL_STORAGE_SAT_CATS_KEY, updatedCats);
  },
};
