"use client";

import { FormEvent, useState } from "react";
import type { User } from "@prisma/client";
import { useRouter } from "next/navigation";

function getCustomerMessage(error: string) {
  switch (error) {
    case "name_required":
      return "Введите имя";
    case "invalid_phone":
      return "Проверьте номер телефона";
    case "phone_already_used":
      return "Этот номер уже используется другим пользователем";
    case "invalid_email":
      return "Проверьте адрес почты";
    case "invalid_telegram_username":
      return "Проверьте username в Telegram";
    default:
      return "Не получилось сохранить данные";
  }
}

export function AdminCustomerForm({ user }: { user: User }) {
  const router = useRouter();
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [email, setEmail] = useState(user.email || "");
  const [telegramUsername, setTelegramUsername] = useState(user.telegramUsername || "");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email: email || null,
          telegramUsername: telegramUsername.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "user_update_failed");
      }

      setMessage("Данные сохранены");
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage(getCustomerMessage(error instanceof Error ? error.message : "user_update_failed"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-3xl bg-[#FFFFFF] p-6 shadow-lg ring-1 ring-black/5 md:p-8">
      <h1 className="text-4xl font-black text-[#54342C]">Данные пользователя</h1>
      <p className="mt-4 max-w-2xl leading-7 text-[#54342C]">
        Здесь администратор может обновить имя, телефон, почту и Telegram пользователя
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">Имя</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-2xl border border-[#E6AECB] bg-white px-4 py-3 text-[#54342C] outline-none focus:border-[#54342C]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">Телефон</span>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            inputMode="tel"
            className="w-full rounded-2xl border border-[#E6AECB] bg-white px-4 py-3 text-[#54342C] outline-none focus:border-[#54342C]"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">Почта</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
          className="rounded-full bg-[#54342C] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isSaving ? "Сохраняем..." : "Сохранить изменения"}
        </button>

        {message ? <p className="text-sm font-semibold text-[#54342C]">{message}</p> : null}
      </div>
    </form>
  );
}
