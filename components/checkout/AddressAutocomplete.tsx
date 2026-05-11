"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { AddressSuggestion } from "@/types/dadata";

type AddressAutocompleteProps = {
  value: string;
  onInputChange: (value: string) => void;
  onSuggestionSelect: (suggestion: AddressSuggestion) => void;
  externalMessage?: string | null;
  hasError?: boolean;
};

type SuggestionsResponse = {
  enabled: boolean;
  suggestions: AddressSuggestion[];
};

export function AddressAutocomplete({ value, onInputChange, onSuggestionSelect, externalMessage, hasError = false }: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [hasRequestError, setHasRequestError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const abortControllerRef = useRef<AbortController | null>(null);
  const selectedValueRef = useRef("");

  useEffect(() => {
    const query = value.trim();

    if (query.length < 3) {
      abortControllerRef.current?.abort();
      setSuggestions([]);
      setIsLoading(false);
      setIsOpen(false);
      setHasRequestError(false);
      setActiveIndex(-1);
      return;
    }

    if (query === selectedValueRef.current) {
      setIsLoading(false);
      setHasRequestError(false);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsLoading(true);
      setHasRequestError(false);

      try {
        const response = await fetch("/api/dadata/address-suggestions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
          signal: controller.signal,
          cache: "no-store",
        });

        const result = (await response.json()) as SuggestionsResponse;

        if (controller.signal.aborted) {
          return;
        }

        setIsEnabled(result.enabled);
        setSuggestions(response.ok ? result.suggestions : []);
        setIsOpen(Boolean(result.enabled && result.suggestions.length));
        setActiveIndex(-1);

        if (!response.ok) {
          setHasRequestError(true);
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Address autocomplete request failed:", error);
        setSuggestions([]);
        setIsOpen(false);
        setHasRequestError(true);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      abortControllerRef.current?.abort();
    };
  }, [value]);

  useEffect(() => {
    if (activeIndex >= suggestions.length) {
      setActiveIndex(-1);
    }
  }, [activeIndex, suggestions]);

  function selectSuggestion(suggestion: AddressSuggestion) {
    selectedValueRef.current = suggestion.value.trim();
    onSuggestionSelect(suggestion);
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    setHasRequestError(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!suggestions.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  const helperText = !isEnabled
    ? "Подсказки адреса временно недоступны, адрес можно ввести вручную"
    : hasRequestError
      ? "Не удалось загрузить подсказки, но адрес можно ввести вручную"
      : isLoading
        ? "Загружаем подсказки адреса..."
        : "Укажите город, улицу и дом. Доставляем только по Москве и Московской области";

  return (
    <div className="relative">
      <input
        name="street-address"
        autoComplete="shipping street-address"
        value={value}
        onChange={(event) => {
          selectedValueRef.current = "";
          onInputChange(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (suggestions.length) {
            setIsOpen(true);
          }
        }}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 120);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Например: Красногорск, ул Архангельская, 7"
        aria-invalid={hasError}
        className={[
          "w-full rounded-2xl border bg-white px-4 py-3 text-[#54342C] outline-none transition",
          hasError ? "border-[#D05C63] focus:border-[#D05C63]" : "border-[#E6AECB] focus:border-[#54342C]",
        ].join(" ")}
      />

      {isOpen && suggestions.length ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-[#F3D6E4] bg-white shadow-[0_18px_60px_rgba(84,52,44,0.14)]">
          <ul role="listbox" aria-label="Подсказки адреса">
            {suggestions.map((suggestion, index) => (
              <li key={suggestion.unrestrictedValue}>
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectSuggestion(suggestion);
                  }}
                  className={`flex w-full flex-col px-4 py-3 text-left transition ${
                    index === activeIndex ? "bg-[#FFF3F8]" : "bg-white hover:bg-[#FFF7FA]"
                  }`}
                >
                  <span className={`text-sm font-semibold ${suggestion.isDeliveryArea ? "text-[#54342C]" : "text-[#A63D40]"}`}>{suggestion.value}</span>
                  <span className={`mt-1 text-xs leading-5 ${suggestion.isDeliveryArea ? "text-[#8A6A62]" : "text-[#A63D40]"}`}>
                    {suggestion.house ? suggestion.unrestrictedValue : `${suggestion.unrestrictedValue} — продолжите номером дома`}
                    {suggestion.isDeliveryArea ? "" : " — вне зоны доставки"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className={`mt-2 text-xs leading-5 ${externalMessage ? "text-[#A63D40]" : "text-[#8A6A62]"}`}>
        {externalMessage || helperText}
      </p>
    </div>
  );
}
