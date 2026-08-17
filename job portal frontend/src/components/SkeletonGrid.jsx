import React from 'react';

export function JobCardSkeleton() {
  return (
    <div className="bg-[#10205F] border border-white/5 rounded-2xl p-6 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-white/10 flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-3.5 bg-white/10 rounded w-3/4" />
          <div className="h-2.5 bg-white/5 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mt-5">
        <div className="h-2.5 bg-white/5 rounded w-full" />
        <div className="h-2.5 bg-white/5 rounded w-5/6" />
        <div className="h-2.5 bg-white/5 rounded w-2/3" />
      </div>
      <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
        <div className="h-2.5 bg-white/5 rounded w-20" />
        <div className="h-8 bg-white/10 rounded-xl w-24" />
      </div>
    </div>
  );
}

export default function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}
