const META_GRAPH_BASE_URL = "https://graph.facebook.com";

export interface WhatsAppPhoneNumberResponse {
  id: string;
  display_phone_number?: string;
  verified_name?: string;
}

export interface WhatsAppSendMessageResponse {
  messaging_product?: string;

  contacts?: Array<{
    input?: string;
    wa_id?: string;
  }>;

  messages?: Array<{
    id: string;
  }>;
}

/* =========================================================
   GRAPH API VERSION
   ========================================================= */

export function getGraphApiVersion(): string {
  const version = process.env.WHATSAPP_GRAPH_API_VERSION;

  if (!version) {
    throw new Error(
      "WHATSAPP_GRAPH_API_VERSION is not configured."
    );
  }

  return version;
}

/* =========================================================
   META PHONE NUMBER LOOKUP
   ---------------------------------------------------------
   Used when connecting/verifying a WhatsApp account.
   ========================================================= */

export async function getWhatsAppPhoneNumber(
  phoneNumberId: string,
  accessToken: string
): Promise<WhatsAppPhoneNumberResponse> {
  if (!phoneNumberId) {
    throw new Error("WhatsApp Phone Number ID is required.");
  }

  if (!accessToken) {
    throw new Error("WhatsApp access token is required.");
  }

  const graphApiVersion = getGraphApiVersion();

  const url =
    `${META_GRAPH_BASE_URL}/` +
    `${graphApiVersion}/` +
    `${phoneNumberId}` +
    `?fields=id,display_phone_number,verified_name`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "Meta WhatsApp phone number lookup failed:",
      data
    );

    const message =
      data?.error?.message ||
      "Unable to verify the WhatsApp Phone Number ID with Meta.";

    throw new Error(message);
  }

  if (!data?.id) {
    throw new Error(
      "Meta returned an invalid WhatsApp phone number response."
    );
  }

  return {
    id: data.id,
    display_phone_number:
      data.display_phone_number,
    verified_name:
      data.verified_name,
  };
}

/* =========================================================
   SEND WHATSAPP TEXT
   ---------------------------------------------------------
   Sends a real WhatsApp text message through Meta Cloud API.
   ========================================================= */

export async function sendWhatsAppText({
  phoneNumberId,
  accessToken,
  to,
  text,
}: {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  text: string;
}): Promise<WhatsAppSendMessageResponse> {
  if (!phoneNumberId) {
    throw new Error("WhatsApp Phone Number ID is required.");
  }

  if (!accessToken) {
    throw new Error("WhatsApp access token is required.");
  }

  if (!to) {
    throw new Error(
      "WhatsApp recipient phone number is required."
    );
  }

  if (!text) {
    throw new Error("WhatsApp message text is required.");
  }

  const graphApiVersion = getGraphApiVersion();

  const url =
    `${META_GRAPH_BASE_URL}/` +
    `${graphApiVersion}/` +
    `${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",

      to,

      type: "text",

      text: {
        preview_url: false,
        body: text,
      },
    }),

    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "Meta WhatsApp send message failed:",
      data
    );

    const message =
      data?.error?.message ||
      "Meta WhatsApp API request failed.";

    throw new Error(message);
  }

  return data as WhatsAppSendMessageResponse;
}

/* =========================================================
   NORMALIZE WHATSAPP PHONE NUMBER
   ---------------------------------------------------------
   Converts common Nigerian formats into international format.

   Examples:

   08012345678
   +2348012345678
   2348012345678

   -> 2348012345678
   ========================================================= */

export function normalizeWhatsAppPhone(
  phone: string
): string {
  if (!phone) {
    return "";
  }

  let value = phone.trim();

  /*
   * Remove spaces, brackets, hyphens and other
   * formatting characters.
   */
  value = value.replace(/[^\d+]/g, "");

  /*
   * Remove leading +.
   */
  if (value.startsWith("+")) {
    value = value.substring(1);
  }

  /*
   * Nigerian local number:
   *
   * 08012345678
   * ->
   * 2348012345678
   */
  if (
    value.startsWith("0") &&
    value.length === 11
  ) {
    return `234${value.substring(1)}`;
  }

  /*
   * Nigerian international number:
   *
   * 2348012345678
   */
  if (
    value.startsWith("234") &&
    value.length >= 13
  ) {
    return value;
  }

  /*
   * Other international numbers.
   *
   * We leave them untouched so VisionFlow
   * can support international patients.
   */
  if (
    value.length >= 8 &&
    value.length <= 15
  ) {
    return value;
  }

  return "";
}

/* =========================================================
   BUILD PHONE VARIANTS
   ---------------------------------------------------------
   Used when matching an incoming WhatsApp number against
   patient phone numbers stored in different formats.
   ========================================================= */

export function buildWhatsAppPhoneVariants(
  phone: string
): string[] {
  if (!phone) {
    return [];
  }

  const variants = new Set<string>();

  const raw = phone.trim();

  /*
   * Original cleaned value.
   */
  const cleaned = raw.replace(/[^\d+]/g, "");

  if (cleaned) {
    variants.add(cleaned);

    if (cleaned.startsWith("+")) {
      variants.add(cleaned.substring(1));
    }
  }

  /*
   * Normalized international value.
   */
  const normalized =
    normalizeWhatsAppPhone(phone);

  if (normalized) {
    variants.add(normalized);

    variants.add(`+${normalized}`);

    /*
     * Nigerian international -> local format.
     *
     * 2348012345678
     * ->
     * 08012345678
     */
    if (
      normalized.startsWith("234") &&
      normalized.length === 13
    ) {
      variants.add(
        `0${normalized.substring(3)}`
      );
    }
  }

  /*
   * Return unique values.
   */
  return Array.from(variants);
}