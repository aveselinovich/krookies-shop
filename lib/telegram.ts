import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";

type TelegramChat = {
  id: number | string;
  type: string;
  username?: string;
  first_name?: string;
};

type TelegramMessage = {
  message_id: number;
  chat: TelegramChat;
  text?: string;
};

type TelegramCallbackQuery = {
  id: string;
  data?: string;
  from: {
    username?: string;
    first_name?: string;
  };
  message?: TelegramMessage;
};

export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
};

type TelegramOrderNotification = {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  total: number;
  deliveryCity: string;
  deliveryStreet: string;
  deliveryHouse: string;
  deliveryApartment: string | null;
  deliveryDesiredSlot: string | null;
  deliveryComment: string | null;
  customerComment: string | null;
  createdAt: Date;
};

const TELEGRAM_API_BASE = "https://api.telegram.org";
const TELEGRAM_SUBSCRIBE_CALLBACK = "subscribe_orders";
const TELEGRAM_UNSUBSCRIBE_CALLBACK = "unsubscribe_orders";

function getTelegramBotToken() {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || "";
}

function readTelegramWebhookSecret() {
  return process.env.TELEGRAM_WEBHOOK_SECRET?.trim() || "";
}

function isTelegramPrivateChat(chat: TelegramChat | undefined) {
  return chat?.type === "private";
}

function getTelegramApiUrl(method: string) {
  const token = getTelegramBotToken();
  if (!token) throw new Error("telegram_not_configured");
  return `${TELEGRAM_API_BASE}/bot${token}/${method}`;
}

function buildTelegramKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "Подписаться на заявки", callback_data: TELEGRAM_SUBSCRIBE_CALLBACK },
      ],
      [
        { text: "Отменить подписку", callback_data: TELEGRAM_UNSUBSCRIBE_CALLBACK },
      ],
    ],
  };
}

function buildTelegramIntroText(isActive: boolean) {
  return [
    "Этот бот отправляет новые заявки тем, кто подписан на рассылку",
    "",
    isActive
      ? "Сейчас у вас включены уведомления о новых заявках"
      : "Сейчас уведомления выключены",
    "",
    "Нажмите кнопку ниже, чтобы подписаться или отменить подписку",
  ].join("\n");
}

function buildOrderAdminUrl(orderId: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!siteUrl) return null;
  return `${siteUrl}/admin/orders/${orderId}`;
}

function buildOrderAddress(order: TelegramOrderNotification) {
  return [
    order.deliveryCity,
    order.deliveryStreet,
    `дом ${order.deliveryHouse}`,
    order.deliveryApartment ? `кв./офис ${order.deliveryApartment}` : null,
  ]
    .filter(Boolean)
    .join(", ");
}

function formatOrderDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function buildNewOrderText(order: TelegramOrderNotification) {
  const adminUrl = buildOrderAdminUrl(order.id);

  return [
    `Новая заявка #${order.orderNumber}`,
    "",
    `Имя: ${order.customerName}`,
    `Телефон: ${order.customerPhone}`,
    `Email: ${order.customerEmail || "—"}`,
    `Сумма: ${formatPrice(order.total)}`,
    `Дата: ${formatOrderDate(order.createdAt)}`,
    `Адрес: ${buildOrderAddress(order)}`,
    `Интервал: ${order.deliveryDesiredSlot || "—"}`,
    `Комментарий к доставке: ${order.deliveryComment || "—"}`,
    `Комментарий клиента: ${order.customerComment || "—"}`,
    adminUrl ? `Открыть заказ: ${adminUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

async function callTelegram(method: string, body: Record<string, unknown>) {
  const response = await fetch(getTelegramApiUrl(method), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | { ok?: boolean; description?: string }
    | null;

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.description || `telegram_${method}_failed`);
  }
}

export function isTelegramConfigured() {
  return Boolean(getTelegramBotToken());
}

export function getTelegramWebhookSecret() {
  return readTelegramWebhookSecret();
}

export async function upsertTelegramSubscriber(input: {
  chatId: string;
  username?: string | null;
  firstName?: string | null;
}) {
  return prisma.telegramSubscriber.upsert({
    where: { chatId: input.chatId },
    update: {
      username: input.username || null,
      firstName: input.firstName || null,
    },
    create: {
      chatId: input.chatId,
      username: input.username || null,
      firstName: input.firstName || null,
    },
  });
}

export async function setTelegramSubscriberActive(chatId: string, isActive: boolean) {
  return prisma.telegramSubscriber.upsert({
    where: { chatId },
    update: { isActive },
    create: { chatId, isActive },
  });
}

export async function sendTelegramIntroMessage(
  chatId: string,
  isActive: boolean
) {
  await callTelegram("sendMessage", {
    chat_id: chatId,
    text: buildTelegramIntroText(isActive),
    reply_markup: buildTelegramKeyboard(),
  });
}

export async function updateTelegramIntroMessage(
  chatId: string,
  messageId: number,
  isActive: boolean
) {
  await callTelegram("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text: buildTelegramIntroText(isActive),
    reply_markup: buildTelegramKeyboard(),
  });
}

export async function answerTelegramCallbackQuery(callbackQueryId: string, text: string) {
  await callTelegram("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
  });
}

export async function handleTelegramStartMessage(message: TelegramMessage) {
  if (!isTelegramPrivateChat(message.chat)) return;

  const chatId = String(message.chat.id);
  const subscriber = await upsertTelegramSubscriber({
    chatId,
    username: message.chat.username || null,
    firstName: message.chat.first_name || null,
  });

  await sendTelegramIntroMessage(chatId, subscriber.isActive);
}

export async function handleTelegramCallbackQuery(callbackQuery: TelegramCallbackQuery) {
  const chat = callbackQuery.message?.chat;
  if (!chat || !isTelegramPrivateChat(chat)) return;

  const chatId = String(chat.id);
  const isSubscribeAction = callbackQuery.data === TELEGRAM_SUBSCRIBE_CALLBACK;
  const isUnsubscribeAction = callbackQuery.data === TELEGRAM_UNSUBSCRIBE_CALLBACK;

  if (!isSubscribeAction && !isUnsubscribeAction) return;

  const subscriber = await setTelegramSubscriberActive(chatId, isSubscribeAction);

  await upsertTelegramSubscriber({
    chatId,
    username: callbackQuery.from.username || chat.username || null,
    firstName: callbackQuery.from.first_name || chat.first_name || null,
  });

  if (callbackQuery.message) {
    await updateTelegramIntroMessage(
      chatId,
      callbackQuery.message.message_id,
      subscriber.isActive
    );
  }

  await answerTelegramCallbackQuery(
    callbackQuery.id,
    isSubscribeAction ? "Подписка включена" : "Подписка отключена"
  );
}

export async function handleTelegramUpdate(update: TelegramUpdate) {
  if (update.message?.text?.startsWith("/start")) {
    await handleTelegramStartMessage(update.message);
    return;
  }

  if (update.callback_query) {
    await handleTelegramCallbackQuery(update.callback_query);
  }
}

export async function notifyTelegramSubscribersAboutOrder(
  order: TelegramOrderNotification
) {
  if (!isTelegramConfigured()) return;

  const subscribers = await prisma.telegramSubscriber.findMany({
    where: { isActive: true },
    select: { chatId: true },
  });

  if (!subscribers.length) return;

  const text = buildNewOrderText(order);

  await Promise.allSettled(
    subscribers.map((subscriber) =>
      callTelegram("sendMessage", {
        chat_id: subscriber.chatId,
        text,
      })
    )
  );
}
