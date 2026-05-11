import { User } from "@prisma/client";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { AccountTabs } from "@/components/account/AccountTabs";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export function AccountShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col bg-[#FFF9FB]">
      <SiteHeader />

      <section className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 md:px-8 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="min-w-0">
            <h1 className="text-3xl font-black uppercase leading-tight text-[#54342C] sm:text-4xl">
              Личный
              <br className="hidden lg:block" />
              <span className="lg:ml-0 ml-2 lg:inline">кабинет</span>
            </h1>

            <AccountTabs />

            <div className="hidden pt-5 lg:block">
              <LogoutButton variant="accent" className="w-full justify-center" />
            </div>
          </aside>

          <div className="min-w-0">
            {children}

            <div className="mt-6 lg:hidden">
              <LogoutButton variant="accent" className="w-full justify-center rounded-3xl px-6 py-5 text-base font-black tracking-normal" />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
