/**
 * Sletena Module - Core Type Definitions & Database Interfaces
 * Module: Training Management & Analytics (Sletena)
 */

export type MembershipLevel =
  | 'Abal'
  | 'Yebeteseb_Amerar'
  | 'Yehbret_Amerar'
  | 'Yebatach_Amerar'
  | 'Mekakelegna_Amerar'
  | 'Keftegna_Amerar'
  | 'Yebeteseb_Yehbret_Amerar'
  | 'Level_1'
  | 'Level_2'
  | 'Level_3'
  | 'Level_4'
  | 'Level_5'
  | 'Junior'
  | 'Senior'
  | 'Executive';

export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type SentimentCategory = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

export type TrainingModuleType = 'NEED' | 'SATISFACTION';

/**
 * Inspection Directive (INS-01 through INS-27)
 */
export interface InspectionDirective {
  id: string;          // Primary key (e.g. 'INS-01')
  code: string;        // Directive code ('INS-01' to 'INS-27')
  title: string;       // Directive Title
  description: string; // Directive description / standards
  category: string;    // Operational category
  targetScore: number; // Target benchmark score (default: 5.0)
}

/**
 * Google Form-style Form Question entity
 */
export interface FormQuestion {
  id: string;          // Directive ID (e.g. 'INS-01') or custom ID
  code: string;        // Directive code ('INS-01') or question code ('Q-1')
  title: string;       // Question title
  description: string; // Question description / instructions
  category: string;    // Operational category
  targetScore: number; // Target benchmark score (default: 5.0)
  questionType?: 'likert_1_5' | 'text' | 'multiple_choice';
  isRequired?: boolean;
}

/**
 * Data Management Table Category entity (Google Form-like object)
 */
export interface TrainingCategory {
  id: string;
  title: string;
  description: string;
  dateCreated: string;
  submittersCount: number;
  isActive: boolean;
  shareableLink: string;
  categoryType?: TrainingModuleType; // 'NEED' (ፍላጎት) or 'SATISFACTION' (ዕርካታ)
  selectedDirectiveIds?: string[]; // Checked directive IDs from the 27 directives
  questions?: FormQuestion[];     // Full list of CRUD questions for this training form
  maxWoredas?: number;            // Configurable Woreda dropdown count (default: 14)
}

/**
 * Form Submission Payload
 */
export interface SletenaSubmission {
  id: string;
  categoryId: string;
  memberId: string;
  memberName: string;
  contact?: string;
  membershipLevel: MembershipLevel;
  ratings: Record<string, number>; // Map of directiveId/questionId -> score (1 to 5)
  topPriorityDirectives: [string, string, string] | string[]; // Top selections
  additionalNeededDirectives?: string[]; // Checkmarked additional training directives for section 3
  preferredTrainingMethods?: string[];   // Preferred training methods and materials for section 4
  qualitativeFeedback?: string;
  region: string;
  zone: string;
  woreda?: string;
  createdAt: string;
  updatedAt?: string;
  isDraft?: boolean;
}

/**
 * Analytics Engine: Knowledge Gap Analysis Item
 * Gap = Target - Current
 * Flagged HIGH if Gap > 2.0
 */
export interface GapAnalysisItem {
  directiveId: string;
  directiveCode: string;
  directiveTitle: string;
  category: string;
  targetScore: number;
  currentScore: number;
  gap: number;
  priorityFlag: PriorityLevel;
}

/**
 * Heatmap Matrix for Regional & Zonal Knowledge Gaps
 */
export interface RegionalGapMatrix {
  region: string;
  zone: string;
  categoryGaps: Record<string, number>; // Category name -> Average Gap
  overallAvgGap: number;
}

/**
 * Net Promoter Score (NPS) Aggregate Metrics
 * NPS = % Promoters (Score 5) - % Detractors (Score 1-3)
 */
export interface NPSBreakdown {
  totalResponses: number;
  promotersCount: number;  // Rating = 5
  passivesCount: number;   // Rating = 4
  detractorsCount: number; // Rating = 1-3
  promotersPct: number;
  detractorsPct: number;
  npsScore: number;        // Scale: -100 to +100
}

/**
 * Sentiment Analysis (NLP Integration Mock Layer)
 */
export interface SentimentAnalysisResult {
  totalAnalyzed: number;
  positivePct: number;
  negativePct: number;
  neutralPct: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  topKeywords: Array<{
    word: string;
    count: number;
    sentiment: SentimentCategory;
  }>;
  categorizedFeedback: Array<{
    id: string;
    text: string;
    sentiment: SentimentCategory;
    score: number; // Confidence 0.0 - 1.0
    date: string;
  }>;
}

/**
 * Post-Training Satisfaction Submission Entity
 */
export interface SatisfactionSubmission {
  id: string;
  categoryId: string;
  categoryTitle?: string;
  participantName: string;
  memberId?: string;
  contact?: string;
  membershipLevel?: MembershipLevel;
  participantEmail?: string;
  organizationUnit?: string;
  region: string;
  zone?: string;
  woreda?: string;
  // Specific Satisfaction Form Fields (Sections 1 through 5)
  prepVenueRating?: string;            // 1.ሀ ከስልጠና ቦታ እና ከስልጠና ቁሳቁስ ማሟላት አኳያ
  prepDocRating?: string;              // 1.ለ ከስልጠናው ሰነድ ዝግጅት አኳያ
  deliveryDocTrainerRating?: string;   // 2.ሀ ከስልጠና ሰነድ አቀራረብና ከአሰልጣኙ ዝግጅት አኳያ
  deliveryDocTrainerOther?: string;    // 2.ሀ Other custom text if selected
  deliveryParticipationRating?: string;// 2.ለ ከሰልጣኞች ተሳትፎና የሃሳብ ነጻነትና ጥራት አኳያ
  deliveryConclusionsRating?: string;  // 2.ሐ በተነሱሃሳቦች ላይ የተሰጡ የጋራ መደምደሚያ ነጥቦች አኳያ
  knowledgeGainedText?: string;        // 3. ስልጠናዉ ላይ በመሳተፍዎ ያገኙት ተጨማሪ እውቀትና ግንዛቤ...
  expectedResultsText?: string;        // 4. እርስዎ ጨምሮ ከሌሎች የስልጠና ተሳታፊዎች በቀጣይ ምን ውጤት እንጠብቅ?
  generalImprovementText?: string;     // 5. አጠቃላይ ከስልጠናው ቅድመ ዝግጅት ጀምሮ...
  // Legacy / Numeric aggregations for charts & backwards compatibility
  trainerRating: number;        // 1 to 5 scale
  contentRating: number;        // 1 to 5 scale
  venueLogisticsRating: number; // 1 to 5 scale
  relevanceRating: number;      // 1 to 5 scale
  overallRating: number;        // 1 to 5 scale
  recommendScore: number;       // 1 to 10 scale (NPS)
  positiveAspects?: string;
  improvementSuggestions?: string;
  submittedAt?: string;
  createdAt?: string;
}

/**
 * Satisfaction Engine Metrics Summary
 */
export interface SatisfactionMetrics {
  totalEvaluations: number;
  overallCsatPct: number;          // e.g. 92%
  avgTrainerScore: number;         // e.g. 4.7 / 5
  avgContentScore: number;         // e.g. 4.6 / 5
  avgVenueScore: number;           // e.g. 4.3 / 5
  avgRelevanceScore: number;       // e.g. 4.8 / 5
  avgOverallScore: number;         // e.g. 4.7 / 5
  npsScore: number;                // Net Promoter Score (-100 to +100)
  promotersPct: number;
  passivesPct: number;
  detractorsPct: number;
}
