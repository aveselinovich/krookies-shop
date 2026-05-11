import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  CONTACT_TELEGRAM_HANDLE,
  CONTACT_TELEGRAM_URL,
} from "@/lib/legal";

export const metadata = {
  title: "Оплата, доставка и возврат — KROOKIES",
  description: "Условия оплаты, доставки и возврата заказов KROOKIES.",
};

export default function DeliveryPaymentPage() {
  return (
    <LegalPage
      eyebrow="KROOKIES ORDER FLOW"
      title="Оплата, доставка и возврат"
      description="Здесь описан реальный порядок работы заказа в KROOKIES: от заявки на сайте до подтверждения, оплаты и доставки."
    >
      <LegalSection title="1. Как оформляется заказ">
        <p>Покупатель добавляет товары в корзину и отправляет заказ через сайт. После этого менеджер проверяет:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>возможность приготовления заказа к желаемой дате;</li>
          <li>доступность адреса доставки;</li>
          <li>корректность состава заказа и контактных данных.</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Как проходит оплата">
        <p>
          После подтверждения заказа менеджер направляет покупателю ссылку на оплату товара. До подтверждения менеджером оплата через сайт может быть
          недоступна.
        </p>
        <p>
          Стоимость доставки может оплачиваться отдельно, если это следует из условий конкретного заказа и выбранного способа доставки.
        </p>
      </LegalSection>

      <LegalSection title="3. Доставка">
        <p>
          На текущий момент доставка выполняется по Москве и Московской области. Время доставки является желаемым и подтверждается менеджером исходя из
          производственного графика и возможностей доставки.
        </p>
        <p>
          Если доставка по указанному адресу невозможна, продавец связывается с покупателем для изменения условий заказа или отмены.
        </p>
      </LegalSection>

      <LegalSection title="4. Отмена заказа и возврат средств">
        <p>
          Если заказ еще не подтвержден или не запущен в производство, его можно отменить по согласованию с менеджером. Если оплата уже произведена,
          возврат осуществляется способом, предусмотренным платежным сервисом и законодательством.
        </p>
      </LegalSection>

      <LegalSection title="5. Возврат продукции">
        <p>
          Продовольственные товары надлежащего качества, как правило, не подлежат возврату и обмену. Если у покупателя есть претензии к качеству, составу,
          комплектности или состоянию продукции, необходимо как можно скорее связаться с продавцом для рассмотрения ситуации.
        </p>
      </LegalSection>

      <LegalSection title="6. Как с нами связаться">
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
