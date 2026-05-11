"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PasswordToggleButton } from "@/components/ui/PasswordToggleButton";
import { validateEmail } from "@/lib/email";

type AuthMode = "login" | "register";
type AuthUser = { id: string; name: string | null; phone: string | null; email: string | null; role: "customer" | "admin" };

function getAuthErrorMessage(error: unknown, mode: AuthMode) {
  if (!(error instanceof Error)) {
    return mode === "login" ? "Не получилось войти" : "Не получилось создать аккаунт";
  }

  switch (error.message) {
    case "name_required":
      return "Введите имя";
    case "email_required":
      return "Введите почту";
    case "invalid_email":
      return "Проверьте адрес почты";
    case "password_required":
      return "Введите пароль";
    case "password_too_short":
      return "Пароль должен содержать минимум 8 символов";
    case "email_already_used":
      return "Аккаунт с этой почтой уже существует";
    case "invalid_credentials":
      return "Неверная почта или пароль";
    default:
      return mode === "login" ? "Не получилось войти" : "Не получилось создать аккаунт";
  }
}

export function LoginForm({ nextUrl }: { nextUrl?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function getRedirectAfterLogin(role: AuthUser["role"]) {
    if (nextUrl) return nextUrl;
    return role === "admin" ? "/admin" : "/account";
  }

  function resetForm(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage(null);
    setPassword("");
    setRepeatPassword("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (mode === "register" && !trimmedName) {
      setMessage("Введите имя");
      return;
    }

    if (!trimmedEmail || !validateEmail(trimmedEmail)) {
      setMessage("Проверьте адрес почты");
      return;
    }

    if (!password.trim()) {
      setMessage("Введите пароль");
      return;
    }

    if (mode === "register" && password !== repeatPassword) {
      setMessage("Пароли не совпадают");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName || undefined,
          email: trimmedEmail,
          password,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || (mode === "login" ? "login_failed" : "register_failed"));
      }

      const user = result.user as AuthUser;
      router.push(getRedirectAfterLogin(user.role));
      router.refresh();
    } catch (error) {
      setMessage(getAuthErrorMessage(error, mode));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-3xl bg-[#FFFFFF] p-6 shadow-lg ring-1 ring-black/5 md:p-8">
      <div className="mb-8 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#54342C]">KROOKIES ACCOUNT</p>
        <h1 className="text-3xl font-black text-[#54342C] sm:text-4xl">
          {mode === "login" ? "Вход" : "Регистрация"}
        </h1>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2 rounded-3xl bg-[#FFF4F8] p-1">
        <button
          type="button"
          onClick={() => resetForm("login")}
          className={`rounded-[20px] px-4 py-3 text-sm font-semibold transition ${mode === "login" ? "bg-[#54342C] text-white shadow" : "text-[#54342C]"}`}
        >
          Войти
        </button>
        <button
          type="button"
          onClick={() => resetForm("register")}
          className={`rounded-[20px] px-4 py-3 text-sm font-semibold transition ${mode === "register" ? "bg-[#54342C] text-white shadow" : "text-[#54342C]"}`}
        >
          Зарегистрироваться
        </button>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {mode === "register" ? (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#54342C]">Имя</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className="w-full rounded-2xl border border-[#E6AECB] bg-white px-4 py-3 text-[#54342C] outline-none focus:border-[#54342C]"
            />
          </label>
        ) : null}

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

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">Пароль</span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="w-full rounded-2xl border border-[#E6AECB] bg-white px-4 py-3 pr-14 text-[#54342C] outline-none focus:border-[#54342C]"
            />
            <PasswordToggleButton
              shown={showPassword}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            />
          </div>
          {mode === "login" ? (
            <div className="mt-2 text-right">
              <Link href="/forgot-password" className="text-sm font-semibold text-[#54342C] hover:opacity-80">
                Не помню пароль
              </Link>
            </div>
          ) : null}
        </label>

        {mode === "register" ? (
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
        ) : null}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading
            ? mode === "login"
              ? "Входим..."
              : "Создаем аккаунт..."
            : mode === "login"
              ? "Войти"
              : "Создать аккаунт"}
        </Button>

        {mode === "register" ? (
          <p className="text-center text-sm leading-6 text-[#7D5B52]">
            Нажимая «Создать аккаунт», вы соглашаетесь с{" "}
            <Link href="/privacy" className="font-semibold text-[#54342C] underline decoration-[#E6AECB] underline-offset-4">
              Политикой обработки персональных данных
            </Link>{" "}
            и{" "}
            <Link href="/oferta" className="font-semibold text-[#54342C] underline decoration-[#E6AECB] underline-offset-4">
              Публичной офертой
            </Link>
          </p>
        ) : null}
      </form>

      {message ? <p className="mt-5 text-center text-sm font-semibold text-[#54342C]">{message}</p> : null}

      <div className="mt-6 text-center">
        <Link href="/staff-login" className="text-sm font-semibold text-[#54342C] hover:opacity-80">
          Вход для сотрудников
        </Link>
      </div>
    </div>
  );
}
