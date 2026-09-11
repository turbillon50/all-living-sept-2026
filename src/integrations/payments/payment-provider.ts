/** Pagos. Solo un adaptador real cobra; el local registra intención marcada como DEMO y nunca mueve dinero. */
export type PaymentIntentInput = {
  bookingId: string;
  payerUserId: string;
  amount: number;
  currency: string;
  description: string;
};
export type PaymentResult =
  | { status: "succeeded"; provider: string; providerRef: string; demo: boolean }
  | { status: "pending"; provider: string; providerRef: string; clientSecret?: string; demo: boolean }
  | { status: "failed"; provider: string; reason: string; demo: boolean };

export interface PaymentProvider {
  readonly name: string;
  readonly isLocal: boolean;
  createPayment(input: PaymentIntentInput): Promise<PaymentResult>;
  refund(providerRef: string, amount?: number): Promise<{ ok: boolean; reason?: string }>;
}
