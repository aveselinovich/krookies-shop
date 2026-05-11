import { DeliveryStatus, OrderStatus, PaymentStatus } from "@prisma/client";
import { parseDeliveryAddress } from "@/lib/address";
import { findBestDadataAddressSuggestion } from "@/lib/dadata-address";
import { prisma } from "@/lib/prisma";
import { isDeliveryDateTooEarly } from "@/lib/delivery-date";
import { normalizePhone, validatePhone } from "@/lib/phone";
import { createYookassaPayment, YookassaWebhookBody, yookassaAmountToKopecks } from "@/lib/yookassa";
import { notifyTelegramSubscribersAboutOrder } from "@/lib/telegram";

type CreateOrderInput = {
  customer: { name: string; phone: string; email?: string };
  delivery: {
    city: string;
    street: string;
    house: string;
    addressLine?: string;
    apartment?: string;
    entrance?: string;
    floor?: string;
    desiredDate?: string;
    desiredSlot?: string;
    comment?: string;
  };
  comment?: string;
  items: { productId: string; slug?: string; quantity: number }[];
};

const CUSTOMER_CANCELLABLE_ORDER_STATUSES: OrderStatus[] = ["pending_confirmation", "pending_payment"];

export function canCustomerCancelOrder(status: OrderStatus, paymentStatus: PaymentStatus) {
  return CUSTOMER_CANCELLABLE_ORDER_STATUSES.includes(status) && paymentStatus === "pending";
}

export async function createOrder(input: CreateOrderInput) {
  if (!input.items?.length) throw new Error("cart_is_empty");

  const customerName = input.customer.name.trim();
  const customerPhone = normalizePhone(input.customer.phone);
  const customerEmail = input.customer.email?.trim().toLowerCase() || null;

  if (!customerName) throw new Error("customer_name_required");
  if (!validatePhone(customerPhone)) throw new Error("invalid_phone");
  if (customerEmail && !/^\S+@\S+\.\S+$/.test(customerEmail)) throw new Error("invalid_email");
  const dadataSuggestion = input.delivery.addressLine ? await findBestDadataAddressSuggestion(input.delivery.addressLine) : null;
  if (dadataSuggestion && !dadataSuggestion.isDeliveryArea) throw new Error("delivery_out_of_area");
  const parsedAddress = input.delivery.addressLine ? parseDeliveryAddress(input.delivery.addressLine) : null;
  const deliveryCity = dadataSuggestion?.city || parsedAddress?.city || input.delivery.city.trim();
  const deliveryStreet = dadataSuggestion?.street || parsedAddress?.street || input.delivery.street.trim();
  const deliveryHouse = dadataSuggestion?.house || parsedAddress?.house || input.delivery.house.trim();
  if (!deliveryCity) throw new Error("delivery_city_required");
  if (!deliveryStreet || !deliveryHouse) throw new Error("invalid_delivery_address");
  if (isDeliveryDateTooEarly(input.delivery.desiredDate)) throw new Error("delivery_date_too_early");

  const normalizedItems = input.items.map((item) => ({
    productId: item.productId,
    slug: item.slug?.trim() || null,
    quantity: Number(item.quantity),
  }));
  if (normalizedItems.some((item) => !item.quantity || item.quantity <= 0)) throw new Error("invalid_quantity");

  const productIds = normalizedItems.map((item) => item.productId).filter(Boolean);
  const productSlugs = normalizedItems
    .map((item) => item.slug)
    .filter((slug): slug is string => Boolean(slug));
  const products = await prisma.product.findMany({
    where: {
      isPublished: true,
      OR: [{ id: { in: productIds } }, { slug: { in: productSlugs } }],
    },
  });

  const orderItems = normalizedItems.map((item) => {
    const product = products.find(
      (current) => current.id === item.productId || (item.slug ? current.slug === item.slug : false)
    );
    if (!product) throw new Error("product_not_found");
    if (!product.isAvailable) throw new Error("product_unavailable");
    return {
      productId: product.id,
      productName: product.title,
      productPrice: product.price,
      quantity: item.quantity,
      total: product.price * item.quantity,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const discount = 0;
  const total = subtotal - discount;

  const user = await prisma.user.upsert({
    where: { phone: customerPhone },
    update: { name: customerName, email: customerEmail },
    create: { name: customerName, phone: customerPhone, email: customerEmail },
  });

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      customerName,
      customerPhone,
      customerEmail,
      status: "pending_confirmation",
      paymentStatus: "pending",
      deliveryStatus: "not_created",
      subtotal,
      discount,
      total,
      deliveryProvider: "yandex_manual",
      deliveryPaymentType: "external_yandex_link",
      deliveryCity,
      deliveryStreet,
      deliveryHouse,
      deliveryApartment: input.delivery.apartment?.trim() || null,
      deliveryEntrance: input.delivery.entrance?.trim() || null,
      deliveryFloor: input.delivery.floor?.trim() || null,
      deliveryIntercom: null,
      deliveryDesiredDate: input.delivery.desiredDate ? new Date(input.delivery.desiredDate) : null,
      deliveryDesiredSlot: input.delivery.desiredSlot || null,
      deliveryComment: input.delivery.comment?.trim() || null,
      customerComment: input.comment?.trim() || null,
      items: { create: orderItems },
    },
    include: { items: true },
  });

  try {
    await notifyTelegramSubscribersAboutOrder({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName,
      customerPhone,
      customerEmail,
      total: order.total,
      deliveryCity: order.deliveryCity,
      deliveryStreet: order.deliveryStreet,
      deliveryHouse: order.deliveryHouse,
      deliveryApartment: order.deliveryApartment,
      deliveryDesiredSlot: order.deliveryDesiredSlot,
      deliveryComment: order.deliveryComment,
      customerComment: order.customerComment,
      createdAt: order.createdAt,
    });
  } catch (error) {
    console.error("Telegram order notification error:", error);
  }

  return { orderId: order.id, orderNumber: order.orderNumber, status: order.status, total: order.total };
}

