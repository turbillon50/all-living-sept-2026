/** Mensajería (chat concierge, WhatsApp). Fase 6: hilos en DB. Twilio/WhatsApp cuando haya credenciales. */
export type OutboundMessage = { toUserId: string; channel: "in_app" | "whatsapp" | "sms"; text: string };

export interface MessagingProvider {
  readonly name: string;
  readonly isLocal: boolean;
  send(msg: OutboundMessage): Promise<{ delivered: boolean; ref?: string }>;
}

class LocalMessagingProvider implements MessagingProvider {
  readonly name = "local";
  readonly isLocal = true;
  async send(msg: OutboundMessage) {
    // Solo in_app existe hoy; whatsapp/sms devuelven no entregado, jamás "enviado" fingido.
    return { delivered: msg.channel === "in_app" };
  }
}

export function messaging(): MessagingProvider {
  return new LocalMessagingProvider();
}
