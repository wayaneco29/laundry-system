import { OrdersTable } from "@/app/components";

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-gray-700 text-2xl font-medium">Orders</h1>
      </div>
      <div className="mt-4">
        <div className="flex flex-col">
          <OrdersTable />
        </div>
      </div>
    </div>
  );
}
