"use client";

import { useRef, useState } from "react";
import moment from "moment";
import { twMerge } from "tailwind-merge";
import ReactDatepicker, {
  ReactDatePickerCustomHeaderProps,
} from "react-datepicker";

import {
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
} from "@heroicons/react/24/solid";

import "react-datepicker/dist/react-datepicker.css";

type CustomDatePickerProps = {
  value: Date | string;
  onChange: (date: Date | string) => void;
  required?: boolean;
  label: string;
  placeholder?: string;
  error: boolean;
};

export const Datepicker = ({
  value,
  onChange,
  label,
  error,
  placeholder,
}: CustomDatePickerProps) => {
  const inputDOB = useRef<ReactDatepicker | null>(null);

  const [dateType, setDateType] = useState<"D" | "M" | "Y">("D");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const isCurrentMonthDate = (date: Date) => {
    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );
  };

  const renderCustomHeader = (props: ReactDatePickerCustomHeaderProps) => {
    const startYear = Math.floor(props?.date.getFullYear() / 12) * 12 + 1;
    const endYear = startYear + 11;

    return (
      <div className="flex mx-2 justify-center items-center p-2">
        <ArrowLongLeftIcon
          className="cursor-pointer w-10 h-10 p-2 hover:bg-gray-200 rounded-md"
          onClick={() => {
            if (dateType === "Y") {
              props?.decreaseYear();
            } else if (dateType === "M") {
              props?.changeYear(props?.date.getFullYear() - 1);
            } else {
              props?.decreaseMonth();
            }
          }}
        />
        <span
          className="cursor-pointer text-base text-gray-600 hover:text-gray-700 !font-bold p-2 transition-colors duration-300 flex-1 mx-4 hover:bg-gray-200 rounded-md"
          onClick={() => setDateType(dateType === "M" ? "Y" : "M")}
        >
          {dateType === "Y"
            ? `${startYear} - ${endYear}`
            : moment(props?.monthDate).format(
                dateType === "M" ? "YYYY" : "MMMM YYYY"
              )}
        </span>
        <ArrowLongRightIcon
          className="cursor-pointer w-10 h-10 p-2 hover:bg-gray-200 rounded-md"
          onClick={() => {
            if (dateType === "Y") {
              props?.increaseYear();
            } else if (dateType === "M") {
              props?.changeYear(props?.date.getFullYear() + 1);
            } else {
              props?.increaseMonth();
            }
          }}
        />
      </div>
    );
  };

  const formattedDate = (date: Date) => moment(date).toDate();

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <ReactDatepicker
        wrapperClassName="!block"
        className={twMerge(
          "block w-full border disabled:cursor-not-allowed !py-3 !px-4 border-primary-500 disabled:opacity-50 border-gray-200 text-gray-900 focus:border-primary-500 focus:ring-primary-500  p-2.5 text-sm rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none",
          error && "border-red-400 focus:border-red-400 focus:ring-red-400"
        )}
        dateFormat="MMMM d, yyyy"
        placeholderText={placeholder}
        popperPlacement="bottom-start"
        ref={inputDOB}
        showMonthYearPicker={dateType === "M"}
        showYearPicker={dateType === "Y"}
        calendarClassName="shadow-lg !border-none"
        selected={value ? formattedDate(value as Date) : null}
        renderCustomHeader={renderCustomHeader}
        popperClassName="custom-popper"
        onCalendarClose={() => setDateType("D")}
        shouldCloseOnSelect={!["M", "Y"].includes(dateType)}
        maxDate={formattedDate(new Date())}
        onChange={(date) => {
          if (dateType === "Y") {
            setCurrentYear(date!.getFullYear());
            setDateType("M");
          } else if (dateType === "M") {
            setDateType("D");
          }

          setCurrentMonth(date!.getMonth());
          setCurrentYear(date!.getFullYear());

          onChange(moment(date).format("YYYY-MM-DD"));
        }}
        onMonthChange={(date) => {
          setCurrentMonth(date.getMonth());
          setCurrentYear(date.getFullYear());
        }}
        dayClassName={(date) =>
          isCurrentMonthDate(date)
            ? moment(date).format("YYYY-MM-DD") === value
              ? "!bg-primary-500 py-1 !w-10 !h-10 font-bold items-center justify-center !inline-flex"
              : "!bg-transparent py-1 !w-10 !h-10 font-bold !text-gray-700 hover:!bg-gray-100 items-center justify-center !inline-flex"
            : moment(value).format("YYYY-MM") === moment(date).format("YYYY-MM")
            ? "!text-gray-700 py-1 !w-10 !h-10 font-bold items-center justify-center !inline-flex"
            : "!text-gray-400 py-1 !w-10 !h-10 font-bold items-center justify-center !inline-flex"
        }
      />
    </div>
  );
};
