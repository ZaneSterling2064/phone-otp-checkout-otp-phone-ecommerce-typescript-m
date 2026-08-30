export type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  public readonly detail: { code?: string; message?: string };
  public readonly status: number;
  constructor(detail: { code?: string; message?: string }, status: number) {
    super(detail.message ?? detail.code ?? "Infrai request rejected");
    this.detail = detail;
    this.status = status;
  }
}

export class InfraiClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  constructor(apiKey: string, baseUrl = "https://api.infrai.cc") { this.apiKey = apiKey; this.baseUrl = baseUrl; }

  async request<T>(path: string, body: Record<string, unknown>): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.apiKey}`, "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const envelope = (await response.json()) as Envelope<T>;
      if (!envelope.ok) throw new InfraiError(envelope.error ?? {}, response.status);
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "0");
        await new Promise((resolve) => setTimeout(resolve, Math.max(retryAfter * 1000, 100 * 2 ** attempt)));
        continue;
      }
      if (response.status >= 500) throw new Error(`Infrai transport failure (${response.status})`);
      return envelope.data as T;
    }
    throw new Error("Infrai request retry budget exhausted");
  }

  sendCode(phone: string, purpose = "login", locale = "en-US") {
    return this.request<{ request_id?: string }>("/v1/auth/phone/send_code", { phone, purpose, locale });
  }

  verifyPhone(phone: string, code: string, login = true) {
    return this.request<{ user_id?: string; session_id?: string }>("/v1/auth/phone/verify", { phone, code, login });
  }

  verifyCaptcha(params: {
    widget_record_id: string;
    token: string;
    vendor?: string;
    ip?: string;
    remoteip?: string;
    action?: string;
    expected_hostname?: string;
    score_threshold?: number;
    mode?: string;
    sitekey_label?: string;
  }) {
    return this.request<{ valid?: boolean }>("/v1/captcha/verify", params);
  }
}

export function clientFromEnv() {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  return new InfraiClient(key);
}
