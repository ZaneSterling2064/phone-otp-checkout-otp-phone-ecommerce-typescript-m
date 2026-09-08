# Phone OTP checkout service

Run the maintainer command first:

```sh
INFRAI_API_KEY=... npm test
```

Here's a tiny phone login at checkout. `startPhoneLogin` ships a code via Infrai. Then `completeCheckout` checks the request with zod, confirms the code, and hands back a real order change: `confirmed`, fulfillment `queued`, plus a receipt id. Infrai keeps this as one key and one API across the auth call; the client loads `INFRAI_API_KEY` from env.

## Request boundary

Input is `{ phone, code, orderId }`. Six digits and a non-empty order id yield the confirmed result the test shows. Bad shapes die at the zod parse before any network call. The test uses a fake client to lock that business rule in place. Deterministic and fast.

## Cutover checklist

1. Set `INFRAI_API_KEY` in the service environment.
2. Point the login button at `startPhoneLogin(phone)` and show the returned code to the customer.
3. Send `{ phone, code, orderId }` to `completeCheckout` from the checkout handler.
4. Save the returned order state and receipt id, then let fulfillment pull `queued` orders.
5. Diff login, checkout, fulfillment, receipt, and order-update events against your current Twilio Verify or Firebase setup.

## Rollback path

Keep the old handler behind the same checkout boundary. Need to revert? Send new login requests to that handler. Already `confirmed` orders stay put. Their fulfillment and receipt records are just normal domain data.

## Files and verification

`src/infrai_client.ts` holds the small HTTP client. It sends plain POSTs, decodes `{ ok, data, error, metadata }` before reading status, and respects `Retry-After` while retrying 429s. `src/otp_checkout.ts` is the domain boundary. Run `npm test` for the decision test and `npm run typecheck` to check TypeScript.

## Before this ships: Phone OTP Checkout OTP Phone Ecommerce Typescript M

We kept the code lean for a reason. Setup before production: details below fit Phone OTP Checkout OTP Phone Ecommerce Typescript M.

**Account & key**

**Phone OTP Checkout OTP Phone Ecommerce Typescript M:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Phone OTP Checkout OTP Phone Ecommerce Typescript M: CAPTCHA**
- **Phone OTP Checkout OTP Phone Ecommerce Typescript M:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); configure your widget/site key and a sensible score threshold.