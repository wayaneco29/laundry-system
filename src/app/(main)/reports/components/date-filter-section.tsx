"use client";

import { Datepicker } from "@/app/components/common";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

type DateFilterSectionProps = {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  onDateRangeChange: (dateRange: { startDate: Date; endDate: Date }) => void;
};

export function DateFilterSection({
  dateRange,
  onDateRangeChange,
}: DateFilterSectionProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const presetRanges = [
    {
      id: 1,
      label: "Today",
      getValue: () => ({
        startDate: new Date(),
        endDate: new Date(),
      }),
    },
    {
      id: 2,
      label: "This Week",
      getValue: () => {
        const today = new Date();
        const startOfWeek = new Date(
          today.setDate(today.getDate() - today.getDay())
        );
        return {
          startDate: startOfWeek,
          endDate: new Date(),
        };
      },
    },
    {
      id: 3,
      label: "This Month",
      getValue: () => ({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date(),
      }),
    },
    {
      id: 4,
      label: "Last 30 Days",
      getValue: () => ({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      }),
    },
    {
      id: 5,
      label: "This Year",
      getValue: () => ({
        startDate: new Date(new Date().getFullYear(), 0, 1),
        endDate: new Date(),
      }),
    },
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Date Range:</span>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2">
          {presetRanges.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                onDateRangeChange(preset.getValue());
                setSelected(preset?.id);
              }}
              className={twMerge(
                "cursor-pointer px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors",
                selected === preset?.id && "bg-blue-500 text-white"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Date Inputs */}
        <div className="flex items-center gap-2 ml-auto">
          <Datepicker
            value={dateRange.startDate.toISOString().split("T")[0]}
            onChange={(newDate) => {
              onDateRangeChange({
                ...dateRange,
                startDate: new Date(newDate),
              });

              setSelected(null);
            }}
            className="px-3 py-2 border text-gray-600 border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            // disableDate={(date) => date > new Date()}
          />
          <span className="text-gray-500">to</span>
          <Datepicker
            value={dateRange.endDate.toISOString().split("T")[0]}
            onChange={(newDate) => {
              onDateRangeChange({
                ...dateRange,
                endDate: new Date(newDate),
              });

              setSelected(null);
            }}
            className="px-3 py-2 border text-gray-600 border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Showing data from{" "}
        <span className="font-medium">{formatDate(dateRange.startDate)}</span>{" "}
        to <span className="font-medium">{formatDate(dateRange.endDate)}</span>
      </div>
    </div>
  );
}
