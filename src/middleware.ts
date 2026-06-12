import { defineMiddleware } from 'astro:middleware';

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const MAX_ENTRIES = 10_000;

const requests = new Map<string, { count: number; resetAt: number }>();

function pruneExpired() {
  const now = Date.now();
  for (const [key, val] of requests) {
    if (now > val.resetAt) requests.delete(key);
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (!context.url.pathname.startsWith('/api/')) {
    return next();
  }

  const ip =
    context.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    context.request.headers.get('x-real-ip') ??
    'unknown';

  const now = Date.now();
  const entry = requests.get(ip);

  if (requests.size > MAX_ENTRIES) pruneExpired();

  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else if (entry.count >= MAX_PER_WINDOW) {
    return new Response(
      JSON.stringify({ error: 'Demasiadas solicitudes. Intente en un minuto.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } },
    );
  } else {
    entry.count++;
  }

  return next();
});
