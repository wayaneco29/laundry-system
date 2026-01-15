"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

type SelectionMode = "single" | "multiple" | "month" | "range";

interface DatePickerProps {
  label?: string;
  value?: Date | string | string[];
  onChange: (date: string | { startDate: string; endDate: string } | string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  required?: boolean;
  dropdownPlacement?: "bottom" | "top";
  minDate?: string;
  maxDate?: string;
  disableDate?: (date: Date) => boolean;
  mode?: SelectionMode;
}

export function Datepicker({
  label = "",
  value = "",
  onChange,
  dropdownPlacement = "bottom",
  placeholder = "Select date",
  className = "",
  disabled = false,
  error = false,
  required = false,
  minDate,
  maxDate,
  disableDate,
  mode = "single",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value && !Array.isArray(value) ? new Date(value as string) : null
  );
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">(
    dropdownPlacement
  );
  const [dropdownAlignment, setDropdownAlignment] = useState<"left" | "right">(
    "left"
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update selected date when value changes
  useEffect(() => {
    if (mode === "multiple" && Array.isArray(value)) {
      const dates = value.map((v) => new Date(v));
      setSelectedDates(dates);
      if (dates.length > 0) {
        setCurrentMonth(new Date(dates[0].getFullYear(), dates[0].getMonth()));
      }
    } else if (value && !Array.isArray(value)) {
      const date = new Date(value as string);
      setSelectedDate(date);
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth()));
    } else {
      setSelectedDate(null);
      setSelectedDates([]);
    }
  }, [value, mode]);

  // Calculate dropdown position to avoid overflow (modal-aware)
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const calculatePosition = () => {
        const containerRect = containerRef.current!.getBoundingClientRect();
        const dropdownHeight = 380; // Approximate height of the dropdown
        const dropdownWidth = 300; // Width of the dropdown
        const buffer = 20;

        // Try to find the modal container
        const modalContainer =
          containerRef.current!.closest('[role="dialog"]') ||
          containerRef.current!.closest(".modal") ||
          containerRef.current!.closest("[data-modal]") ||
          containerRef.current!.closest(".fixed") ||
          document.body;

        let availableSpaceBelow, availableSpaceAbove, availableSpaceRight;

        if (modalContainer && modalContainer !== document.body) {
          // Inside a modal - calculate relative to modal bounds
          const modalRect = modalContainer.getBoundingClientRect();

          availableSpaceBelow =
            modalRect.bottom - containerRect.bottom - buffer;
          availableSpaceAbove = containerRect.top - modalRect.top - buffer;
          availableSpaceRight = modalRect.right - containerRect.left - buffer;
        } else {
          // No modal - calculate relative to viewport
          availableSpaceBelow =
            window.innerHeight - containerRect.bottom - buffer;
          availableSpaceAbove = containerRect.top - buffer;
          availableSpaceRight = window.innerWidth - containerRect.left - buffer;
        }

        // Horizontal positioning
        if (availableSpaceRight >= dropdownWidth) {
          setDropdownAlignment("left");
        } else {
          setDropdownAlignment("right");
        }
      };

      // Calculate immediately
      calculatePosition();

      // Recalculate on resize or scroll
      const handleResize = () => calculatePosition();
      const handleScroll = () => calculatePosition();

      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add days from previous month to fill the first week
    const startDay = firstDay.getDay();
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

    for (let i = startDay - 1; i >= 0; i--) {
      days.push(new Date(prevYear, prevMonth, daysInPrevMonth - i));
    }

    // Add days of the current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    // Add days from next month to complete the last week only
    const totalWeeks = Math.ceil(days.length / 7);
    const totalCells = totalWeeks * 7;
    const remainingCells = totalCells - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    for (let day = 1; day <= remainingCells; day++) {
      days.push(new Date(nextYear, nextMonth, day));
    }

    return days;
  };

  const isDateDisabled = (date: Date): boolean => {
    if (disabled) return true;

    // Use custom disableDate function if provided
    if (disableDate && disableDate(date)) return true;

    const dateString = formatDateForInput(date);

    if (minDate && dateString < minDate) return true;
    if (maxDate && dateString > maxDate) return true;

    return false;
  };

  const isDateInCurrentMonth = (date: Date): boolean => {
    return (
      date.getMonth() === currentMonth.getMonth() &&
      date.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isDateSelected = (date: Date): boolean => {
    if (mode === "multiple") {
      return selectedDates.some((d) => d.toDateString() === date.toDateString());
    }
    if (mode === "range") {
      return (
        rangeStart?.toDateString() === date.toDateString() ||
        rangeEnd?.toDateString() === date.toDateString()
      );
    }
    return selectedDate?.toDateString() === date.toDateString();
  };

  const isDateInRange = (date: Date): boolean => {
    if (mode !== "range" || !rangeStart || !rangeEnd) return false;
    const dateTime = date.getTime();
    const startTime = rangeStart.getTime();
    const endTime = rangeEnd.getTime();
    return dateTime > startTime && dateTime < endTime;
  };

  const isToday = (date: Date): boolean => {
    return date.toDateString() === new Date().toDateString();
  };

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date) || !isDateInCurrentMonth(date)) return;

    if (mode === "multiple") {
      const dateStr = date.toDateString();
      const isAlreadySelected = selectedDates.some(
        (d) => d.toDateString() === dateStr
      );

      let newDates: Date[];
      if (isAlreadySelected) {
        newDates = selectedDates.filter((d) => d.toDateString() !== dateStr);
      } else {
        newDates = [...selectedDates, date];
      }

      setSelectedDates(newDates);
      onChange(newDates.map((d) => formatDateForInput(d)));
    } else if (mode === "range") {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        // Start new range
        setRangeStart(date);
        setRangeEnd(null);
      } else {
        // Complete the range
        if (date < rangeStart) {
          // If end date is before start, swap them
          setRangeEnd(rangeStart);
          setRangeStart(date);
          onChange({
            startDate: formatDateForInput(date),
            endDate: formatDateForInput(rangeStart),
          });
        } else {
          setRangeEnd(date);
          onChange({
            startDate: formatDateForInput(rangeStart),
            endDate: formatDateForInput(date),
          });
        }
      }
    } else {
      setSelectedDate(date);
      onChange(formatDateForInput(date));
      setIsOpen(false);
    }
  };

  const handleSelectMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    onChange({
      startDate: formatDateForInput(firstDay),
      endDate: formatDateForInput(lastDay),
    });
    setIsOpen(false);
  };

  const handleClearMultiple = () => {
    setSelectedDates([]);
    onChange([]);
  };

  const handleApplyMultiple = () => {
    setIsOpen(false);
  };

  const handleClearRange = () => {
    setRangeStart(null);
    setRangeEnd(null);
  };

  const handleApplyRange = () => {
    if (rangeStart && rangeEnd) {
      setIsOpen(false);
    }
  };

  const handleInputClick = () => {
    if (disabled) return;

    if (!isOpen) {
      // Reset to selected date's month when opening
      if (selectedDate) {
        setCurrentMonth(
          new Date(selectedDate.getFullYear(), selectedDate.getMonth())
        );
      } else {
        setCurrentMonth(new Date());
      }
    }

    setIsOpen(!isOpen);
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = getDaysInMonth(currentMonth);

  // Dynamic dropdown classes based on position
  const getDropdownClasses = () => {
    let classes =
      "absolute bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-[280px]";

    // Higher z-index for modals and overlays
    classes += " z-[99999]";

    // Vertical positioning
    if (dropdownPosition === "bottom") {
      classes += " top-full mt-2";
    } else {
      classes += " bottom-full mb-2";
    }

    // Horizontal positioning
    if (dropdownAlignment === "left") {
      classes += " left-0";
    } else {
      classes += " right-0";
    }

    return classes;
  };

  const getDisplayValue = (): string => {
    if (mode === "multiple") {
      if (selectedDates.length === 0) return placeholder;
      if (selectedDates.length === 1)
        return formatDate(selectedDates[0]);
      return `${selectedDates.length} dates selected`;
    }
    if (mode === "range") {
      if (rangeStart && rangeEnd) {
        return `${formatDate(rangeStart)} - ${formatDate(rangeEnd)}`;
      }
      if (rangeStart) {
        return `${formatDate(rangeStart)} - ...`;
      }
      return placeholder;
    }
    return selectedDate ? formatDate(selectedDate) : placeholder;
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Input Field */}
      {label && (
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          {label}
        </label>
      )}
      <div
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent flex items-center ${
          error
            ? "border-red-300 bg-red-50"
            : "border-gray-300 bg-white hover:border-gray-400"
        } ${
          disabled
            ? "bg-gray-50 cursor-not-allowed opacity-50"
            : "cursor-pointer"
        } ${className}`}
        onClick={handleInputClick}
      >
        <Calendar
          className={`w-4 h-4 flex-shrink-0 ${
            disabled ? "text-gray-400" : "text-gray-400"
          }`}
        />
        <span
          className={`text-sm pl-2 flex-1 ${
            (mode === "multiple"
              ? selectedDates.length > 0
              : mode === "range"
              ? rangeStart !== null
              : selectedDate)
              ? "text-gray-900"
              : "text-gray-500"
          }`}
        >
          {getDisplayValue()}
        </span>
        {((mode === "multiple" && selectedDates.length > 0) ||
          (mode === "range" && rangeStart !== null)) &&
          !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (mode === "multiple") {
                  handleClearMultiple();
                } else if (mode === "range") {
                  handleClearRange();
                }
              }}
              className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
      </div>
      {/* Dropdown Calendar */}
      {isOpen && !disabled && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-[99998] sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div ref={dropdownRef} className={getDropdownClasses()}>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => {
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1
                    )
                  );
                }}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <h3 className="text-sm font-semibold text-gray-900 text-center flex-1 mx-2">
                {currentMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1
                    )
                  );
                }}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-xs font-medium text-gray-500 text-center py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => {
                const inCurrentMonth = isDateInCurrentMonth(date);
                const selected = isDateSelected(date);
                const inRange = isDateInRange(date);
                const today = isToday(date);
                const disabled = isDateDisabled(date);

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateSelect(date)}
                    disabled={disabled || !inCurrentMonth}
                    className={`
                      w-8 h-8 text-xs rounded-md transition-colors relative flex items-center justify-center
                      ${
                        disabled
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                          : selected
                          ? "bg-blue-500 text-white font-medium shadow-md ring-2 ring-primary/20"
                          : inRange
                          ? "bg-blue-100 text-blue-900"
                          : today
                          ? "bg-blue-50 text-blue-600 font-medium ring-1 ring-blue-200"
                          : inCurrentMonth
                          ? "text-gray-900 hover:bg-gray-100 hover:ring-1 hover:ring-gray-200"
                          : "text-gray-300"
                      }
                      ${!disabled ? "cursor-pointer" : ""}
                      ${
                        !inCurrentMonth
                          ? "opacity-30 bg-gray-200 !text-black"
                          : ""
                      }
                    `}
                  >
                    {date.getDate()}
                    {today && !selected && (
                      <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-gray-200">
              {/* Month Selection Button */}
              {mode === "month" && (
                <button
                  type="button"
                  onClick={handleSelectMonth}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Select This Month
                </button>
              )}

              {/* Range Mode Instructions */}
              {mode === "range" && (
                <div className="text-xs text-gray-600 text-center">
                  {!rangeStart
                    ? "Select start date"
                    : !rangeEnd
                    ? "Select end date"
                    : "Range selected"}
                </div>
              )}

              {/* Actions Row */}
              <div className="flex justify-between">
                {mode !== "month" && mode !== "range" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (mode === "multiple") {
                        const today = new Date();
                        if (
                          !selectedDates.some(
                            (d) => d.toDateString() === today.toDateString()
                          )
                        ) {
                          const newDates = [...selectedDates, today];
                          setSelectedDates(newDates);
                          onChange(newDates.map((d) => formatDateForInput(d)));
                        }
                      } else {
                        setSelectedDate(new Date());
                        onChange(formatDateForInput(new Date()));
                        setIsOpen(false);
                      }
                    }}
                    className="text-xs cursor-pointer text-primary hover:text-primary/80 font-medium"
                  >
                    {mode === "multiple" ? "Add Today" : "Today"}
                  </button>
                )}

                <div className="flex gap-2 ml-auto">
                  {mode === "multiple" ? (
                    <>
                      {selectedDates.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearMultiple}
                          className="text-xs cursor-pointer text-gray-600 hover:text-gray-700"
                        >
                          Clear All
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleApplyMultiple}
                        className="text-xs cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Apply
                      </button>
                    </>
                  ) : mode === "range" ? (
                    <>
                      {rangeStart && (
                        <button
                          type="button"
                          onClick={handleClearRange}
                          className="text-xs cursor-pointer text-gray-600 hover:text-gray-700"
                        >
                          Clear
                        </button>
                      )}
                      {rangeStart && rangeEnd && (
                        <button
                          type="button"
                          onClick={handleApplyRange}
                          className="text-xs cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Apply
                        </button>
                      )}
                    </>
                  ) : (
                    selectedDate &&
                    mode !== "month" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDate(null);
                          onChange("");
                          setIsOpen(false);
                        }}
                        className="text-xs cursor-pointer text-gray-600 hover:text-gray-700"
                      >
                        Clear
                      </button>
                    )
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
