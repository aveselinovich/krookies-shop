"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CartItem } from "@/types/cart";
import { AddressSuggestion } from "@/types/dadata";
import { CheckoutDelivery } from "@/types/order";
import { parseDeliveryAddress } from "@/lib/address";
import { clearCart, getCartItems, getCartState } from "@/lib/cart";
import { isDeliveryDateTooEarly } from "@/lib/delivery-date";
import { validatePhone } from "@/lib/phone";
import { Button } from "@/components/ui/Button";
import { CartEmpty } from "@/components/cart/CartEmpty";
import { ContactFields } from "@/components/checkout/ContactFields";
import { DeliveryFields } from "@/components/checkout/DeliveryFields";
import { DeliveryTimeFields } from "@/components/checkout/DeliveryTimeFields";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import { CheckoutNotice } from "@/components/checkout/CheckoutNotice";

type ContactState = { name: string; phone: string; email: string };
type SessionUser = { id: string; name: string | null; phone: string; email: string | null; role: "customer" | "admin" };
type CheckoutFieldKey = "name" | "phone" | "email" | "addressLine" | "desiredDate" | "summary" | "form";
type CheckoutFieldErrors = Partial<Record<CheckoutFieldKey, string>>;
type CheckoutValidationError = { field: CheckoutFieldKey; message: string };

const INITIAL_CONTACT: ContactState = { name: "", phone: "", email: "" };
const INITIAL_DELIVERY: CheckoutDelivery = {
  city: "Москва",
  street: "",
  house: "",
  addressLine: "",
  apartment: "",
  entrance: "",
  floor: "",
  desiredDate: "",
  desiredSlot: "",
  comment: "",
};

function getCheckoutErrorMessage(error: string) {
  switch (error) {
    case "invalid_email":
      return "Проверьте адрес почты";
    case "invalid_phone":
      return "Проверьте номер телефона";
    case "cart_is_empty":
      return "Корзина пустая";
    case "product_not_found":
      return "Корзина устарела после обновления витрины. Добавьте товары заново";
    case "product_unavailable":
      return "Один из товаров сейчас недоступен";
    case "delivery_date_too_early":
      return "Дату доставки можно выбрать не раньше чем через 2 дня";
    case "delivery_out_of_area":
      return "Сейчас доставляем только по Москве и Московской области";
    case "invalid_delivery_address":
      return "Введите адрес с улицей и номером дома";
    default:
      return "Не получилось отправить заказ. Попробуйте еще раз";
  }
}

function getErrorField(error: string): CheckoutFieldKey {
  switch (error) {
    case "invalid_email":
      return "email";
    case "invalid_phone":
      return "phone";
    case "delivery_date_too_early":
      return "desiredDate";
    case "delivery_out_of_area":
    case "invalid_delivery_address":
      return "addressLine";
    case "cart_is_empty":
    case "product_not_found":
    case "product_unavailable":
      return "summary";
    default:
      return "form";
  }
}

function getDeliveryAddressParts(delivery: CheckoutDelivery) {
  const city = delivery.city.trim();
  const street = delivery.street.trim();
  const house = delivery.house.trim();

  if (street && house) {
    return {
      city: city || "Москва",
      street,
      house,
    };
  }

  return delivery.addressLine ? parseDeliveryAddress(delivery.addressLine) : null;
}

