import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "Новый пароль — KROOKIES" };

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#FFF9FB]">
      <section className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5 py-12 md:px-8">
        <div className="w-full max-w-xl">
          <ResetPasswordForm />
        </div>
      </section>
    </main>
  );
}
