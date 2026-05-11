import Link from "next/link";
import { CONTACT_EMAIL, CONTACT_EMAIL_HREF, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF, LEGAL_NAV_LINKS } from "@/lib/legal";

const PINK = "#E6AECB";
const BROWN = "#54342C";

export function SiteFooter() {
  return (
    <footer className="mt-auto py-10" style={{ backgroundColor: BROWN, color: "#FDECF3" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr]">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <div className="h-11 w-11 rounded-full" style={{ backgroundColor: PINK }}>
                <img src="/logo-cookie.png" alt="KROOKIES" className="h-9 w-auto translate-x-1 translate-y-1" />
              </div>
              <span className="text-lg font-black tracking-wide">KROOKIES</span>
            </div>
            <p className="mt-2 opacity-90">
              American cookies с текучей начинкой. Каждый день — повод для сладкой, счастливой жизни
            </p>
          </div>

          <div className="text-center text-sm opacity-90 md:text-right">
            <p>
              <a href={CONTACT_PHONE_HREF} className="transition hover:opacity-100 hover:underline">
                {CONTACT_PHONE_DISPLAY}
              </a>
            </p>
            <p className="mt-2">
              <a href={CONTACT_EMAIL_HREF} className="transition hover:opacity-100 hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
            <p className="mt-4">
              © 2026 Krookies — Все права защищены.
            </p>
            <p className="mt-1">Оформление заказа через сайт</p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/15 pt-6">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-[#FDECF3]/75">
            Документы
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {LEGAL_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-[#FDECF3] transition hover:bg-white/20"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
