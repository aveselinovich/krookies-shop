"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type AccountCancelOrderButtonProps = {
  orderId: string;
  variant?: "default" | "text";
  align?: "start" | "end";
  onSuccess?: (nextStatus: "cancelled") => void;
};

const ERROR_MESSAGES: Record<string, string> = {
  order_cannot_be_cancelled: "Этот заказ уже нельзя отменить",
  order_not_found: "Заказ не найден",
  unauthorized: "Нужно войти в аккаунт заново",
};

export function AccountCancelOrderButton({
  orderId,
  variant = "default",
  align = "start",
  onSuccess,
}: AccountCancelOrderButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function closeModal() {
    if (isPending) return;
    setIsOpen(false);
    setError("");
  }

  function handleCancelOrder() {
    setError("");

    startTransition(async () => {
      try {
        const response = await fetch(`/api/account/orders/${orderId}/cancel`, {
          method: "PATCH",
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          const message =
            typeof payload?.error === "string"
              ? ERROR_MESSAGES[payload.error] || "Не получилось отменить заказ"
              : "Не получилось отменить заказ";
          setError(message);
          return;
        }

        setIsOpen(false);
        onSuccess?.("cancelled");
        router.refresh();
      } catch {
        setError("Не получилось отменить заказ");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          variant === "text"
            ? `inline-flex items-center justify-center text-sm font-semibold text-[#8A6A62] transition hover:text-[#54342C] ${
                align === "end" ? "md:ml-auto" : ""
              }`
            : "inline-flex items-center justify-center rounded-2xl border border-[#E6AECB] bg-[#FFF4F8] px-5 py-3 text-sm font-semibold text-[#54342C] transition hover:bg-[#FDE8F0]"
        }
      >
        Отменить заказ
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(84,52,44,0.42)] px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_24px_80px_rgba(84,52,44,0.18)] ring-1 ring-black/5">
            <h2 className="text-2xl font-black text-[#54342C]">Отменить заказ</h2>
            <p className="mt-3 leading-7 text-[#54342C]">
              Вы уверены, что хотите отменить этот заказ
            </p>

            {error ? <p className="mt-4 text-sm text-[#B3536B]">{error}</p> : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-[#E6AECB] px-5 py-3 font-semibold text-[#54342C] transition hover:bg-[#FFF4F8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Не отменять
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={isPending}
                className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#54342C] px-5 py-3 font-semibold text-white transition hover:bg-[#6A4338] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Отменяем..." : "Отменить заказ"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
