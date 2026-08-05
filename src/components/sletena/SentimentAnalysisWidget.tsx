'use client';

import React from 'react';
import { SentimentAnalysisResult } from '@/types/sletena';
import { IconBrain, IconThumbUp, IconThumbDown, IconMessageCircle, IconQuote } from '@tabler/icons-react';

interface SentimentAnalysisWidgetProps {
  sentiment: SentimentAnalysisResult;
}

export const SentimentAnalysisWidget: React.FC<SentimentAnalysisWidgetProps> = ({ sentiment }) => {
  return (
    <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border/40">
        <div>
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <IconBrain className="text-brand-blue" size={22} />
            የአስተያየቶች ስሜት ትንተና (Sentiment NLP)
          </h3>
          <p className="text-xs text-text-muted mt-1">
            በተሳታፊዎች የተፃፉ አስተያየቶችን በራስ-ሰር የተፈጥሮ ቋንቋ ፕሮሰሲንግ (NLP) ወደ አዎንታዊ፣ አሉታዊ እና ገለልተኛ የሚደልል::
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-xl border border-brand-blue/20">
            {sentiment.totalAnalyzed} የተተነተኑ አስተያየቶች
          </span>
        </div>
      </div>

      {/* Sentiment Summary Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-emerald-600 flex items-center gap-1">
            <IconThumbUp size={14} /> አዎንታዊ: {sentiment.positivePct}% ({sentiment.positiveCount})
          </span>
          <span className="text-text-muted">ገለልተኛ: {sentiment.neutralPct}% ({sentiment.neutralCount})</span>
          <span className="text-red-600 flex items-center gap-1">
            <IconThumbDown size={14} /> አሉታዊ: {sentiment.negativePct}% ({sentiment.negativeCount})
          </span>
        </div>

        <div className="w-full h-3 bg-surface-secondary rounded-full overflow-hidden flex border border-border/30">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${sentiment.positivePct}%` }}
            title={`አዎንታዊ: ${sentiment.positivePct}%`}
          />
          <div
            className="h-full bg-gray-400 opacity-60 transition-all duration-500"
            style={{ width: `${sentiment.neutralPct}%` }}
            title={`ገለልተኛ: ${sentiment.neutralPct}%`}
          />
          <div
            className="h-full bg-red-500 transition-all duration-500"
            style={{ width: `${sentiment.negativePct}%` }}
            title={`አሉታዊ: ${sentiment.negativePct}%`}
          />
        </div>
      </div>

      {/* Top Keywords Pills */}
      <div className="space-y-2 pt-2">
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide">
          በአስተያየቶች ውስጥ ጎልተው የወጡ ቁልፍ ቃላት:
        </h4>
        <div className="flex flex-wrap gap-2">
          {sentiment.topKeywords.length === 0 ? (
            <span className="text-xs text-text-muted">ምንም ቁልፍ ቃል አልተወጣችም።</span>
          ) : (
            sentiment.topKeywords.map((kw) => (
              <span
                key={kw.word}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                  kw.sentiment === 'POSITIVE'
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : kw.sentiment === 'NEGATIVE'
                    ? 'bg-red-500/10 text-red-600 border-red-500/20'
                    : 'bg-surface-secondary text-text-secondary border-border/50'
                }`}
              >
                <span>{kw.word}</span>
                <span className="opacity-70 font-normal">({kw.count})</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Categorized Feedback Feed */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide flex items-center gap-1.5">
          <IconMessageCircle size={16} /> የተተነተኑ የሰራተኞች አስተያየቶች:
        </h4>

        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {sentiment.categorizedFeedback.length === 0 ? (
            <div className="p-4 text-center text-xs text-text-muted bg-surface-secondary/20 rounded-xl">
              ምንም የተፃፈ አስተያየት አልተገኘም።
            </div>
          ) : (
            sentiment.categorizedFeedback.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border space-y-2 transition-all ${
                  item.sentiment === 'POSITIVE'
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : item.sentiment === 'NEGATIVE'
                    ? 'bg-red-500/5 border-red-500/30'
                    : 'bg-surface-secondary/30 border-border/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                      item.sentiment === 'POSITIVE'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : item.sentiment === 'NEGATIVE'
                        ? 'bg-red-500/10 text-red-600'
                        : 'bg-gray-500/10 text-gray-600'
                    }`}
                  >
                    {item.sentiment === 'POSITIVE' ? 'አዎንታዊ' : item.sentiment === 'NEGATIVE' ? 'አሉታዊ' : 'ገለልተኛ'} ({(item.score * 100).toFixed(0)}% እርግጠኝነት)
                  </span>
                  <span className="text-[11px] text-text-muted">{item.date}</span>
                </div>

                <p className="text-xs text-text-primary italic flex items-start gap-1.5">
                  <IconQuote size={14} className="text-text-muted shrink-0 mt-0.5" />
                  <span>"{item.text}"</span>
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
