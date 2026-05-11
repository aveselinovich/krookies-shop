"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PasswordToggleButton } from "@/components/ui/PasswordToggleButton";

function getStaffLoginErrorMessage(error: string) {
  switch (error) {
    case "email_required":
      return "Введите почту";
    case "password_required":
      return "Введите пароль";
    case "invalid_staff_credentials":
      return "Неверная почта или пароль";
    default:
      return "Не получилось войти";
  }
}

export function StaffLoginForm({ nextUrl }: { nextUrl?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/staff-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "staff_login_failed");
      }

      router.push(nextUrl || "/admin");
      router.refresh();
    } catch (error) {
      setMessage(getStaffLoginErrorMessage(error instanceof Error ? error.message : "staff_login_failed"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-3xl bg-[#FFFFFF] p-6 shadow-lg ring-1 ring-black/5 md:p-8">
      <div className="mb-8 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#54342C]">KROOKIES STAFF</p>
        <h1 className="text-3xl font-black text-[#54342C] sm:text-4xl">Вход для сотрудников</h1>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">Почта</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            inputMode="email"
            autoComplete="email"
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
              autoComplete="current-password"
              className="w-full rounded-2xl border border-[#E6AECB] bg-white px-4 py-3 pr-14 text-[#54342C] outline-none focus:border-[#54342C]"
            />
            <PasswordToggleButton
              shown={showPassword}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            />
          </div>
        </label>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Проверяем..." : "Войти"}
        </Button>
      </form>

      {message ? <p className="mt-5 text-center text-sm font-semibold text-[#54342C]">{message}</p> : null}

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm font-semibold text-[#54342C] hover:opacity-80">
          Вернуться ко входу для клиентов
        </Link>
      </div>
    </div>
  );
}
