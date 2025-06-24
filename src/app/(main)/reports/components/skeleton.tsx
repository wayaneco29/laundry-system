import React from "react";
import {
  ChartSkeleton,
  StatCardSkeleton,
  TableSkeleton,
} from "../../dashboard/components/skeleton";

export function ReportsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-80"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-gray-200 rounded mr-2"></div>
          <div className="h-10 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>

      {/* Date Filter skeleton */}
      <div className="flex gap-4 mb-2">
        <div className="h-10 w-48 bg-gray-200 rounded"></div>
        <div className="h-10 w-48 bg-gray-200 rounded"></div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex space-x-8 border-b border-gray-200 mb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-32 bg-gray-200 rounded-t"></div>
        ))}
      </div>

      {/* Content skeleton: chart + stats */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        <ChartSkeleton />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Table skeleton for tab content */}
      <TableSkeleton />
    </div>
  );
}
