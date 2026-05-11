"use client";
import { useEffect, useState } from "react";
import { AccountCancelOrderButton } from "@/components/account/AccountCancelOrderButton";
import { getClientOrderStatusLabel } from "@/components/account/OrderProgress";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ButtonLink } from "@/components/ui/Button";
import { formatPrice } from "@/lib/money";

type LastOrderStatus = "pending_confirmation" | "pending_payment" | "accepted" | "baking" | "ready" | "delivered" | "cancelled";
type LastOrder = { orderId: string; orderNumber: number; total: number; status: LastOrderStatus };
type SessionUser = { id: string; role: "customer" | "admin" };

function canCancelOrder(status: LastOrderStatus) {
  return status === "pending_confirmation" || status === "pending_payment";
}

export default function OrderCreatedPage() {
  const [order, setOrder] = useState<LastOrder | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem("krookies_last_order");
    if (raw) {
      try {
        setOrder(JSON.parse(raw));
      } catch {
        return;
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json();
        if (!isMounted) return;
        setUser(result.user || null);
      } catch {
        return;
      }
    }

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleOrderCancelled(nextStatus: "cancelled") {
    setOrder((current) => {
      if (!current) return current;

      const nextOrder = {
        ...current,
        status: nextStatus,
      };

      try {
        window.localStorage.setItem("krookies_last_order", JSON.stringify(nextOrder));
      } catch {
        return nextOrder;
      }

      return nextOrder;
    });
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#FFF9FB]">
      <SiteHeader />
      <section className="mx-auto w-full max-w-3xl flex-1 px-5 py-16 md:px-8">
        <div className="rounded-3xl bg-[#FFFFFF] p-8 text-center shadow-lg ring-1 ring-black/5 md:p-10">
          <h1 className="text-3xl font-black text-[#54342C] sm:text-4xl">Заказ отправлен на подтверждение</h1>
          <p className="mt-5 leading-7 text-[#54342C]">
            Спасибо! Мы получили ваш заказ. Менеджер проверит возможность доставки и отправит вам ссылку на оплату
            печенья
          </p>
          <p className="mt-3 leading-7 text-[#54342C]">
            Доставка Яндекс оплачивается отдельно по ссылке Яндекс Доставки
          </p>

          {order ? (
            <div className="mt-8 rounded-[24px] bg-[#FFF4F8] p-5 text-left">
              <div className="flex justify-between gap-4 border-b border-[#E0C7AE] pb-3">
                <span className="text-[#54342C]">Номер заказа</span>
                <span className="font-semibold text-[#54342C]">#{order.orderNumber}</span>
              </div>

              <div className="flex justify-between gap-4 border-b border-[#E0C7AE] py-3">
                <span className="text-[#54342C]">Сумма печенья</span>
                <span className="font-semibold text-[#54342C]">{formatPrice(order.total)}</span>
              </div>

              <div className="flex items-start justify-between gap-4 pt-3">
                <span className="text-[#54342C]">Статус</span>
                <span className="max-w-[12rem] text-right font-semibold leading-tight text-[#54342C]">
                  {getClientOrderStatusLabel(order.status)}
                </span>
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {order && user && canCancelOrder(order.status) ? (
              <AccountCancelOrderButton orderId={order.orderId} onSuccess={handleOrderCancelled} />
            ) : null}
            <ButtonLink href="/">Открыть витрину</ButtonLink>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
