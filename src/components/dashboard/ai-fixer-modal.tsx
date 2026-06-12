'use client';

import { useState } from 'react';
import { Sparkles, X, Check, ArrowRight } from 'lucide-react';

interface AiFixerModalProps {
  isOpen: boolean;
  onClose: () => void;
  issueTitle: string;
  issueCode: string;
}

export function AiFixerModal({ isOpen, onClose, issueTitle, issueCode }: AiFixerModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI delay
    setTimeout(() => {
      setIsGenerating(false);
      setSuggestion("Discover our premium SEO tools designed to boost your AI visibility and search rankings. Start your free trial today and dominate the SERPs.");
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">AI Fixer</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Target Issue</h4>
            <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-sm text-red-900 flex items-start gap-2">
              <span className="font-mono text-xs bg-red-100 px-1 py-0.5 rounded text-red-800">{issueCode}</span>
              <span className="font-medium">{issueTitle}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">AI Solution Generator</h4>
            {!suggestion && !isGenerating && (
              <button 
                onClick={handleGenerate}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                Generate Solution
              </button>
            )}

            {isGenerating && (
              <div className="w-full bg-purple-50 border border-purple-100 py-6 rounded-xl flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-purple-700 font-medium animate-pulse">Analyzing context & generating fix...</span>
              </div>
            )}

            {suggestion && (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                  <div className="text-xs font-semibold text-gray-500 mb-2">Suggested Output</div>
                  <p className="text-sm text-gray-900 font-medium">{suggestion}</p>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={handleGenerate}
                    className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Regenerate
                  </button>
                  <button 
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-400 py-2.5 rounded-lg text-sm font-bold cursor-not-allowed border border-gray-200"
                    title="CMS write-back is coming soon in Phase 2"
                  >
                    <Check className="w-4 h-4" />
                    Apply to CMS
                    <span className="text-[10px] bg-gray-200 text-gray-500 px-1 py-0.5 rounded uppercase">Mock</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
