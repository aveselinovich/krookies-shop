"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "@/components/ui/Icons";

type DeliverySlotPickerProps = {
  value?: string;
  options: string[];
  onChange: (value: string) => void;
};

export function DeliverySlotPicker({ value, options, onChange }: DeliverySlotPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-2xl border border-[#E6AECB] bg-white px-4 py-3 text-left text-[#54342C] outline-none transition hover:border-[#d48cb3] focus:border-[#54342C]"
      >
        <span className={value ? "" : "text-[#8f6f66]"}>
          {value || "Выберите интервал"}
        </span>
        <ChevronDownIcon size={18} className={isOpen ? "ml-3 shrink-0 rotate-180 text-[#54342C] transition" : "ml-3 shrink-0 text-[#54342C] transition"} />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 z-30 mt-3 rounded-[28px] bg-white p-3 shadow-2xl ring-1 ring-black/5 sm:right-auto sm:min-w-[19rem]">
          <div className="space-y-2">
            {options.map((option) => {
              const isSelected = value === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={[
                    "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition",
                    isSelected
                      ? "bg-[#54342C] text-white"
                      : "bg-[#FFF4F8] text-[#54342C] hover:bg-[#ffe8f1]",
                  ].join(" ")}
                >
                  <span>{option}</span>
                  <span className={isSelected ? "opacity-100" : "opacity-0"}>
                    <CheckIcon size={16} />
                  </span>
                </button>
              );
            })}
          </div>

          {value ? (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-sm font-semibold text-[#54342C] transition hover:opacity-75"
              >
                Очистить
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
