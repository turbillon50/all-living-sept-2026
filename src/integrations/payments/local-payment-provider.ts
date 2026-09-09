import type { PaymentIntentInput, PaymentProvider, PaymentResult } from "./payment-provider";

/** ADAPTADOR LOCAL. No cobra. Registra el pago como DEMO para que el flujo completo sea probable. */
export class LocalPaymentProvider implements PaymentProvider {
  readonly name = "local";
  readonly isLocal = true;
  async createPayment(input: PaymentIntentInput): Promise<PaymentResult> {
    if (input.amount <= 0) return { status: "failed", provider: this.name, reason: "monto_invalido", demo: true };
    return { status: "succeeded", provider: this.name, providerRef: `local_${input.bookingId}`, demo: true };
  }
  async refund() {
    return { ok: true };
  }
}
