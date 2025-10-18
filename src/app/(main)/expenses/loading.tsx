import {
  HeaderWithButtonSkeleton,
  StatCardSkeleton,
  TableSkeleton,
} from "../dashboard/components/skeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-6 lg:p-8 animate-pulse">
      {/* Header */}
      <HeaderWithButtonSkeleton />

      {/* Expense Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-64">
          <div className="h-5 bg-gray-300 rounded w-16 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="w-full sm:w-64">
          <div className="h-5 bg-gray-300 rounded w-24 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow">
        <TableSkeleton />
      </div>
    </div>
  );
}
