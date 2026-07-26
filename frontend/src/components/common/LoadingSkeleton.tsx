/**
 * Shared UI Component: LoadingSkeleton
 * Reusable skeleton loaders that match the dimensions of real dashboard cards,
 * charts, and table rows. Use these in hooks while data is loading.
 */

import React from 'react';

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-slate-200 rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
}

/** Matches a single KPI stat card */
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <Skeleton className="w-9 h-9 rounded-xl mb-3" />
      <Skeleton className="h-3 w-16 mb-2" />
      <Skeleton className="h-7 w-20 mb-2" />
      <Skeleton className="h-2.5 w-24" />
    </div>
  );
}

/** Matches a chart / analytics card */
export function ChartCardSkeleton({ height = 160 }: { height?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3.5 w-16" />
      </div>
      <div className="w-full rounded-xl" style={{ height }}>
        <Skeleton className="w-full h-full rounded-xl" />
      </div>
    </div>
  );
}

/** Matches a table row */
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-3.5 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

/** Matches a list-item card (e.g., at-risk student card) */
export function ListCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-2.5 w-48" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Full dashboard page skeleton — grid of 4 stat cards + 3 charts */
export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero banner skeleton */}
      <Skeleton className="w-full h-36 rounded-2xl" />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <ChartCardSkeleton key={i} height={160} />
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <ChartCardSkeleton key={i} height={200} />
        ))}
      </div>
    </div>
  );
}
