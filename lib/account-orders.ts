import { prisma } from "@/lib/prisma";

export async function getAccountOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      deliveryStatus: true,
      total: true,
      createdAt: true,
      items: { select: { quantity: true } },
    },
  });
}

export async function getRecentAccountOrders(userId: string, limit = 3) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      deliveryStatus: true,
      total: true,
      createdAt: true,
      items: { select: { quantity: true } },
    },
  });
}

export async function getAccountOrderById(userId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              shortDescription: true,
              imageUrl: true,
              price: true,
              isAvailable: true,
              isPublished: true,
            },
          },
        },
      },
      payment: true,
    },
  });
}
