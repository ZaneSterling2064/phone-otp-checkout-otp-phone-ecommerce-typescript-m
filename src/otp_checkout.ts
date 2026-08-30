import { z } from "zod";
import { clientFromEnv, InfraiClient } from "./infrai_client.js";

export const CheckoutRequest = z.object({ widget_record_id: z.string().min(1), token: z.string().min(1), orderId: z.string().min(1) });
export type CheckoutRequest = z.infer<typeof CheckoutRequest>;

export async function completeCheckout(input: unknown, client: InfraiClient = clientFromEnv()) {
  const request = CheckoutRequest.parse(input);
  await client.verifyCaptcha({ widget_record_id: request.widget_record_id, token: request.token });
  return { orderId: request.orderId, state: "confirmed", fulfillment: "queued", receipt: `receipt:${request.orderId}` } as const;
}

export async function startPhoneLogin(phone: string, client: InfraiClient = clientFromEnv()) {
  return client.sendCode(phone, "login", "en-US");
}
