import { GapAnalysisItem, InspectionDirective, SletenaSubmission, PriorityLevel } from '@/types/sletena';
import { INSPECTION_DIRECTIVES } from '@/data/sletenaDirectives';

/**
 * Calculates Training Need Intensity across submissions.
 * Priority Flagging: If Average Need Score >= 3.8 -> HIGH, 2.5 <= Score < 3.8 -> MEDIUM, Score < 2.5 -> LOW
 */
export function calculateKnowledgeGaps(
  submissions: SletenaSubmission[],
  directives: InspectionDirective[] = INSPECTION_DIRECTIVES
): GapAnalysisItem[] {
  if (!submissions || submissions.length === 0) {
    return directives.map((d) => ({
      directiveId: d.id,
      directiveCode: d.code,
      directiveTitle: d.title,
      category: d.category,
      targetScore: d.targetScore,
      currentScore: 0,
      gap: d.targetScore,
      priorityFlag: 'LOW',
    }));
  }

  return directives.map((directive) => {
    let totalScore = 0;
    let count = 0;

    submissions.forEach((sub) => {
      const score = sub.ratings
        ? sub.ratings[directive.id] ?? sub.ratings[directive.code]
        : undefined;
      if (typeof score === 'number' && score >= 1 && score <= 5) {
        totalScore += score;
        count += 1;
      }
    });

    const currentScore = count > 0 ? Number((totalScore / count).toFixed(2)) : 0;
    const gap = currentScore; // Represents training demand intensity score

    let priorityFlag: PriorityLevel = 'LOW';
    if (currentScore >= 3.8) {
      priorityFlag = 'HIGH';
    } else if (currentScore >= 2.5) {
      priorityFlag = 'MEDIUM';
    }

    return {
      directiveId: directive.id,
      directiveCode: directive.code,
      directiveTitle: directive.title,
      category: directive.category,
      targetScore: directive.targetScore,
      currentScore,
      gap,
      priorityFlag,
    };
  });
}

/**
 * Automatically calculates high training needs (top 3 highest-rated directives)
 * from a submission's ratings payload where 5 (በጣም ከፍተኛ) represents highest training need.
 */
export function extractAutoHighNeeds(ratings: Record<string, number>): [string, string, string] {
  const entries = Object.entries(ratings);
  if (entries.length === 0) {
    return ['INS-01', 'INS-02', 'INS-03'];
  }

  // Sort ratings descending (highest score = highest training need)
  entries.sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

  const top3 = entries.slice(0, 3).map(([id]) => id);
  return [
    top3[0] || 'INS-01',
    top3[1] || 'INS-02',
    top3[2] || 'INS-03',
  ];
}
