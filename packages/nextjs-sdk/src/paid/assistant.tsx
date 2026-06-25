'use client';

import React, { useEffect, useState } from 'react';
import { usePageSeoScore, UsePageSeoScoreInput } from './use-page-seo-score';
import { useInternalLinkSuggestions } from './use-internal-link-suggestions';
import { useContentAiSuggestions } from './use-content-ai-suggestions';
import { useKeywordSuggestions } from './use-keyword-suggestions';
import {
  ContentAiResult,
  InternalLinksResult,
  KeywordIntelResult,
  ScoreContentResult,
  ScoreIssue,
  ScoreQuickWin,
} from './types';

export interface SeoAssistantProOptions {
  enableInternalLinks?: boolean;
  enableContentAi?: boolean;
  enableKeywords?: boolean;
  linksApiPath?: string;
  contentAiApiPath?: string;
  keywordsApiPath?: string;
}

export interface SeoAssistantProps {
  score?: number;
  scoreBand?: string;
  topIssues?: ScoreIssue[];
  quickWins?: ScoreQuickWin[];
  scoring?: UsePageSeoScoreInput;
  apiPath?: string;
  pro?: SeoAssistantProOptions;
  className?: string;
}

type AssistantTab = 'score' | 'links' | 'content-ai' | 'keywords';

const BAND_STYLES: Record<string, { bg: string; text: string; ring: string }> = {
  excellent: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'stroke-emerald-500' },
  good: { bg: 'bg-sky-50', text: 'text-sky-700', ring: 'stroke-sky-500' },
  needs_improvement: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'stroke-amber-500' },
  poor: { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'stroke-orange-500' },
  critical: { bg: 'bg-red-50', text: 'text-red-700', ring: 'stroke-red-500' },
};

function bandStyle(band: string) {
  return BAND_STYLES[band] ?? BAND_STYLES.needs_improvement;
}

function ScoreRing({ score, band }: { score: number; band: string }) {
  const style = bandStyle(band);
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg className="-rotate-90 h-24 w-24" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          className={style.ring}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{score}</span>
        <span className="text-[10px] uppercase tracking-wide text-gray-400">/ 100</span>
      </div>
    </div>
  );
}

