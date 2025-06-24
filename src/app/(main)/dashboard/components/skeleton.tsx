import React from "react";

// Skeleton for stat cards
export function StatCardSkeleton() {
  return (
    <div className="shadow-sm rounded-md p-4 bg-gradient-to-r from-gray-100 to-white animate-pulse">
      <div className="flex justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-1/2"></div>
        </div>
        <div className="p-3 rounded-full bg-gray-300 h-fit w-12 h-12"></div>
      </div>
    </div>
  );
}

// Skeleton for chart containers
export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-md p-4 shadow-md animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-5 bg-gray-300 rounded w-32"></div>
      </div>
      <div className="h-6 bg-gray-300 rounded w-24 mb-4"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );
}

// Skeleton for table
export function TableSkeleton() {
  return (
    <div className="bg-white rounded-md shadow-md p-4 animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
      <div className="space-y-3">
        {/* Table header */}
        <div className="grid grid-cols-6 gap-4 py-2 border-b border-gray-200">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-300 rounded"></div>
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-6 gap-4 py-2">
            {Array.from({ length: 6 }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton for the entire dashboard
export function DashboardSkeleton() {
  return (
    <div className="p-4 lg:p-8">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-gray-300 rounded w-32"></div>
        <div className="w-64">
          <div className="h-10 bg-gray-300 rounded"></div>
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 mt-8 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Table skeleton */}
      <div className="mt-8">
        <TableSkeleton />
      </div>
    </div>
  );
}
