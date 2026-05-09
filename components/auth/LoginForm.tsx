"use client";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { formatPhoneInput, validatePhone } from "@/lib/phone";

type Step = "phone" | "code";
type AuthUser = { id: string; name: string | null; phone: string; email: string | null; role: "customer" | "admin" };

function getSendCodeErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Не получилось отправить код. Попробуйте еще раз";
  }

  switch (error.message) {
    case "invalid_phone":
      return "Проверьте номер телефона";
    case "sms_not_configured":
      return "Отправка SMS пока не настроена";
    case "direct_verifier_402":
      return "На SMS-аккаунте недостаточно средств";
    case "direct_verifier_4010":
    case "direct_verifier_4012":
    case "direct_verifier_4013":
    case "direct_verifier_4030":
      return "Ошибка настройки SMS-сервиса";
    case "direct_verifier_4220":
    case "direct_verifier_4222":
    case "direct_verifier_4223":
      return "SMS-сервис вернул ошибку параметров отправки";
    default:
      return "Не получилось отправить код. Попробуйте еще раз";
  }
}

export function LoginForm({ nextUrl }: { nextUrl?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [requiresName, setRequiresName] = useState(false);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);

  useEffect(() => {
    if (resendSecondsLeft <= 0) return;

    const timerId = window.setInterval(() => {
      setResendSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [resendSecondsLeft]);

  function getRedirectAfterLogin(role: AuthUser["role"]) {
    if (nextUrl) return nextUrl;
    return role === "admin" ? "/admin" : "/";
  }

  async function requestCode(targetPhone: string) {
    const response = await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: targetPhone }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "send_code_failed");
    }

    setPhone(formatPhoneInput(result.phone));
    setStep("code");
    setResendSecondsLeft(60);
    setMessage(result.alreadySent ? "Код уже отправлен. Введите его ниже" : null);
  }

  async function sendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validatePhone(phone)) {
      setMessage("Проверьте номер телефона");
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      await requestCode(phone);
    } catch (error) {
      setMessage(getSendCodeErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function resendCode() {
    if (resendSecondsLeft > 0) return;

    setIsLoading(true);
    setMessage(null);

    try {
      await requestCode(phone);
    } catch (error) {
      setMessage(getSendCodeErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: code.replace(/\D/g, "") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "verify_code_failed");

      const user = result.user as AuthUser;

      if (result.requiresName) {
        setRequiresName(true);
        setName(user.name || "");
        return;
      }

      router.push(getRedirectAfterLogin(user.role));
      router.refresh();
    } catch {
      setMessage("Неверный код или срок действия кода истек");
    } finally {
      setIsLoading(false);
    }
  }

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setMessage("Введите имя, чтобы продолжить");
      return;
    }

    setIsSavingName(true);
    setMessage(null);

    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "profile_update_failed");
      }

      setRequiresName(false);
      router.push("/");
      router.refresh();
    } catch {
      setMessage("Не получилось сохранить имя");
    } finally {
      setIsSavingName(false);
    }
  }

  function handleCodeChange(value: string) {
    setCode(value.replace(/\D/g, "").slice(0, 4));
  }

  function formatCountdown(totalSeconds: number) {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  return (
    <div className="rounded-3xl bg-[#FFFFFF] p-6 shadow-lg ring-1 ring-black/5 md:p-8">
      <div className="mb-8 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#54342C]">KROOKIES LOGIN</p>
        <h1 className="text-3xl font-black text-[#54342C] sm:text-4xl">Вход</h1>
      </div>
      {step === "phone" ? (
        <form onSubmit={sendCode} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#54342C]">Телефон</span>
            <input
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
              placeholder="+7 999 000-00-00"
              autoComplete="tel"
              inputMode="tel"
              className="w-full rounded-2xl border border-[#E6AECB] bg-white px-4 py-3 text-[#54342C] outline-none focus:border-[#54342C]"
            />
          </label>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Отправляем код..." : "Получить код"}
          </Button>
          <div className="text-center">
            <Link href="/staff-login" className="text-sm font-semibold text-[#54342C] hover:opacity-80">
              Вход для сотрудников
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="space-y-5">
          <div className="rounded-[24px] bg-[#FFF4F8] p-4">
            <p className="text-sm leading-6 text-[#54342C]">Код отправлен на номер:</p>
            <p className="mt-1 font-semibold text-[#54342C]">{phone}</p>
            <div className="mt-4 border-t border-[#E6AECB] pt-4 text-sm text-[#54342C]">
              {resendSecondsLeft > 0 ? (
                <p>Повторная отправка будет доступна через {formatCountdown(resendSecondsLeft)}</p>
              ) : (
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={isLoading}
                  className="font-semibold hover:opacity-80 disabled:opacity-50"
                >
                  Отправить код повторно
                </button>
              )}
            </div>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#54342C]">Код из SMS</span>
            <input
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="1111"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              className="w-full rounded-2xl border border-[#E6AECB] bg-white px-4 py-3 text-center text-2xl font-black tracking-[0.24em] text-[#54342C] outline-none focus:border-[#54342C] sm:tracking-[0.4em]"
            />
          </label>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Проверяем..." : "Войти"}
          </Button>
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setCode("");
              setMessage(null);
              setResendSecondsLeft(0);
            }}
            className="w-full text-sm font-semibold text-[#54342C] hover:text-[#54342C]"
          >
            Изменить телефон
          </button>
          <div className="text-center">
            <Link href="/staff-login" className="text-sm font-semibold text-[#54342C] hover:opacity-80">
              Вход для сотрудников
            </Link>
          </div>
        </form>
      )}
      {message ? <p className="mt-5 text-center text-sm font-semibold text-[#54342C]">{message}</p> : null}

      {requiresName ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#54342C]/40 px-5">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/5 md:p-8">
            <h2 className="text-2xl font-black text-[#54342C] sm:text-3xl">Как вас зовут?</h2>
            <p className="mt-3 leading-7 text-[#54342C]">
              Укажите имя, чтобы мы могли оформить ваш профиль и заказы
            </p>

            <form onSubmit={saveName} className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#54342C]">Имя</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ваше имя"
                  autoFocus
                  className="w-full rounded-2xl border border-[#E6AECB] bg-white px-4 py-3 text-[#54342C] outline-none focus:border-[#54342C]"
                />
              </label>
              <Button type="submit" disabled={isSavingName || !name.trim()} className="w-full">
                {isSavingName ? "Сохраняем..." : "Продолжить"}
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
