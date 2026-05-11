"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/Icons";
import { formatDeliveryDateLabel, getDateValue, getMinimumDeliveryDateValue, getMonthTitle } from "@/lib/delivery-date";

type DeliveryDatePickerProps = {
  value?: string;
  onChange: (value: string) => void;
  hasError?: boolean;
};

type CalendarDay = {
  dateValue: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isDisabled: boolean;
};

const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function parseDateValue(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return { year, monthIndex: month - 1, day };
}

function getInitialMonth(value: string | undefined, minimumDateValue: string) {
  const target = value && value >= minimumDateValue ? value : minimumDateValue;
  const { year, monthIndex } = parseDateValue(target);
  return { year, monthIndex };
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function getMonthCells(year: number, monthIndex: number, minimumDateValue: string) {
  const firstDay = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const offset = (firstDay + 6) % 7;
  const daysInCurrentMonth = getDaysInMonth(year, monthIndex);
  const previousMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
  const previousMonthYear = monthIndex === 0 ? year - 1 : year;
  const daysInPreviousMonth = getDaysInMonth(previousMonthYear, previousMonthIndex);
  const cells: CalendarDay[] = [];

  for (let index = 0; index < 42; index += 1) {
    const dayOffset = index - offset;

    if (dayOffset < 0) {
      const dayNumber = daysInPreviousMonth + dayOffset + 1;
      const dateValue = getDateValue(previousMonthYear, previousMonthIndex, dayNumber);
      cells.push({
        dateValue,
        dayNumber,
        isCurrentMonth: false,
        isDisabled: true,
      });
      continue;
    }

    if (dayOffset >= daysInCurrentMonth) {
      const nextMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1;
      const nextMonthYear = monthIndex === 11 ? year + 1 : year;
      const dayNumber = dayOffset - daysInCurrentMonth + 1;
      const dateValue = getDateValue(nextMonthYear, nextMonthIndex, dayNumber);
      cells.push({
        dateValue,
        dayNumber,
        isCurrentMonth: false,
        isDisabled: true,
      });
      continue;
    }

    const dayNumber = dayOffset + 1;
    const dateValue = getDateValue(year, monthIndex, dayNumber);
    cells.push({
      dateValue,
      dayNumber,
      isCurrentMonth: true,
      isDisabled: dateValue < minimumDateValue,
    });
  }

  return cells;
}

function canGoToPreviousMonth(year: number, monthIndex: number, minimumDateValue: string) {
  const previousMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
  const previousMonthYear = monthIndex === 0 ? year - 1 : year;
  const lastDayOfPreviousMonth = getDateValue(
    previousMonthYear,
    previousMonthIndex,
    getDaysInMonth(previousMonthYear, previousMonthIndex)
  );
  return lastDayOfPreviousMonth >= minimumDateValue;
}

export function DeliveryDatePicker({ value, onChange, hasError = false }: DeliveryDatePickerProps) {
  const minimumDateValue = getMinimumDeliveryDateValue();
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => getInitialMonth(value, minimumDateValue));
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    setVisibleMonth(getInitialMonth(value, minimumDateValue));
  }, [value, minimumDateValue]);

  const cells = getMonthCells(visibleMonth.year, visibleMonth.monthIndex, minimumDateValue);
  const hasPreviousMonth = canGoToPreviousMonth(visibleMonth.year, visibleMonth.monthIndex, minimumDateValue);

  function openPreviousMonth() {
    if (!hasPreviousMonth) return;
    setVisibleMonth((current) =>
      current.monthIndex === 0
        ? { year: current.year - 1, monthIndex: 11 }
        : { year: current.year, monthIndex: current.monthIndex - 1 }
    );
  }

  function openNextMonth() {
    setVisibleMonth((current) =>
      current.monthIndex === 11
        ? { year: current.year + 1, monthIndex: 0 }
        : { year: current.year, monthIndex: current.monthIndex + 1 }
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-invalid={hasError}
        className={[
          "flex w-full items-center justify-between rounded-2xl border bg-white px-4 py-3 text-left text-[#54342C] outline-none transition hover:border-[#d48cb3]",
          hasError ? "border-[#D05C63] focus:border-[#D05C63]" : "border-[#E6AECB] focus:border-[#54342C]",
        ].join(" ")}
      >
        <span className={value ? "" : "text-[#8f6f66]"}>
          {value ? formatDeliveryDateLabel(value) : "Выберите дату"}
        </span>
        <CalendarIcon size={18} className="shrink-0 text-[#54342C]" />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 z-30 mt-3 rounded-[28px] bg-white p-4 shadow-2xl ring-1 ring-black/5 sm:right-auto sm:min-w-[19rem]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={openPreviousMonth}
              disabled={!hasPreviousMonth}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF4F8] text-[#54342C] transition hover:bg-[#ffe8f1] disabled:opacity-40"
            >
              <ChevronLeftIcon size={18} />
            </button>
            <p className="text-base font-black capitalize text-[#54342C]">
              {getMonthTitle(visibleMonth.year, visibleMonth.monthIndex)}
            </p>
            <button
              type="button"
              onClick={openNextMonth}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF4F8] text-[#54342C] transition hover:bg-[#ffe8f1]"
            >
              <ChevronRightIcon size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {WEEK_DAYS.map((day) => (
              <div key={day} className="pb-1 text-xs font-bold uppercase tracking-[0.08em] text-[#8f6f66]">
                {day}
              </div>
            ))}

            {cells.map((cell) => {
              const isSelected = value === cell.dateValue;
              return (
                <button
                  key={cell.dateValue}
                  type="button"
                  disabled={cell.isDisabled}
                  onClick={() => {
                    onChange(cell.dateValue);
                    setIsOpen(false);
                  }}
                  className={[
                    "flex h-11 items-center justify-center rounded-2xl text-sm font-semibold transition",
                    cell.isCurrentMonth ? "text-[#54342C]" : "text-[#c1aba2]",
                    cell.isDisabled ? "cursor-not-allowed opacity-35" : "hover:bg-[#FFF4F8]",
                    isSelected ? "bg-[#54342C] text-white hover:bg-[#54342C]" : "",
                  ].join(" ")}
                >
                  {cell.dayNumber}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-[#8f6f66]">Доступно начиная с {formatDeliveryDateLabel(minimumDateValue)}</p>
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-sm font-semibold text-[#54342C] transition hover:opacity-75"
              >
                Очистить
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
