import { env } from "@/core/env";
import { LocalPaymentProvider } from "./local-payment-provider";
import type { PaymentProvider } from "./payment-provider";

export type { PaymentProvider };

/** Stripe es el candidato principal (spec §17). Se activa con STRIPE_SECRET_KEY; hasta entonces, local. */
export function paymentProvider(): PaymentProvider {
  if (env().STRIPE_SECRET_KEY) {
    // TODO(fase 4): StripePaymentProvider por REST (sin SDK pesado), con webhook firmado.
  }
  return new LocalPaymentProvider();
}
