import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  CONTACT_TELEGRAM_HANDLE,
  CONTACT_TELEGRAM_URL,
  SELLER_INN,
  SELLER_NAME,
  SELLER_OGRNIP,
} from "@/lib/legal";

export const metadata = {
  title: "Реквизиты — KROOKIES",
  description: "Реквизиты и контакты продавца KROOKIES.",
};

export default function RequisitesPage() {
  return (
    <LegalPage
      eyebrow="KROOKIES LEGAL"
      title="Реквизиты продавца"
      description="На этой странице указаны основные сведения о продавце и контакты для вопросов по заказам, персональным данным и качеству продукции."
    >
      <LegalSection title="Продавец">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-[#FFF9FB] p-5 ring-1 ring-[#F2D6E5]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8B6A61]">Наименование</p>
            <p className="mt-2 text-lg font-bold text-[#54342C]">{SELLER_NAME}</p>
          </div>
          <div className="rounded-3xl bg-[#FFF9FB] p-5 ring-1 ring-[#F2D6E5]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8B6A61]">ИНН</p>
            <p className="mt-2 text-lg font-bold text-[#54342C]">{SELLER_INN}</p>
          </div>
          <div className="rounded-3xl bg-[#FFF9FB] p-5 ring-1 ring-[#F2D6E5] sm:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8B6A61]">ОГРНИП</p>
            <p className="mt-2 text-lg font-bold text-[#54342C]">{SELLER_OGRNIP}</p>
          </div>
        </div>
      </LegalSection>

      <LegalSection title="Контакты">
        <p>
          Телефон:{" "}
          <a href={CONTACT_PHONE_HREF} className="font-semibold underline decoration-[#E6AECB] underline-offset-4">
            {CONTACT_PHONE_DISPLAY}
          </a>
        </p>
        <p>
          Email:{" "}
          <a href={CONTACT_EMAIL_HREF} className="font-semibold underline decoration-[#E6AECB] underline-offset-4">
            {CONTACT_EMAIL}
          </a>
        </p>
        <p>
          Telegram:{" "}
          <a href={CONTACT_TELEGRAM_URL} target="_blank" rel="noreferrer" className="font-semibold underline decoration-[#E6AECB] underline-offset-4">
            {CONTACT_TELEGRAM_HANDLE}
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