function IssueList({ issues }: { issues: ScoreIssue[] }) {
  if (!issues.length) {
    return <p className="text-sm text-gray-500">No critical issues detected.</p>;
  }

  return (
    <ul className="space-y-2">
      {issues.slice(0, 5).map((issue) => (
        <li key={issue.code} className="flex items-start gap-2 text-sm">
          <span
            className={`mt-0.5 inline-flex h-2 w-2 shrink-0 rounded-full ${
              issue.severity === 'critical' || issue.severity === 'high'
                ? 'bg-red-500'
                : 'bg-amber-400'
            }`}
          />
          <div>
            <p className="font-medium text-gray-800">{issue.title}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function QuickWinList({ wins }: { wins: ScoreQuickWin[] }) {
  if (!wins.length) return null;

  return (
    <div className="mt-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
        Quick wins
      </h4>
      <ul className="space-y-2">
        {wins.slice(0, 3).map((win, i) => (
          <li key={i} className="rounded-lg bg-indigo-50/60 px-3 py-2 text-sm">
            <p className="font-medium text-indigo-900">{win.title}</p>
            <p className="text-xs text-indigo-700/80 mt-0.5">{win.recommendation}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LinksPanel({
  result,
  loading,
  error,
  onFetch,
}: {
  result: InternalLinksResult | null;
  loading: boolean;
  error: string | null;
  onFetch: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Contextual internal link opportunities.</p>
        <button
          type="button"
          onClick={onFetch}
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Suggest links'}
        </button>
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {result?.suggestions.length ? (
        <ul className="space-y-3">
          {result.suggestions.map((link) => (
            <li key={link.targetUrl} className="rounded-lg border border-gray-100 p-3 text-sm">
              <p className="font-medium text-gray-900">{link.anchorSuggestion}</p>
              <p className="mt-1 font-mono text-xs text-indigo-600 truncate">{link.targetUrl}</p>
              <p className="mt-1 text-xs text-gray-500">{link.reason}</p>
              <p className="mt-1 text-xs text-gray-400">
                Confidence {Math.round(link.confidence * 100)}%
              </p>
            </li>
          ))}
        </ul>
      ) : result ? (
        <p className="text-sm text-gray-500">No link suggestions yet. Score more pages to build the site graph.</p>
      ) : null}
    </div>
  );
}

function ContentAiPanel({
  result,
  loading,
  error,
  onFetch,
}: {
  result: ContentAiResult | null;
  loading: boolean;
  error: string | null;
  onFetch: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Title, heading, and topic suggestions.</p>
        <button
          type="button"
          onClick={onFetch}
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Get suggestions'}
        </button>
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {result && (
        <div className="space-y-4 text-sm">
          {result.suggestedTitles.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                Title ideas
              </h4>
              <ul className="space-y-1">
                {result.suggestedTitles.map((title) => (
                  <li key={title} className="rounded bg-gray-50 px-2 py-1.5 text-gray-800">
                    {title}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.suggestedDescription && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                Meta description
              </h4>
              <p className="rounded bg-gray-50 px-2 py-1.5 text-gray-700">
                {result.suggestedDescription}
              </p>
            </div>
          )}
          {result.missingTopics.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                Missing topics
              </h4>
              <ul className="flex flex-wrap gap-1">
                {result.missingTopics.slice(0, 6).map((topic) => (
                  <li key={topic} className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KeywordsPanel({
  result,
  loading,
  error,
  onFetch,
  keyword,
  country,
  onCountryChange,
}: {
  result: KeywordIntelResult | null;
  loading: boolean;
  error: string | null;
  onFetch: () => void;
  keyword: string;
  country: string;
  onCountryChange: (country: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          Related keywords for <span className="font-medium text-gray-900">{keyword || '—'}</span>
        </p>
        <div className="flex items-center gap-2">
          <select
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs bg-white"
          >
            <option value="tr">TR</option>
            <option value="us">US</option>
            <option value="de">DE</option>
            <option value="gb">GB</option>
          </select>
          <button
            type="button"
            onClick={onFetch}
            disabled={loading || !keyword?.trim()}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Research'}
          </button>
        </div>
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {result?.disclaimer && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          {result.disclaimer}
          {result.cached ? ' (cached)' : ''}
        </p>
      )}
      {result?.suggestions.length ? (
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Term</th>
                <th className="px-3 py-2 text-right font-semibold">Vol</th>
                <th className="px-3 py-2 text-right font-semibold">CPC</th>
                <th className="px-3 py-2 text-left font-semibold">Comp.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.suggestions.map((s) => (
                <tr key={s.term} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium text-gray-900">{s.term}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{s.volume ?? '—'}</td>
                  <td className="px-3 py-2 text-right text-gray-600">
                    {s.cpc != null ? `$${s.cpc}` : '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-600 capitalize">{s.competition ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : result ? (
        <p className="text-sm text-gray-500">No keyword suggestions returned.</p>
      ) : (
        <p className="text-sm text-gray-500">Click Research to load volume, CPC, and competition data.</p>
      )}
    </div>
  );
}

function ScorePanel({
  result,
  loading,
  error,
  onScore,
  scoreButtonLabel,
  staticScore,
  staticBand,
  staticIssues,
  staticWins,
}: {
  result: ScoreContentResult | null;
  loading: boolean;
  error: string | null;
  onScore?: () => void;
  scoreButtonLabel?: string;
  staticScore?: number;
  staticBand?: string;
  staticIssues?: ScoreIssue[];
  staticWins?: ScoreQuickWin[];
}) {
  const score = result?.finalScore ?? staticScore;
  const band = result?.scoreBand ?? staticBand ?? 'unknown';
  const issues = result?.topIssues ?? staticIssues ?? [];
  const wins = result?.quickWins ?? staticWins ?? [];
  const style = bandStyle(band);

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {score !== undefined ? (
        <div className="flex items-center gap-5">
          <ScoreRing score={score} band={band} />
          <div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${style.bg} ${style.text}`}
            >
              {band.replace(/_/g, ' ')}
            </span>
            {onScore && (
              <button
                type="button"
                onClick={onScore}
                disabled={loading}
                className="mt-3 block rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Scoring…' : 'Score again'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {scoreButtonLabel === 'Scan URL'
              ? 'Enter a URL and scan the live page.'
              : 'Analyze this page for SEO issues.'}
          </p>
          {onScore && (
            <button
              type="button"
              onClick={onScore}
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Scanning…' : scoreButtonLabel ?? 'Score now'}
            </button>
          )}
        </div>
      )}

      {(score !== undefined || issues.length > 0) && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            Top issues
          </h4>
          <IssueList issues={issues} />
          <QuickWinList wins={wins} />
        </div>
      )}
    </>
  );
}

function AssistantShell({
  tabs,
  activeTab,
  onTabChange,
  children,
}: {
  tabs: Array<{ id: AssistantTab; label: string }>;
  activeTab: AssistantTab;
  onTabChange: (tab: AssistantTab) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">SEO Assistant</h3>
        <p className="text-xs text-gray-500 mt-0.5">Powered by GSeoSuite</p>
        {tabs.length > 1 && (
          <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`rounded-md px-2 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function SeoAssistant({
  score,
  scoreBand,
  topIssues,
  quickWins,
  scoring,
  apiPath,
  pro,
  className,
}: SeoAssistantProps) {
  if (scoring) {
    return (
      <div className={className}>
        <SeoAssistantLive scoring={scoring} apiPath={apiPath} pro={pro} />
      </div>
    );
  }

  return (
    <div className={className}>
      <AssistantShell tabs={[{ id: 'score', label: 'Score' }]} activeTab="score" onTabChange={() => {}}>
        <ScorePanel
          result={null}
          loading={false}
          error={null}
          staticScore={score}
          staticBand={scoreBand}
          staticIssues={topIssues}
          staticWins={quickWins}
        />
      </AssistantShell>
    </div>
  );
}

function SeoAssistantLive({
  scoring,
  apiPath,
  pro,
}: {
  scoring: UsePageSeoScoreInput;
  apiPath?: string;
  pro?: SeoAssistantProOptions;
}) {
  const [activeTab, setActiveTab] = useState<AssistantTab>('score');
  const { result, loading, error, score, pageHtml } = usePageSeoScore(scoring, { apiPath });

  const resolvedHtml = scoring.html || pageHtml || '';
  const resolvedUrl = result?.url ?? scoring.url;

  const linksEnabled = pro?.enableInternalLinks !== false && pro !== undefined;
  const contentAiEnabled = pro?.enableContentAi !== false && pro !== undefined;
  const keywordsEnabled = pro?.enableKeywords !== false && pro !== undefined;
  const showPro = linksEnabled || contentAiEnabled || keywordsEnabled;

  const [keywordCountry, setKeywordCountry] = useState('tr');

  const links = useInternalLinkSuggestions(
    {
      siteId: scoring.siteId,
      sourceUrl: resolvedUrl,
      html: resolvedHtml || undefined,
      targetKeyword: scoring.targetKeyword,
      pageType: scoring.pageType,
    },
    { apiPath: pro?.linksApiPath }
  );

  const contentAi = useContentAiSuggestions(
    {
      html: resolvedHtml,
      url: resolvedUrl,
      targetKeyword: scoring.targetKeyword,
      pageType: scoring.pageType,
    },
    { apiPath: pro?.contentAiApiPath }
  );

  const keywords = useKeywordSuggestions(
    {
      keyword: scoring.targetKeyword ?? '',
      country: keywordCountry,
      mode: 'research',
    },
    { apiPath: pro?.keywordsApiPath }
  );

  const tabs: Array<{ id: AssistantTab; label: string }> = [{ id: 'score', label: 'Score' }];
  if (linksEnabled) tabs.push({ id: 'links', label: 'Links' });
  if (contentAiEnabled) tabs.push({ id: 'content-ai', label: 'Content' });
  if (keywordsEnabled) tabs.push({ id: 'keywords', label: 'Keywords' });

  useEffect(() => {
    if (activeTab === 'keywords' && keywordsEnabled && !keywords.result && !keywords.loading) {
      void keywords.fetch();
    }
  }, [activeTab, keywordsEnabled, keywords.result, keywords.loading, keywords.fetch]);

  if (!showPro) {
    return (
      <AssistantShell tabs={tabs} activeTab="score" onTabChange={setActiveTab}>
        <ScorePanel result={result} loading={loading} error={error} onScore={score} />
      </AssistantShell>
    );
  }

  return (
    <AssistantShell tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'score' && (
        <ScorePanel
          result={result}
          loading={loading}
          error={error}
          onScore={score}
          scoreButtonLabel={scoring.scoreMode === 'url' || !scoring.html ? 'Scan URL' : undefined}
        />
      )}
      {activeTab === 'links' && linksEnabled && (
        <LinksPanel
          result={links.result}
          loading={links.loading}
          error={
            links.error ||
            (!resolvedHtml && result ? 'Scan the URL first to load page HTML for link suggestions.' : null)
          }
          onFetch={links.fetch}
        />
      )}
      {activeTab === 'content-ai' && contentAiEnabled && (
        <ContentAiPanel
          result={contentAi.result}
          loading={contentAi.loading}
          error={
            contentAi.error ||
            (!resolvedHtml && result ? 'Scan the URL first to load page HTML for content suggestions.' : null)
          }
          onFetch={contentAi.fetch}
        />
      )}
      {activeTab === 'keywords' && keywordsEnabled && (
        <KeywordsPanel
          result={keywords.result}
          loading={keywords.loading}
          error={keywords.error}
          onFetch={keywords.fetch}
          keyword={scoring.targetKeyword ?? ''}
          country={keywordCountry}
          onCountryChange={setKeywordCountry}
        />
      )}
    </AssistantShell>
  );
}
