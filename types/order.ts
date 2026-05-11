export type CheckoutCustomer = { name: string; phone: string; email?: string };
export type CheckoutDelivery = {
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
export type CreateOrderItem = { productId: string; quantity: number };
export type CreateOrderPayload = {
  customer: CheckoutCustomer;
  delivery: CheckoutDelivery;
  comment?: string;
  items: CreateOrderItem[];
};
export type CreateOrderResponse = {
  orderId: string;
  orderNumber: number;
  status: "pending_confirmation";
  total: number;
};
