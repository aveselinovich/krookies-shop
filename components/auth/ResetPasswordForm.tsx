"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PasswordToggleButton } from "@/components/ui/PasswordToggleButton";

function getResetPasswordMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Не получилось сменить пароль";
  }

  switch (error.message) {
    case "reset_token_required":
    case "invalid_or_expired_reset_token":
      return "Ссылка недействительна или уже истекла";
    case "password_too_short":
      return "Пароль должен содержать минимум 8 символов";
    default:
      return "Не получилось сменить пароль";
  }
}

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setMessage("Ссылка недействительна или уже истекла");
      return;
    }

    if (password !== repeatPassword) {
      setMessage("Пароли не совпадают");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "reset_password_failed");
      }

      setIsSuccess(true);
      setMessage("Пароль обновлён. Теперь можно войти с новым паролем");
    } catch (error) {
      setMessage(getResetPasswordMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-3xl bg-[#FFFFFF] p-6 shadow-lg ring-1 ring-black/5 md:p-8">
      <div className="mb-8 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#54342C]">KROOKIES ACCOUNT</p>
        <h1 className="text-3xl font-black text-[#54342C] sm:text-4xl">Новый пароль</h1>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">Новый пароль</span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-[#E6AECB] bg-white px-4 py-3 pr-14 text-[#54342C] outline-none focus:border-[#54342C]"
            />
            <PasswordToggleButton
              shown={showPassword}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">Повторите пароль</span>
          <div className="relative">
            <input
              type={showRepeatPassword ? "text" : "password"}
              value={repeatPassword}
              onChange={(event) => setRepeatPassword(event.target.value)}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-[#E6AECB] bg-white px-4 py-3 pr-14 text-[#54342C] outline-none focus:border-[#54342C]"
            />
            <PasswordToggleButton
              shown={showRepeatPassword}
              onClick={() => setShowRepeatPassword((current) => !current)}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            />
          </div>
        </label>

        <Button type="submit" disabled={isLoading || isSuccess} className="w-full">
          {isLoading ? "Сохраняем пароль..." : "Сохранить новый пароль"}
        </Button>
      </form>

      {message ? <p className="mt-5 text-center text-sm font-semibold text-[#54342C]">{message}</p> : null}

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm font-semibold text-[#54342C] hover:opacity-80">
          Вернуться ко входу
        </Link>
      </div>
    </div>
  );
}
