"use client";

import { FormEvent, useState } from "react";
import type { User } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { validateEmail } from "@/lib/email";
import { formatPhoneInput, validatePhone } from "@/lib/phone";

type ProfileFormProps = {
  user: User;
};

function getProfileMessage(error: string) {
  switch (error) {
    case "invalid_phone":
      return "Проверьте номер телефона";
    case "invalid_email":
      return "Проверьте адрес почты";
    case "invalid_telegram_username":
      return "Проверьте username в Telegram";
    case "email_already_used":
      return "Эта почта уже используется другим пользователем";
    case "name_required":
      return "Введите имя";
    default:
      return "Не получилось сохранить данные";
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNameRequired = searchParams.get("required") === "name";

  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(formatPhoneInput(user.phone || ""));
  const [email, setEmail] = useState(user.email || "");
  const [telegramUsername, setTelegramUsername] = useState(user.telegramUsername || "");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (trimmedPhone && !validatePhone(phone)) {
      setMessage("Проверьте номер телефона");
      return;
    }

    if (trimmedEmail && !validateEmail(trimmedEmail)) {
      setMessage("Проверьте адрес почты");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: trimmedPhone || null,
          email: trimmedEmail || null,
          telegramUsername: telegramUsername.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "profile_update_failed");
      }

      setMessage("Данные сохранены");

      if (isNameRequired) {
        router.push("/account");
        router.refresh();
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage(getProfileMessage(error instanceof Error ? error.message : "profile_update_failed"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl bg-[#FFFFFF] p-6 shadow-lg ring-1 ring-black/5 md:p-8"
    >
      <h1 className="text-4xl font-black text-[#54342C]">Мои данные</h1>

      {isNameRequired ? (
        <div className="mt-5 rounded-[24px] bg-[#FFF4F8] p-5">
          <p className="font-semibold text-[#54342C]">
            Заполните имя, чтобы продолжить
          </p>
          <p className="mt-2 text-sm leading-6 text-[#54342C]">
            Оно нужно, чтобы менеджер видел, кому оформляется заказ
          </p>
        </div>
      ) : null}

      <p className="mt-4 max-w-2xl leading-7 text-[#54342C]">
        Здесь можно обновить имя, почту, телефон и Telegram для связи по заказам
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">
            Имя
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required={isNameRequired}
            className="w-full rounded-2xl border border-[#E6AECB] bg-white px-4 py-3 text-[#54342C] outline-none focus:border-[#54342C]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">
            Телефон для заказов
          </span>
          <input
            value={phone}
            onChange={(event) => setPhone(formatPhoneInput(event.target.value))}
            placeholder="+7 999 000-00-00"
            autoComplete="tel"
            inputMode="tel"
            className="w-full rounded-2xl border border-[#E6AECB] bg-white px-4 py-3 text-[#54342C] outline-none focus:border-[#54342C]"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">
            Почта
          </span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            inputMode="email"
            className="w-full rounded-2xl border border-[#E6AECB] bg-white px-4 py-3 text-[#54342C] outline-none focus:border-[#54342C]"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">
            Telegram username
          </span>
          <input
            value={telegramUsername}
            onChange={(event) => setTelegramUsername(event.target.value)}
            placeholder="@username"
            autoComplete="off"
            className="w-full rounded-2xl border border-[#E6AECB] bg-white px-4 py-3 text-[#54342C] outline-none focus:border-[#54342C]"
          />
        </label>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-[#54342C] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#54342C] disabled:opacity-50"
        >
          {isSaving ? "Сохраняем..." : "Сохранить изменения"}
        </button>

        {message ? (
          <p className="text-sm font-semibold text-[#54342C]">{message}</p>
        ) : null}
      </div>
    </form>
  );
}
