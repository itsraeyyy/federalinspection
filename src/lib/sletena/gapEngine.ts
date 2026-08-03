import { GapAnalysisItem, InspectionDirective, SletenaSubmission, PriorityLevel } from '@/types/sletena';
import { INSPECTION_DIRECTIVES } from '@/data/sletenaDirectives';

/**
 * Calculates Knowledge Gaps across submissions.
 * Formula: Gap = Target - Current
 * Priority Flagging: If Gap > 2.0 -> HIGH, 1.0 < Gap <= 2.0 -> MEDIUM, Gap <= 1.0 -> LOW
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
      priorityFlag: d.targetScore > 2.0 ? 'HIGH' : 'MEDIUM',
    }));
  }

  return directives.map((directive) => {
    let totalScore = 0;
    let count = 0;

    submissions.forEach((sub) => {
      const score = sub.ratings[directive.id];
      if (typeof score === 'number' && score >= 1 && score <= 5) {
        totalScore += score;
        count += 1;
      }
    });

    const currentScore = count > 0 ? Number((totalScore / count).toFixed(2)) : 0;
    const gap = Number((directive.targetScore - currentScore).toFixed(2));

    let priorityFlag: PriorityLevel = 'LOW';
    if (gap > 2.0) {
      priorityFlag = 'HIGH';
    } else if (gap > 1.0) {
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
