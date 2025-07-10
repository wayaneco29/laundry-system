import {
  HeaderWithButtonSkeleton,
  TableSkeleton,
} from "../dashboard/components/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8 animate-pulse">
      <HeaderWithButtonSkeleton />
      <TableSkeleton />
    </div>
  );
}
