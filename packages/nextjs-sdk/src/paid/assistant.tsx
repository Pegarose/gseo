import React from 'react';

export interface SeoAssistantProps {
  score?: number;
  quickWins?: { title: string; recommendation: string }[];
}

export function SeoAssistant({ score, quickWins }: SeoAssistantProps) {
  return (
    <div className="seosuite-assistant border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-2">GSeoSuite Assistant</h3>
      {score !== undefined && (
        <p className="text-sm text-gray-600">Current page score: <strong>{score}/100</strong></p>
      )}
      {quickWins && quickWins.length > 0 && (
        <ul className="mt-3 space-y-2">
          {quickWins.map((win, index) => (
            <li key={index} className="text-sm text-gray-700">
              <strong>{win.title}</strong>: {win.recommendation}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
