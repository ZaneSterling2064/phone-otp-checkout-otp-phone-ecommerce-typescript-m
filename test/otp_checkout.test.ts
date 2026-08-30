import assert from "node:assert/strict";
import { completeCheckout } from "../src/otp_checkout.js";

const calls: unknown[] = [];
const fake = { verifyCaptcha: async (...args: unknown[]) => { calls.push(args); return { valid: true }; } } as any;
const result = await completeCheckout({ widget_record_id: "wr-1", token: "token-7", orderId: "ord-7" }, fake);
assert.deepEqual(result, { orderId: "ord-7", state: "confirmed", fulfillment: "queued", receipt: "receipt:ord-7" });
assert.deepEqual(calls[0], [{ widget_record_id: "wr-1", token: "token-7" }]);
console.log("checkout decision: confirmed");
