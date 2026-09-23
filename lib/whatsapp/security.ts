import crypto from "crypto";

/**
 * =========================================================
 * WHATSAPP SECURITY UTILITIES
 * =========================================================
 *
 * Required environment variable:
 *
 * WHATSAPP_TOKEN_ENCRYPTION_KEY
 *
 * This must represent exactly 32 bytes.
 *
 * Recommended generation:
 *
 * node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 *
 * Store the generated value in .env
 */

/**
 * ---------------------------------------------------------
 * Encryption key
 * ---------------------------------------------------------
 */
function getEncryptionKey(): Buffer {
  const raw = process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY?.trim();

  if (!raw) {
    throw new Error(
      "WHATSAPP_TOKEN_ENCRYPTION_KEY is not configured."
    );
  }

  let key: Buffer;

  /**
   * Support:
   * - 64-character hexadecimal
   * - base64
   */
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    key = Buffer.from(raw, "hex");
  } else {
    key = Buffer.from(raw, "base64");
  }

  if (key.length !== 32) {
    throw new Error(
      "WHATSAPP_TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes."
    );
  }

  return key;
}

/**
 * ---------------------------------------------------------
 * Encrypt secret
 * ---------------------------------------------------------
 *
 * Output:
 *
 * iv.tag.ciphertext
 */
export function encryptSecret(value: string): string {
  if (!value) {
    throw new Error("Cannot encrypt an empty secret.");
  }

  const key = getEncryptionKey();

  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    key,
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

/**
 * ---------------------------------------------------------
 * Decrypt secret
 * ---------------------------------------------------------
 */
export function decryptSecret(value: string): string {
  if (!value) {
    throw new Error("Cannot decrypt an empty secret.");
  }

  const parts = value.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted secret format.");
  }

  const [ivBase64, authTagBase64, encryptedBase64] =
    parts;

  const key = getEncryptionKey();

  const iv = Buffer.from(ivBase64, "base64");
  const authTag = Buffer.from(
    authTagBase64,
    "base64"
  );
  const encrypted = Buffer.from(
    encryptedBase64,
    "base64"
  );

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    iv
  );

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/**
 * ---------------------------------------------------------
 * Hash verification token
 * ---------------------------------------------------------
 *
 * We never store the webhook verification token
 * as plaintext.
 */
export function hashVerifyToken(
  token: string
): string {
  return crypto
    .createHash("sha256")
    .update(token, "utf8")
    .digest("hex");
}

/**
 * ---------------------------------------------------------
 * Compare verification token
 * ---------------------------------------------------------
 */
export function verifyVerifyToken(
  token: string,
  expectedHash: string
): boolean {
  const actualHash = hashVerifyToken(token);

  const actualBuffer = Buffer.from(
    actualHash,
    "utf8"
  );

  const expectedBuffer = Buffer.from(
    expectedHash,
    "utf8"
  );

  if (
    actualBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    actualBuffer,
    expectedBuffer
  );
}

/**
 * ---------------------------------------------------------
 * Verify Meta webhook signature
 * ---------------------------------------------------------
 *
 * Meta sends:
 *
 * X-Hub-Signature-256:
 * sha256=<HMAC SHA256>
 */
export function verifyMetaWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const appSecret =
    process.env.WHATSAPP_APP_SECRET?.trim();

  if (!appSecret) {
    throw new Error(
      "WHATSAPP_APP_SECRET is not configured."
    );
  }

  if (!signature) {
    return false;
  }

  if (!signature.startsWith("sha256=")) {
    return false;
  }

  const receivedSignature =
    signature.slice("sha256=".length);

  const expectedSignature =
    crypto
      .createHmac("sha256", appSecret)
      .update(rawBody, "utf8")
      .digest("hex");

  const receivedBuffer = Buffer.from(
    receivedSignature,
    "utf8"
  );

  const expectedBuffer = Buffer.from(
    expectedSignature,
    "utf8"
  );

  if (
    receivedBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    receivedBuffer,
    expectedBuffer
  );
}