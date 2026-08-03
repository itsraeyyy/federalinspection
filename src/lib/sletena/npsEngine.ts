import { NPSBreakdown, SletenaSubmission } from '@/types/sletena';

/**
 * Net Promoter Score (NPS) Aggregator
 * Evaluates submitted Likert scale scores across all directives.
 * Promoters (Score 5)
 * Passives (Score 4)
 * Detractors (Score 1 - 3)
 * NPS = % Promoters - % Detractors
 */
export function calculateNPS(submissions: SletenaSubmission[]): NPSBreakdown {
  let promotersCount = 0;
  let passivesCount = 0;
  let detractorsCount = 0;
  let totalRatings = 0;

  submissions.forEach((sub) => {
    Object.values(sub.ratings).forEach((score) => {
      if (typeof score === 'number' && score >= 1 && score <= 5) {
        totalRatings += 1;
        if (score === 5) {
          promotersCount += 1;
        } else if (score === 4) {
          passivesCount += 1;
        } else if (score <= 3) {
          detractorsCount += 1;
        }
      }
    });
  });

  if (totalRatings === 0) {
    return {
      totalResponses: 0,
      promotersCount: 0,
      passivesCount: 0,
      detractorsCount: 0,
      promotersPct: 0,
      detractorsPct: 0,
      npsScore: 0,
    };
  }

  const promotersPct = Number(((promotersCount / totalRatings) * 100).toFixed(1));
  const detractorsPct = Number(((detractorsCount / totalRatings) * 100).toFixed(1));
  const npsScore = Number((promotersPct - detractorsPct).toFixed(1));

  return {
    totalResponses: totalRatings,
    promotersCount,
    passivesCount,
    detractorsCount,
    promotersPct,
    detractorsPct,
    npsScore,
  };
}
