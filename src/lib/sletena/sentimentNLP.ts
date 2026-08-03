import { SentimentAnalysisResult, SentimentCategory, SletenaSubmission } from '@/types/sletena';

const POSITIVE_KEYWORDS = ['excellent', 'good', 'improved', 'effective', 'strong', 'clear', 'well', 'high', 'efficient', 'great', 'successful', 'aligned'];
const NEGATIVE_KEYWORDS = ['poor', 'lack', 'need', 'low', 'urgent', 'delay', 'risk', 'fail', 'weak', 'insufficient', 'problem', 'critical', 'issue', 'gap'];

/**
 * Mock NLP Integration Layer for Sentiment Analysis
 * Analyzes open-ended text feedback from submissions.
 */
export function analyzeSentiment(submissions: SletenaSubmission[]): SentimentAnalysisResult {
  const categorizedFeedback: SentimentAnalysisResult['categorizedFeedback'] = [];
  const keywordMap: Record<string, { count: number; sentiment: SentimentCategory }> = {};

  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  submissions.forEach((sub) => {
    if (!sub.qualitativeFeedback || sub.qualitativeFeedback.trim().length === 0) {
      return;
    }

    const text = sub.qualitativeFeedback.trim();
    const lower = text.toLowerCase();

    let posHits = 0;
    let negHits = 0;

    POSITIVE_KEYWORDS.forEach((word) => {
      if (lower.includes(word)) {
        posHits += 1;
        keywordMap[word] = {
          count: (keywordMap[word]?.count || 0) + 1,
          sentiment: 'POSITIVE',
        };
      }
    });

    NEGATIVE_KEYWORDS.forEach((word) => {
      if (lower.includes(word)) {
        negHits += 1;
        keywordMap[word] = {
          count: (keywordMap[word]?.count || 0) + 1,
          sentiment: 'NEGATIVE',
        };
      }
    });

    let sentiment: SentimentCategory = 'NEUTRAL';
    let score = 0.5;

    if (negHits > posHits) {
      sentiment = 'NEGATIVE';
      negativeCount += 1;
      score = Number((0.6 + Math.min(negHits * 0.1, 0.35)).toFixed(2));
    } else if (posHits > negHits) {
      sentiment = 'POSITIVE';
      positiveCount += 1;
      score = Number((0.6 + Math.min(posHits * 0.1, 0.35)).toFixed(2));
    } else {
      neutralCount += 1;
      score = 0.5;
    }

    categorizedFeedback.push({
      id: sub.id,
      text,
      sentiment,
      score,
      date: sub.createdAt ? sub.createdAt.split('T')[0] : '2026-08-01',
    });
  });

  const totalAnalyzed = categorizedFeedback.length;
  const positivePct = totalAnalyzed > 0 ? Number(((positiveCount / totalAnalyzed) * 100).toFixed(1)) : 0;
  const negativePct = totalAnalyzed > 0 ? Number(((negativeCount / totalAnalyzed) * 100).toFixed(1)) : 0;
  const neutralPct = totalAnalyzed > 0 ? Number(((neutralCount / totalAnalyzed) * 100).toFixed(1)) : 0;

  const topKeywords = Object.entries(keywordMap)
    .map(([word, data]) => ({
      word: word.toUpperCase(),
      count: data.count,
      sentiment: data.sentiment,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalAnalyzed,
    positivePct,
    negativePct,
    neutralPct,
    positiveCount,
    negativeCount,
    neutralCount,
    topKeywords,
    categorizedFeedback,
  };
}