export async function updateOrderManagerComment(orderId: string, managerComment: string) {
  return prisma.order.update({ where: { id: orderId }, data: { managerComment } });
}

export async function updateOrderStatus(orderId: string, nextStatus: OrderStatus) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("order_not_found");

  const data: { status: OrderStatus; deliveryStatus?: DeliveryStatus } = { status: nextStatus };

  if (nextStatus === "delivered") {
    data.deliveryStatus = "delivered";
  }

  return prisma.order.update({ where: { id: orderId }, data });
}

export async function updateOrderDeliveryStatus(orderId: string, deliveryStatus: DeliveryStatus) {
  const data: { deliveryStatus: DeliveryStatus; status?: OrderStatus } = { deliveryStatus };
  if (deliveryStatus === "delivered") data.status = "delivered";
  return prisma.order.update({ where: { id: orderId }, data });
}

export async function cancelCustomerOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { payment: true },
  });

  if (!order) throw new Error("order_not_found");
  if (order.status === "cancelled") return order;
  if (!canCustomerCancelOrder(order.status, order.paymentStatus)) {
    throw new Error("order_cannot_be_cancelled");
  }

  return prisma.$transaction(async (tx) => {
    if (order.payment && order.payment.status === "pending") {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: { status: "failed" },
      });
    }

    return tx.order.update({
      where: { id: order.id },
      data: {
        status: "cancelled",
        paymentStatus: order.paymentStatus === "pending" ? "failed" : order.paymentStatus,
      },
    });
  });
}

export async function setPaymentLinkSent(orderId: string, sent: boolean) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } });
  if (!order) throw new Error("order_not_found");
  if (!order.payment?.paymentUrl) throw new Error("payment_link_not_found");
  return prisma.order.update({
    where: { id: orderId },
    data: {
      paymentLinkSent: sent,
      paymentLinkSentAt: sent ? new Date() : null,
    },
  });
}

