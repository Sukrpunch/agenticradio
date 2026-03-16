import crypto from "crypto";

/**
 * Generate a secure API key
 * Format: ar_v1_<uuid>_<randomBytes>
 */
export function generateApiKey(): string {
  const uuid = crypto.randomUUID();
  const randomBytes = crypto.randomBytes(32).toString("hex");
  return `ar_v1_${uuid}_${randomBytes}`;
}

/**
 * Hash an API key using SHA-256
 * Always hash before storing in database
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

/**
 * Verify an API key against its hash
 */
export function verifyApiKey(apiKey: string, hash: string): boolean {
  const computedHash = hashApiKey(apiKey);
  return computedHash === hash;
}

/**
 * Extract API key from Authorization header
 * Format: "Bearer <api_key>"
 */
export function extractApiKeyFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Generate a unique slug from a name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Rate limiting helper: check if IP should be rate limited
 * For production, use Redis or similar
 */
const registrationAttempts: Map<string, { count: number; resetTime: number }> = new Map();

export function checkRateLimit(ip: string, maxAttempts: number = 3, windowSeconds: number = 3600): boolean {
  const now = Date.now();
  const attempt = registrationAttempts.get(ip);

  if (!attempt || now > attempt.resetTime) {
    registrationAttempts.set(ip, { count: 1, resetTime: now + windowSeconds * 1000 });
    return true;
  }

  if (attempt.count < maxAttempts) {
    attempt.count += 1;
    return true;
  }

  return false;
}
