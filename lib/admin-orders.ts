import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getAdminOrders(status?: OrderStatus) {
  return prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      customerPhone: true,
      status: true,
      paymentStatus: true,
      deliveryStatus: true,
      total: true,
      paymentLinkSent: true,
      deliveryDesiredDate: true,
      deliveryDesiredSlot: true,
      createdAt: true,
      items: { select: { quantity: true } },
    },
  });
}

export async function getAdminDashboardStats() {
  const [pendingConfirmation, pendingPayment, accepted, baking, ready, delivered] = await Promise.all([
    prisma.order.count({ where: { status: "pending_confirmation" } }),
    prisma.order.count({ where: { status: "pending_payment" } }),
    prisma.order.count({ where: { status: "accepted" } }),
    prisma.order.count({ where: { status: "baking" } }),
    prisma.order.count({ where: { status: "ready" } }),
    prisma.order.count({ where: { status: "delivered" } }),
  ]);
  return { pendingConfirmation, pendingPayment, accepted, baking, ready, delivered };
}

export async function getAdminOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: { orderBy: { createdAt: "asc" } },
      payment: true,
      user: {
        select: {
          id: true,
          telegramUsername: true,
        },
      },
    },
  });
}
