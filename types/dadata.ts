export type AddressSuggestion = {
  value: string;
  unrestrictedValue: string;
  region: string;
  city: string;
  street: string;
  house: string;
  flat?: string;
  isDeliveryArea: boolean;
};