export async function createOrderPaymentLink(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } });
  if (!order) throw new Error("order_not_found");
  if (order.status !== "pending_confirmation") throw new Error("order_must_be_pending_confirmation");
  if (order.paymentStatus !== "pending") throw new Error("payment_status_must_be_pending");
  if (order.total <= 0) throw new Error("invalid_order_total");
  if (order.payment?.paymentUrl) return { paymentUrl: order.payment.paymentUrl, orderStatus: order.status, alreadyExists: true };

  const yookassaPayment = await createYookassaPayment({
    orderId: order.id,
    orderNumber: order.orderNumber,
    amount: order.total,
    description: `Заказ KROOKIES #${order.orderNumber}`,
  });

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "pending_payment",
      payment: {
        create: {
          provider: "yookassa",
          providerPaymentId: yookassaPayment.providerPaymentId,
          status: "pending",
          amount: order.total,
          currency: "RUB",
          paymentUrl: yookassaPayment.paymentUrl,
          rawResponse: yookassaPayment.rawResponse,
        },
      },
    },
    include: { payment: true },
  });

  return { paymentUrl: updatedOrder.payment?.paymentUrl, orderStatus: updatedOrder.status, alreadyExists: false };
}

export async function saveManualOrderPaymentLink(orderId: string, paymentUrl: string) {
  const normalizedPaymentUrl = paymentUrl.trim();
  if (!normalizedPaymentUrl) throw new Error("payment_link_required");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });
  if (!order) throw new Error("order_not_found");
  if (order.status !== "pending_confirmation" && order.status !== "pending_payment") {
    throw new Error("order_must_allow_payment_link");
  }
  if (order.paymentStatus === "paid") {
    throw new Error("order_already_paid");
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "pending_payment",
      paymentStatus: "pending",
      paymentLinkSent: false,
      paymentLinkSentAt: null,
      payment: order.payment
        ? {
            update: {
              paymentUrl: normalizedPaymentUrl,
              status: "pending",
              amount: order.total,
            },
          }
        : {
            create: {
              provider: "manual_link",
              status: "pending",
              amount: order.total,
              currency: "RUB",
              paymentUrl: normalizedPaymentUrl,
            },
          },
    },
    include: { payment: true },
  });

  return {
    paymentUrl: updatedOrder.payment?.paymentUrl,
    orderStatus: updatedOrder.status,
  };
}

export async function handleYookassaWebhook(body: YookassaWebhookBody) {
  const event = body.event;
  const providerPaymentId = body.object.id;
  if (!providerPaymentId) throw new Error("provider_payment_id_missing");

  const payment = await prisma.payment.findUnique({ where: { providerPaymentId }, include: { order: true } });
  if (!payment) throw new Error("payment_not_found");

  const order = payment.order;
  if (body.object.amount?.value) {
    const webhookAmount = yookassaAmountToKopecks(body.object.amount.value);
    if (webhookAmount !== payment.amount) throw new Error("payment_amount_mismatch");
  }

  if (event === "payment.succeeded") {
    if (payment.status === "paid" && order.paymentStatus === "paid") return { ok: true, alreadyProcessed: true };
    await prisma.$transaction([
      prisma.payment.update({ where: { id: payment.id }, data: { status: "paid", paidAt: new Date(), rawWebhook: body } }),
      prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "paid", status: "accepted" } }),
    ]);
    return { ok: true, alreadyProcessed: false };
  }

  if (event === "payment.canceled") {
    if (payment.status === "paid") return { ok: true, alreadyProcessed: true };
    await prisma.$transaction([
      prisma.payment.update({ where: { id: payment.id }, data: { status: "failed", rawWebhook: body } }),
      prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "failed" } }),
    ]);
    return { ok: true, alreadyProcessed: false };
  }

  return { ok: true, ignored: true };
}
