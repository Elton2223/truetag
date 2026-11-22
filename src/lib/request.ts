import type { APIContext } from 'astro';

export function clientIp(request: Request): string {
  const xf = request.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0]!.trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real;
  return '127.0.0.1';
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

export function jsonError(message: string, status = 400): Response {
  return json({ error: message }, status);
}

export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export function siteUrl(): string {
  return process.env.PUBLIC_SITE_URL || 'http://localhost:4321';
}

export type { APIContext };
