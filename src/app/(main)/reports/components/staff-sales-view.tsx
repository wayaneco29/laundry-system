"use client";

import { useState, useEffect } from "react";
import { Datepicker } from "@/app/components/common";
import {
  CalendarIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import {
  getDailySales,
  DailySalesData,
  TopServiceItem,
} from "@/app/actions/dashboard/get_daily_sales";
import { useUserContext } from "@/app/context";

export function StaffSalesView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailySalesData, setDailySalesData] = useState<DailySalesData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const { branch_id } = useUserContext();

  useEffect(() => {
    fetchDailySales();
  }, [selectedDate, branch_id]);

  const fetchDailySales = async () => {
    setLoading(true);
    try {
      const result = await getDailySales(selectedDate, branch_id);
      if (result.data) {
        setDailySalesData(result.data);
      }
    } catch (error) {
      console.error("Error fetching daily sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (value: string) => {
    setSelectedDate(new Date(value));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const summaryCards = [
    {
      title: "Total Sales",
      value: formatCurrency(dailySalesData?.totalSales || 0),
      icon: CurrencyDollarIcon,
      color: "from-green-100 to-green-50",
      iconColor: "bg-green-500",
    },
    {
      title: "Services",
      value: formatCurrency(dailySalesData?.servicesAmount || 0),
      subtitle: `${dailySalesData?.servicesCount || 0} services`,
      icon: ClipboardDocumentListIcon,
      color: "from-blue-100 to-blue-50",
      iconColor: "bg-blue-500",
    },
    {
      title: "Items",
      value: formatCurrency(dailySalesData?.itemsAmount || 0),
      subtitle: `${dailySalesData?.itemsCount || 0} items`,
      icon: ShoppingBagIcon,
      color: "from-purple-100 to-purple-50",
      iconColor: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Daily Sales Report
        </h1>
        <p className="text-slate-600">
          View daily sales summary and order details
        </p>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="w-full sm:w-64">
            <Datepicker
              label="Select Date"
              value={selectedDate.toISOString().split("T")[0]}
              onChange={handleDateChange}
              className="w-full"
              placeholder="Select date"
            />
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing sales data for{" "}
          <span className="font-medium">{formatDate(selectedDate)}</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-6 shadow-sm animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {summaryCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className={`bg-gradient-to-r ${card.color} rounded-lg p-6 shadow-sm`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {card.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {card.value}
                      </p>
                      {card.subtitle && (
                        <p className="text-xs text-gray-500 mt-1">
                          {card.subtitle}
                        </p>
                      )}
                    </div>
                    <div className={`${card.iconColor} p-3 rounded-full`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* End of Day Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              End of Day Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">
                    Total Orders Processed
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {dailySalesData?.ordersCount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">
                    Services Revenue
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(dailySalesData?.servicesAmount || 0)}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">
                    Items Revenue
                  </span>
                  <span className="text-lg font-bold text-purple-600">
                    {formatCurrency(dailySalesData?.itemsAmount || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">
                    Total Daily Revenue
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(dailySalesData?.totalSales || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performance Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">
                  Top Services Today
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {dailySalesData?.topServices && dailySalesData.topServices.length > 0 ? (
                    dailySalesData.topServices.slice(0, 5).map((service, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{service.name}</span>
                        <span className="font-medium text-blue-600">{service.count}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">No services found</div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">
                  Top Items Today
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {dailySalesData?.topItems && dailySalesData.topItems.length > 0 ? (
                    dailySalesData.topItems.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{item.name}</span>
                        <span className="font-medium text-purple-600">{item.count}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">No items found</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
