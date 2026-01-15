"use client";

import { useState, useEffect } from "react";
import { Button, Datepicker } from "@/app/components/common";
import {
  Calendar,
  Download,
  Users,
  TrendingUp,
  Package,
  DollarSign,
} from "lucide-react";
import { useUserContext } from "@/app/context/UserContext";
import {
  getStaffSalesReport,
  getActiveStaffShift,
} from "@/app/actions/staff/shift_actions";
import { StaffSalesReport, ActiveStaffShift } from "@/app/types/database";
import { formatCurrency } from "@/app/utils/format";
import { toast } from "sonner";
import moment from "moment";
import { ROLE_ADMIN } from "@/app/types";

export default function StaffReportMain() {
  const user = useUserContext();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reportData, setReportData] = useState<StaffSalesReport | null>(null);
  const [activeShift, setActiveShift] = useState<ActiveStaffShift | null>(null);
  const [loading, setLoading] = useState(true);

  const isStaff = user?.role_name !== ROLE_ADMIN;

  useEffect(() => {
    loadReportData();
    loadActiveShift();
  }, [selectedDate, user?.user_id]);

  const loadReportData = async () => {
    if (!user?.user_id) return;

    try {
      setLoading(true);
      const report = await getStaffSalesReport(user.user_id, selectedDate);
      setReportData(report);
    } catch (error) {
      console.error("Error loading staff report:", error);
      toast.error("Failed to load staff report");
    } finally {
      setLoading(false);
    }
  };

  const loadActiveShift = async () => {
    if (!user?.user_id) return;

    try {
      const shift = await getActiveStaffShift(user.user_id);
      setActiveShift(shift);
    } catch (error) {
      console.error("Error loading active shift:", error);
    }
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(moment(newDate).toISOString());
  };

  const handleExportReport = async () => {
    if (!reportData) return;

    try {
      // Create CSV content
      const csvContent = [
        ["Staff Commission Report"],
        ["Date:", new Date(selectedDate).toLocaleDateString()],
        ["Staff:", reportData.staff_name],
        ["Partner:", reportData.partner_name],
        [""],
        ["Sales Summary"],
        ["Total Orders:", reportData.total_orders.toString()],
        ["Total Sales:", formatCurrency(reportData.total_sales)],
        ["Cash Sales:", formatCurrency(reportData.cash_sales)],
        ["GCash Sales:", formatCurrency(reportData.gcash_sales)],
        ["Commission (5%):", formatCurrency(reportData.commission_amount)],
        [""],
        ["Inventory Usage"],
        ["Item Name", "Quantity Used", "Time Used"],
        ...reportData.inventory_usage.map((item) => [
          item.stock_name,
          item.quantity_used.toString(),
          new Date(item.usage_date).toLocaleTimeString(),
        ]),
      ];

      const csv = csvContent.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `staff-report-${reportData.staff_name}-${selectedDate}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  if (!isStaff) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Access</h3>
        <p className="text-gray-600">
          Staff reports are only available for staff members. Admins can view
          overall performance in the main reports section.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Filter and Export */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Report Date
              </label>
              <Datepicker
                value={selectedDate}
                maxDate={new Date().toISOString().split("T")[0]}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleDateChange}
              />
            </div>
          </div>

          <Button
            onClick={handleExportReport}
            disabled={!reportData || loading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Active Shift Status */}
      {isToday && activeShift && (
        <div className="bg-green-50 rounded-lg shadow-sm p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <h3 className="font-medium text-green-800">Active Shift</h3>
              <p className="text-sm text-green-600">
                {activeShift.partner_name
                  ? `Working with ${activeShift.partner_name}`
                  : "Working solo"}{" "}
                • Started{" "}
                {new Date(activeShift.start_time).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : reportData ? (
        <>
          {/* Summary divs */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.total_orders}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Sales
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reportData.total_sales)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Commission (5%)
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(reportData.commission_amount)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Partner</p>
                  <p
                    className="text-lg font-semibold text-gray-900 truncate"
                    title={reportData.partner_name}
                  >
                    {reportData.partner_name}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Breakdown
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cash Payments</span>
                  <span className="font-semibold">
                    {formatCurrency(reportData.cash_sales)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">GCash Payments</span>
                  <span className="font-semibold">
                    {formatCurrency(reportData.gcash_sales)}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(reportData.total_sales)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Commission Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Commission Rate</span>
                  <span className="font-semibold">5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Sales</span>
                  <span className="font-medium">
                    {formatCurrency(reportData.total_sales)}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center font-semibold text-green-600">
                    <span>Commission Earned</span>
                    <span>{formatCurrency(reportData.commission_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Usage */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Inventory Usage
              </h3>
            </div>

            {reportData.inventory_usage &&
            reportData.inventory_usage.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                        Item
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                        Quantity Used
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                        Time Used
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.inventory_usage.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.stock_name}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {item.quantity_used}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {new Date(item.usage_date).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No inventory usage recorded for this date</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Data Available
          </h3>
          <p className="text-gray-600">
            No sales data found for{" "}
            {new Date(selectedDate).toLocaleDateString()}.
            {isToday
              ? " Start your shift to begin tracking sales!"
              : " Try selecting a different date."}
          </p>
        </div>
      )}
    </div>
  );
}