export function CheckoutForm() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [contact, setContact] = useState<ContactState>(INITIAL_CONTACT);
  const [delivery, setDelivery] = useState<CheckoutDelivery>(INITIAL_DELIVERY);
  const [selectedAddressSuggestion, setSelectedAddressSuggestion] = useState<AddressSuggestion | null>(null);
  const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fieldRefs = useRef<Partial<Record<CheckoutFieldKey, HTMLDivElement | null>>>({});

  useEffect(() => {
    setItems(getCartItems());

    let isMounted = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json();
        const user = result.user as SessionUser | null;
        if (!isMounted || !user) return;

        setContact((current) => ({
          name: current.name || user.name || "",
          phone: current.phone || user.phone || "",
          email: current.email || user.email || "",
        }));
      } catch {
        return;
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const cartState = getCartState(items);

  function clearFieldError(field: CheckoutFieldKey) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function focusField(field: CheckoutFieldKey) {
    const node = fieldRefs.current[field];
    if (!node) return;

    node.scrollIntoView({ behavior: "smooth", block: "center" });

    window.setTimeout(() => {
      const focusable = node.querySelector("input, textarea, button, [tabindex]") as HTMLElement | null;
      focusable?.focus();
    }, 250);
  }

  function showFieldError({ field, message }: CheckoutValidationError) {
    setGeneralError(field === "form" ? message : null);
    setFieldErrors({ [field]: message });
    focusField(field);
  }

  function updateContact(field: keyof ContactState, value: string) {
    setContact((current) => ({ ...current, [field]: value }));
    clearFieldError(field);
    setGeneralError(null);
  }

  function updateDelivery(field: keyof CheckoutDelivery, value: string) {
    setDelivery((current) => {
      if (field !== "addressLine") {
        return { ...current, [field]: value };
      }

      return {
        ...current,
        addressLine: value,
        city: "Москва",
        street: "",
        house: "",
      };
    });

    if (field === "addressLine") {
      setSelectedAddressSuggestion(null);
      clearFieldError("addressLine");
    }

    if (field === "desiredDate") {
      clearFieldError("desiredDate");
    }

    setGeneralError(null);
  }

  function applyAddressSuggestion(suggestion: AddressSuggestion) {
    setSelectedAddressSuggestion(suggestion);
    setDelivery((current) => ({
      ...current,
      addressLine: suggestion.value,
      city: suggestion.city || "Москва",
      street: suggestion.street,
      house: suggestion.house,
      apartment: suggestion.flat || current.apartment || "",
    }));
    clearFieldError("addressLine");
    setGeneralError(null);
  }

  const addressMessage =
    fieldErrors.addressLine ||
    (selectedAddressSuggestion && !selectedAddressSuggestion.isDeliveryArea
      ? "Сейчас доставляем только по Москве и Московской области"
      : null);
  const summaryError = fieldErrors.summary || null;

  function validateForm(): CheckoutValidationError | null {
    if (!items.length) return { field: "summary", message: "Корзина пустая" };
    if (!contact.name.trim()) return { field: "name", message: "Укажите имя" };
    if (!contact.phone.trim()) return { field: "phone", message: "Укажите телефон" };
    if (!validatePhone(contact.phone)) return { field: "phone", message: "Проверьте номер телефона" };
    if (!delivery.addressLine?.trim()) return { field: "addressLine", message: "Укажите адрес доставки" };
    if (selectedAddressSuggestion && !selectedAddressSuggestion.isDeliveryArea) {
      return { field: "addressLine", message: "Сейчас доставляем только по Москве и Московской области" };
    }
    if (!getDeliveryAddressParts(delivery)) {
      return { field: "addressLine", message: "Введите адрес с улицей и номером дома" };
    }
    if (isDeliveryDateTooEarly(delivery.desiredDate)) {
      return { field: "desiredDate", message: "Дату доставки можно выбрать не раньше чем через 2 дня" };
    }
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      showFieldError(validationError);
      return;
    }

    setFieldErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    try {
      const parsedAddress = getDeliveryAddressParts(delivery);
      if (!parsedAddress) throw new Error("invalid_delivery_address");

      const payload = {
        customer: {
          name: contact.name.trim(),
          phone: contact.phone.trim(),
          email: contact.email.trim() || undefined,
        },
        delivery: {
          city: parsedAddress.city,
          street: parsedAddress.street,
          house: parsedAddress.house,
          addressLine: delivery.addressLine?.trim() || undefined,
          apartment: delivery.apartment?.trim() || undefined,
          entrance: delivery.entrance?.trim() || undefined,
          floor: delivery.floor?.trim() || undefined,
          desiredDate: delivery.desiredDate || undefined,
          desiredSlot: delivery.desiredSlot || undefined,
          comment: delivery.comment?.trim() || undefined,
        },
        items: items.map((item) => ({
          productId: item.productId,
          slug: item.slug,
          quantity: item.quantity,
        })),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "order_create_failed");

      try {
        window.localStorage.setItem(
          "krookies_last_order",
          JSON.stringify({
            orderId: result.orderId,
            orderNumber: result.orderNumber,
            total: result.total,
            status: result.status,
          })
        );
      } catch {
        // The order is already created on the server, so a storage failure should not block the success flow
      }

      try {
        clearCart();
      } catch {
        // If localStorage is blocked, still continue to the success screen
      }

      router.push("/order-created");
    } catch (e) {
      console.error(e);
      const errorCode = e instanceof Error ? e.message : "order_create_failed";
      showFieldError({
        field: getErrorField(errorCode),
        message: getCheckoutErrorMessage(errorCode),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!items.length) return <CartEmpty />;

  const consentText = (
    <p className="text-center text-sm leading-6 text-[#7D5B52]">
      Нажимая «Отправить заказ на подтверждение», вы соглашаетесь с{" "}
      <Link href="/oferta" className="font-semibold text-[#54342C] underline decoration-[#E6AECB] underline-offset-4">
        Публичной офертой
      </Link>
      ,{" "}
      <Link href="/privacy" className="font-semibold text-[#54342C] underline decoration-[#E6AECB] underline-offset-4">
        Политикой обработки персональных данных
      </Link>{" "}
      и{" "}
      <Link href="/delivery-payment" className="font-semibold text-[#54342C] underline decoration-[#E6AECB] underline-offset-4">
        условиями оплаты и доставки
      </Link>
      .
    </p>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="space-y-5">
          <div ref={(node) => { fieldRefs.current.name = node; fieldRefs.current.phone = node; fieldRefs.current.email = node; }}>
            <ContactFields
              name={contact.name}
              phone={contact.phone}
              email={contact.email}
              onChange={updateContact}
              errors={{
                name: fieldErrors.name,
                phone: fieldErrors.phone,
                email: fieldErrors.email,
              }}
            />
          </div>

          <div ref={(node) => { fieldRefs.current.addressLine = node; }}>
            <DeliveryFields
              delivery={delivery}
              onChange={updateDelivery}
              onAddressSelect={applyAddressSuggestion}
              addressMessage={addressMessage}
            />
          </div>

          <div ref={(node) => { fieldRefs.current.desiredDate = node; }}>
            <DeliveryTimeFields
              delivery={delivery}
              onChange={updateDelivery}
              errors={{
                desiredDate: fieldErrors.desiredDate,
              }}
            />
          </div>

          <div ref={(node) => { fieldRefs.current.form = node; }}>
            <CheckoutNotice />
          </div>

          {generalError ? <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">{generalError}</div> : null}

          <Button type="submit" disabled={isSubmitting} className="hidden w-full lg:flex">
            {isSubmitting ? "Отправляем заказ..." : "Отправить заказ на подтверждение"}
          </Button>
          <div className="hidden lg:block">{consentText}</div>
        </div>

        <div className="space-y-5" ref={(node) => { fieldRefs.current.summary = node; }}>
          <CheckoutSummary items={items} subtotal={cartState.subtotal} />
          {summaryError ? <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">{summaryError}</div> : null}
          <Button type="submit" disabled={isSubmitting} className="w-full lg:hidden">
            {isSubmitting ? "Отправляем заказ..." : "Отправить заказ на подтверждение"}
          </Button>
          <div className="lg:hidden">{consentText}</div>
        </div>
      </div>
    </form>
  );
}
