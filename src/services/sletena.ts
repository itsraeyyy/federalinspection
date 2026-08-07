import { supabase } from '@/lib/supabaseClient';
import { TrainingCategory, SletenaSubmission, SatisfactionSubmission } from '@/types/sletena';
import {
  INITIAL_TRAINING_CATEGORIES,
  INITIAL_SATISFACTION_CATEGORIES,
  MOCK_SUBMISSIONS,
} from '@/data/sletenaDirectives';

// Fallback in-memory/localStorage stores to ensure non-blocking UI
const LOCAL_STORAGE_NEED_CATS_KEY = 'icods_sletena_need_categories_v6';
const LOCAL_STORAGE_SAT_CATS_KEY = 'icods_sletena_sat_categories_v6';
const LOCAL_STORAGE_NEED_SUBS_KEY = 'icods_sletena_need_submissions_v6';
const LOCAL_STORAGE_SAT_SUBS_KEY = 'icods_sletena_sat_submissions_v6';

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
          shareableLink: d.shareable_link || `https://icods.raey.work/sletena/submit?cat=${d.id}`,
          selectedDirectiveIds: d.selected_directive_ids || [],
          questions: d.questions || [],
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
          selectedDirectiveIds: d.selected_directive_ids || [],
          questions: d.questions || [],
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
    const linkPath = categoryData.categoryType === 'SATISFACTION' ? '/sletena/erkata?cat=' : '/sletena/submit?cat=';
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
          category_type: categoryData.categoryType || 'NEED',
          submitters_count: 0,
          shareable_link: shareableLink,
          selected_directive_ids: categoryData.selectedDirectiveIds || [],
          questions: categoryData.questions || [],
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
          woreda: d.woreda || '',
          membershipLevel: d.membership_level,
          ratings: d.ratings || {},
          topPriorityDirectives: d.top_priority_directives || [],
          additionalNeededDirectives: d.additional_needed_directives || [],
          preferredTrainingMethods: d.preferred_training_methods || [],
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
    const local = getLocalData<SletenaSubmission[]>(LOCAL_STORAGE_NEED_SUBS_KEY, []);
    return local && local.length > 0 ? local : MOCK_SUBMISSIONS;
  },

  // ==========================================
  // 6. SAVE NEED SUBMISSION
  // ==========================================
  saveNeedSubmission: async (submission: SletenaSubmission): Promise<void> => {
    try {
      // 1. Ensure category exists in Supabase to prevent foreign key violation
      const { data: existingCat } = await supabase
        .from('sletena_categories')
        .select('id')
        .eq('id', submission.categoryId)
        .maybeSingle();

      if (!existingCat) {
        await supabase.from('sletena_categories').upsert([
          {
            id: submission.categoryId,
            title: 'የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ዋና ጽ/ቤት የስልጠና ፍላጎት ማሰበሰቢያ ቅጽ',
            description: 'በሁሉም የፓርቲና የኮሚሽን መመሪያዎች ላይ የአመራር እና አባላትን የስልጠና ፍላጎት ለመሰብሰብ የተዘጋጀ::',
            date_created: new Date().toISOString().split('T')[0],
            is_active: true,
            category_type: 'NEED',
            submitters_count: 1,
            shareable_link: `https://icods.raey.work/sletena/submit?cat=${submission.categoryId}`,
          },
        ]);
      }

      // 2. Insert into sletena_submissions table
      const { error: subErr } = await supabase.from('sletena_submissions').insert([
        {
          id: submission.id,
          category_id: submission.categoryId,
          member_name: submission.memberName,
          member_id: submission.memberId,
          contact: submission.contact,
          region: submission.region,
          zone: submission.zone,
          woreda: submission.woreda,
          membership_level: submission.membershipLevel,
          ratings: submission.ratings,
          top_priority_directives: submission.topPriorityDirectives,
          additional_needed_directives: submission.additionalNeededDirectives,
          preferred_training_methods: submission.preferredTrainingMethods,
          qualitative_feedback: submission.qualitativeFeedback,
          created_at: submission.createdAt,
          updated_at: submission.updatedAt || submission.createdAt,
        },
      ]);

      if (subErr) {
        console.error('[Supabase Submission Error]:', subErr);
      } else {
        console.log('[Supabase Submission Success]: Saved to sletena_submissions table ->', submission.id);
      }
    } catch (err) {
      console.warn('Supabase insert error for need submission:', err);
    }

    const current = getLocalData<SletenaSubmission[]>(LOCAL_STORAGE_NEED_SUBS_KEY, []);
    setLocalData(LOCAL_STORAGE_NEED_SUBS_KEY, [submission, ...current]);

    // Increment submittersCount locally
    const cats = getLocalData<TrainingCategory[]>(LOCAL_STORAGE_NEED_CATS_KEY, []);
    const updatedCats = cats.map((c) => (c.id === submission.categoryId ? { ...c, submittersCount: (c.submittersCount || 0) + 1 } : c));
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
          participantEmail: d.participant_email || '',
          organizationUnit: d.organization_unit || '',
          region: d.region,
          prepVenueRating: d.prep_venue_rating || 'በጣም ከፍተኛ',
          prepDocRating: d.prep_doc_rating || 'በጣም ከፍተኛ',
          deliveryDocTrainerRating: d.delivery_doc_trainer_rating || 'በጣም ከፍተኛ',
          deliveryDocTrainerOther: d.delivery_doc_trainer_other || '',
          deliveryParticipationRating: d.delivery_participation_rating || 'በጣም ከፍተኛ',
          deliveryConclusionsRating: d.delivery_conclusions_rating || 'በጣም ከፍተኛ',
          knowledgeGainedText: d.knowledge_gained_text || d.positive_aspects || '',
          expectedResultsText: d.expected_results_text || '',
          generalImprovementText: d.general_improvement_text || d.improvement_suggestions || '',
          trainerRating: d.trainer_rating || 5,
          contentRating: d.content_rating || 5,
          venueLogisticsRating: d.venue_logistics_rating || 5,
          relevanceRating: d.relevance_rating || 5,
          overallRating: d.overall_rating || 5,
          recommendScore: d.recommend_score || 10,
          positiveAspects: d.positive_aspects || d.knowledge_gained_text || '',
          improvementSuggestions: d.improvement_suggestions || d.general_improvement_text || '',
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
          participant_email: submission.participantEmail,
          organization_unit: submission.organizationUnit,
          region: submission.region,
          prep_venue_rating: submission.prepVenueRating,
          prep_doc_rating: submission.prepDocRating,
          delivery_doc_trainer_rating: submission.deliveryDocTrainerRating,
          delivery_doc_trainer_other: submission.deliveryDocTrainerOther,
          delivery_participation_rating: submission.deliveryParticipationRating,
          delivery_conclusions_rating: submission.deliveryConclusionsRating,
          knowledge_gained_text: submission.knowledgeGainedText,
          expected_results_text: submission.expectedResultsText,
          general_improvement_text: submission.generalImprovementText,
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
    const updatedCats = cats.map((c) => (c.id === submission.categoryId ? { ...c, submittersCount: (c.submittersCount || 0) + 1 } : c));
    setLocalData(LOCAL_STORAGE_SAT_CATS_KEY, updatedCats);
  },
};
