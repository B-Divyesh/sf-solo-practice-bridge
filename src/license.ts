import type { LicenseState } from './types';

const SLUG = 'solo-practice-bridge';
const TOKEN_KEY = `sb_license:${SLUG}`;
const STATE_KEY = `sb_license_state:${SLUG}`;
const DAY = 86_400_000;
const API_BASE = import.meta.env.VITE_BILLING_API || 'https://api.sociobot.in/api/v1';

export const checkoutUrl = `${API_BASE}/products/${SLUG}/checkout`;

export function captureLicenseFromUrl(): void {
  const url = new URL(window.location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.removeItem(STATE_KEY);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function storedToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? '';
}

export function cachedLicense(): LicenseState | undefined {
  const token = storedToken();
  if (!token) return undefined;
  try {
    const state = JSON.parse(localStorage.getItem(STATE_KEY) ?? '') as LicenseState;
    return state.token === token ? state : { token, valid: false, checkedAt: 0 };
  } catch {
    return { token, valid: false, checkedAt: 0 };
  }
}

export function isUnlocked(): boolean {
  return cachedLicense()?.valid === true;
}

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.removeItem(STATE_KEY);
}

export function clearLicense(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(STATE_KEY);
}

export async function verifyLicense(force = false): Promise<LicenseState | undefined> {
  const token = storedToken();
  if (!token) return undefined;
  const cached = cachedLicense();
  if (!force && cached && Date.now() - cached.checkedAt < DAY) return cached;
  const response = await fetch(`${API_BASE}/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
  if (!response.ok) throw new Error('License verification is temporarily unavailable.');
  const result = await response.json() as { valid: boolean };
  const state = { token, valid: result.valid, checkedAt: Date.now() };
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
  return state;
}
