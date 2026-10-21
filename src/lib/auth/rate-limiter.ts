// ==============================================================================
// Login Rate Limiter & Cloudflare Turnstile Verification
// Enforces max 5 login attempts per 15 minutes per IP
// ==============================================================================

interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
}

const attemptStore = new Map<string, AttemptRecord>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

/**
 * Checks if the IP has exceeded login rate limits
 */
export function checkLoginRateLimit(ip: string): { allowed: boolean; remaining: number; retryAfterSec?: number } {
  const now = Date.now();
  const record = attemptStore.get(ip);

  if (!record) {
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }

  // If window expired, reset
  if (now - record.firstAttemptAt > WINDOW_MS) {
    attemptStore.delete(ip);
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfterSec = Math.ceil((record.firstAttemptAt + WINDOW_MS - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - record.count };
}

/**
 * Records a login attempt. Clears if login succeeded.
 */
export function recordLoginAttempt(ip: string, success: boolean): void {
  if (success) {
    attemptStore.delete(ip);
    return;
  }

  const now = Date.now();
  const record = attemptStore.get(ip);

  if (!record || now - record.firstAttemptAt > WINDOW_MS) {
    attemptStore.set(ip, { count: 1, firstAttemptAt: now });
  } else {
    record.count += 1;
  }
}

/**
 * Verifies Cloudflare Turnstile CAPTCHA response token
 */
export async function verifyTurnstileToken(
  token: string,
  secretKey: string,
  remoteIp?: string
): Promise<boolean> {
  if (!secretKey) {
    // If turnstile secret is not set in development, bypass warning
    console.warn('TURNSTILE_SECRET_KEY not set. Skipping Turnstile verification in dev.');
    return true;
  }

  if (!token) return false;

  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) formData.append('remoteip', remoteIp);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) return false;

    const outcome = await res.json();
    return Boolean(outcome.success);
  } catch (err) {
    console.error('Turnstile verification error:', err);
    return false;
  }
}
