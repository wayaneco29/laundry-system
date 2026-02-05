"use client";

import { useState, useEffect } from "react";
import {
  DocumentArrowDownIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { Modal } from "@/app/components/common/modal";
import { Button } from "@/app/components/common/button";
import { exportReport, ExportData } from "@/app/utils/export-utils";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ExportData;
  activeTab: string;
}

type ReportType = "orders" | "customers" | "expenses" | "sales" | "services";

export function ExportModal({
  isOpen,
  onClose,
  data,
  activeTab,
}: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<"excel" | "pdf">("excel");
  const [selectedReports, setSelectedReports] = useState<ReportType[]>([]);

  // Initialize selected reports based on available data
  const availableReports: ReportType[] = [];
  if (data.orders && data.orders.length > 0) availableReports.push("orders");
  if (data.customers && data.customers.length > 0)
    availableReports.push("customers");
  if (data.expenses && data.expenses.length > 0)
    availableReports.push("expenses");
  if (data.sales) availableReports.push("sales");
  if (data.services && data.services.length > 0)
    availableReports.push("services");

  // Set default selection when modal opens
  useEffect(() => {
    if (availableReports.length > 0 && selectedReports.length === 0) {
      setSelectedReports(availableReports);
    }
  }, [availableReports.length]);

  const handleReportToggle = (reportType: ReportType) => {
    setSelectedReports((prev) =>
      prev.includes(reportType)
        ? prev.filter((r) => r !== reportType)
        : [...prev, reportType]
    );
  };

  const handleSelectAll = () => {
    setSelectedReports(availableReports);
  };

  const handleSelectNone = () => {
    setSelectedReports([]);
  };

  const handleExport = async () => {
    if (selectedReports.length === 0) {
      alert("Please select at least one report to export.");
      return;
    }

    setIsExporting(true);
    try {
      // Filter data based on selected reports
      const filteredData: ExportData = {
        dateRange: data.dateRange,
      };

      if (selectedReports.includes("orders") && data.orders) {
        filteredData.orders = data.orders;
      }
      if (selectedReports.includes("customers") && data.customers) {
        filteredData.customers = data.customers;
      }
      if (selectedReports.includes("expenses") && data.expenses) {
        filteredData.expenses = data.expenses;
      }
      if (selectedReports.includes("sales") && data.sales) {
        filteredData.sales = data.sales;
      }
      if (selectedReports.includes("services") && data.services) {
        filteredData.services = data.services;
      }

      const filename = `laundry_report_${activeTab}_${
        new Date().toISOString().split("T")[0]
      }`;
      await exportReport(exportType, filteredData, filename);
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const getReportLabel = (reportType: ReportType) => {
    switch (reportType) {
      case "orders":
        return "Orders Report";
      case "customers":
        return "Customers Report";
      case "expenses":
        return "Expenses Report";
      case "sales":
        return "Sales Summary";
      case "services":
        return "Services Report";
      default:
        return reportType;
    }
  };

  const getReportCount = (reportType: ReportType) => {
    switch (reportType) {
      case "orders":
        return data.orders?.length || 0;
      case "customers":
        return data.customers?.length || 0;
      case "expenses":
        return data.expenses?.length || 0;
      case "sales":
        return data.sales ? 1 : 0;
      case "services":
        return data.services?.length || 0;
      default:
        return 0;
    }
  };

  const isAllSelected = selectedReports.length === availableReports.length;
  const isNoneSelected = selectedReports.length === 0;

  return (
    <Modal
      show={isOpen}
      onClose={onClose}
      title="Export Report"
      isSubmitting={isExporting}
      size="md"
    >
      <div className="space-y-6">
        {/* Report Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Select Reports to Export
            </h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={handleSelectNone}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Select None
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {availableReports.length > 0 ? (
              availableReports.map((reportType) => {
                const count = getReportCount(reportType);
                const isSelected = selectedReports.includes(reportType);

                return (
                  <label
                    key={reportType}
                    className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleReportToggle(reportType)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {getReportLabel(reportType)}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {count} {count === 1 ? "item" : "items"}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 italic">
                No data available for export
              </p>
            )}
          </div>
        </div>

        {/* Export Format Selection */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Export Format
          </h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="exportType"
                value="pdf"
                checked={exportType === "pdf"}
                onChange={(e) =>
                  setExportType(e.target.value as "excel" | "pdf")
                }
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <DocumentArrowDownIcon className="h-5 w-5 text-red-500" />
                <span className="text-sm text-gray-700">PDF Report</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="exportType"
                value="excel"
                checked={exportType === "excel"}
                onChange={(e) =>
                  setExportType(e.target.value as "excel" | "pdf")
                }
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-700">
                  Excel File (Multiple Sheets)
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Date Range Info */}
        {data.dateRange && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Report Period
            </h4>
            <p className="text-sm text-gray-600">
              {data.dateRange.startDate.toLocaleDateString()} -{" "}
              {data.dateRange.endDate.toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Export Options Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Export Options
          </h4>
          <div className="text-sm text-blue-700 space-y-1">
            {exportType === "pdf" ? (
              <p>• Single PDF file with selected reports</p>
            ) : (
              <p>• Single Excel file with multiple sheets (tabs)</p>
            )}
            <p>• Files will be downloaded automatically</p>
            <p>
              • Selected reports: {selectedReports.length} of{" "}
              {availableReports.length}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedReports.length === 0}
            loading={isExporting}
          >
            {isExporting
              ? "Exporting..."
              : `Export ${selectedReports.length} Report${
                  selectedReports.length !== 1 ? "s" : ""
                }`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
