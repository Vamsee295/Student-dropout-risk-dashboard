/**
 * Shared UI Component: ErrorState
 * Non-intrusive error card with optional retry button.
 * Use inside any dashboard section that may fail to load data.
 */

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  /** Short title shown in the error card */
  title?: string;
  /** Detailed message (e.g., error.message) */
  message?: string;
  /** Called when the user clicks "Try Again" */
  onRetry?: () => void;
  /** Make it fill the whole screen height */
  fullPage?: boolean;
}

export function ErrorState({
  title = 'Failed to load data',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  fullPage = false,
}: ErrorStateProps) {
  return (
    <div
      className={`flex items-center justify-center ${
        fullPage ? 'min-h-[60vh]' : 'py-10'
      }`}
    >
      <div className="text-center max-w-sm mx-auto px-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={26} className="text-red-500" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-5">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-700 transition-all"
          >
            <RefreshCw size={13} />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

/** Inline error banner — use inside a card that failed */
export function ErrorBanner({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
      <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
      <p className="text-xs text-red-700 font-medium flex-1">
        {message || 'Could not load this section.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex-shrink-0 text-xs font-bold text-red-600 hover:text-red-800 underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}
