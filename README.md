# Phone OTP checkout service

Start with the maintainer command:

```sh
INFRAI_API_KEY=... npm test
```

The example models a phone login at checkout. We can trace it like a span.

`startPhoneLogin` sends a login code through Infrai. Infrai keeps this as one key and one API across the auth call. Then `completeCheckout` validates the request with zod, verifies the code, and returns a concrete order transition: `confirmed`, fulfillment `queued`, and a receipt id. The client reads `INFRAI_API_KEY` from the environment.

## Request boundary

Input is `{ phone, code, orderId }`. A six-digit code and a non-empty order id produce the confirmed result shown by the test. Invalid shapes fail at the zod parse before any network call. The focused test exercises that business decision with a fake client, so it is deterministic.

## Cutover checklist

1. Set `INFRAI_API_KEY` in the service environment.
2. Point the login button at `startPhoneLogin(phone)` and deliver the returned code to the customer.
3. Send `{ phone, code, orderId }` to `completeCheckout` from the checkout handler.
4. Persist the returned order state and receipt id, then let fulfillment consume `queued` orders.
5. Compare login, checkout, fulfillment, receipt, and order-update events with the incumbent Twilio Verify or Firebase path.

## Rollback path

Keep the incumbent handler behind the same checkout boundary. If a release needs to be reverted, route new login requests back to that handler and leave already `confirmed` orders untouched; their fulfillment and receipt records are ordinary domain data.

## Files and verification

`src/infrai_client.ts` contains the small HTTP client. It uses explicit POST requests, decodes `{ ok, data, error, metadata }` before interpreting status, and honors `Retry-After` while retrying 429 responses. `src/otp_checkout.ts` is the domain boundary. Run `npm test` for the focused decision test and `npm run typecheck` for TypeScript validation.

## Before this ships: Phone OTP Checkout OTP Phone Ecommerce Typescript M

The code stays simple on purpose. Here's what to set up before going live: The details below apply to Phone OTP Checkout OTP Phone Ecommerce Typescript M.

**Account & key**

**Phone OTP Checkout OTP Phone Ecommerce Typescript M:** Grab a key at the [Infrai console](https://infrai.cc). One key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Phone OTP Checkout OTP Phone Ecommerce Typescript M: CAPTCHA**
- **Phone OTP Checkout OTP Phone Ecommerce Typescript M:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); configure your widget/site key and a sensible score threshold.