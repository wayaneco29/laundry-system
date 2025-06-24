import {
  HeaderWithButtonSkeleton,
  StatsCardsSkeleton,
  TableSkeleton,
} from "../dashboard/components/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8 animate-pulse">
      <HeaderWithButtonSkeleton />
      <StatsCardsSkeleton count={2} />
      <div className="flex gap-4 mb-2">
        <div className="h-10 w-48 bg-gray-200 rounded"></div>
        <div className="h-10 w-48 bg-gray-200 rounded"></div>
      </div>
      <TableSkeleton />
    </div>
  );
}
