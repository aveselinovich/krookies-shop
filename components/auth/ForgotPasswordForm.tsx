"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { validateEmail } from "@/lib/email";

function getForgotPasswordMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Не получилось отправить письмо";
  }

  switch (error.message) {
    case "email_required":
    case "invalid_email":
      return "Проверьте адрес почты";
    case "email_not_configured":
      return "Отправка писем пока не настроена";
    default:
      return "Не получилось отправить письмо";
  }
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [debugLink, setDebugLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !validateEmail(trimmedEmail)) {
      setMessage("Проверьте адрес почты");
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setDebugLink(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "forgot_password_failed");
      }

      setMessage("Если аккаунт с такой почтой существует, мы отправили письмо для смены пароля");
      setDebugLink(result.debugResetUrl || null);
    } catch (error) {
      setMessage(getForgotPasswordMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-3xl bg-[#FFFFFF] p-6 shadow-lg ring-1 ring-black/5 md:p-8">
      <div className="mb-8 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#54342C]">KROOKIES ACCOUNT</p>
        <h1 className="text-3xl font-black text-[#54342C] sm:text-4xl">Не помню пароль</h1>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">Почта</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="name@example.com"
            className="w-full rounded-2xl border border-[#E6AECB] bg-white px-4 py-3 text-[#54342C] outline-none focus:border-[#54342C]"
          />
        </label>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Отправляем письмо..." : "Отправить письмо для смены пароля"}
        </Button>
      </form>

      {message ? <p className="mt-5 text-center text-sm font-semibold text-[#54342C]">{message}</p> : null}
      {debugLink ? (
        <p className="mt-3 break-all text-center text-xs text-[#54342C] opacity-70">
          Dev-ссылка: <a href={debugLink} className="underline">{debugLink}</a>
        </p>
      ) : null}

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm font-semibold text-[#54342C] hover:opacity-80">
          Вернуться ко входу
        </Link>
      </div>
    </div>
  );
}
