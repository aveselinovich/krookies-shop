import Link from "next/link";
import { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LEGAL_NAV_LINKS } from "@/lib/legal";

type LegalPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function LegalPage({ eyebrow, title, description, children }: LegalPageProps) {
  return (
    <main className="flex min-h-screen flex-col bg-[#FFF9FB]">
      <SiteHeader />
      <section className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 md:px-8 md:py-16">
        <div className="mb-8 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#54342C]">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#54342C] sm:text-4xl md:text-5xl">{title}</h1>
          <p className="mt-5 text-base leading-7 text-[#54342C] sm:text-lg sm:leading-8">{description}</p>
        </div>

        <nav className="mb-8 flex flex-wrap gap-3">
          {LEGAL_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full bg-[#FFF4F8] px-4 py-2 text-sm font-semibold text-[#54342C] ring-1 ring-[#E6AECB] transition hover:bg-[#FDECF3]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="rounded-[32px] bg-white p-6 shadow-lg ring-1 ring-black/5 sm:p-8 md:p-10">{children}</div>
      </section>
      <SiteFooter />
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-[#F2D6E5] py-8 first:border-t-0 first:pt-0 last:pb-0">
      <h2 className="text-2xl font-black text-[#54342C] sm:text-3xl">{title}</h2>
      <div className="mt-4 space-y-4 text-base leading-7 text-[#54342C]">{children}</div>
    </section>
  );
}
