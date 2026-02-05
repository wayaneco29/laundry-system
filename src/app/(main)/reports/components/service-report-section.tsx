"use client";

import { useState, useEffect } from "react";
import {
  CubeIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import {
  getServicesConsumed,
  getServicesSummary,
  ServiceConsumedData,
} from "@/app/actions/service";
import { ServiceReportSkeleton } from "./skeleton";

type ServiceReportSectionProps = {
  dateRange: { startDate: Date; endDate: Date };
};

export function ServiceReportSection({ dateRange }: ServiceReportSectionProps) {
  const [servicesData, setServicesData] = useState<ServiceConsumedData[]>([]);
  const [summaryData, setSummaryData] = useState<{
    total_services_consumed: number;
    total_revenue: number;
    unique_services_offered: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServicesData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Format dates for API
        const startDate = dateRange.startDate
          ? dateRange.startDate.toISOString().split("T")[0]
          : undefined;
        const endDate = dateRange.endDate
          ? dateRange.endDate.toISOString().split("T")[0]
          : undefined;

        const [servicesResult, summaryResult] = await Promise.all([
          getServicesConsumed({ startDate, endDate }),
          getServicesSummary({ startDate, endDate }),
        ]);

        if (servicesResult.error) {
          setError(servicesResult.error as string);
        } else {
          setServicesData(servicesResult.data || []);
        }

        if (summaryResult.error) {
          setError(summaryResult.error as string);
        } else {
          setSummaryData(summaryResult.data);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch services data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchServicesData();
  }, [dateRange]);

  if (loading) {
    return <ServiceReportSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">Error loading services data: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Services Consumed"
          value={summaryData?.total_services_consumed?.toLocaleString() || "0"}
          icon={ShoppingBagIcon}
          color="from-blue-100 to-blue-50"
          iconColor="bg-blue-500"
        />
        <SummaryCard
          title="Total Service Revenue"
          value={`₱${(summaryData?.total_revenue || 0).toLocaleString()}`}
          icon={CurrencyDollarIcon}
          color="from-green-100 to-green-50"
          iconColor="bg-green-500"
        />
        <SummaryCard
          title="Unique Services Offered"
          value={summaryData?.unique_services_offered?.toLocaleString() || "0"}
          icon={CubeIcon}
          color="from-purple-100 to-purple-50"
          iconColor="bg-purple-500"
        />
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Services Breakdown
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Detailed view of services consumed during the selected period
          </p>
        </div>

        {servicesData.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No services data
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No services were consumed during the selected period.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Orders
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {servicesData.map((service) => (
                  <tr key={service.service_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {service.service_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {service.total_orders.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                      {service.total_quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      ₱{service.total_revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Summary Card Component
function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
  iconColor,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  iconColor: string;
}) {
  return (
    <div className={`bg-gradient-to-r ${color} rounded-lg p-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`${iconColor} p-3 rounded-full`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}
