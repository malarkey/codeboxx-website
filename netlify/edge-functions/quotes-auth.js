export default async (request, context) => {
const username = Netlify.env.get('QUOTES_USERNAME');
const password = Netlify.env.get('QUOTES_PASSWORD');
const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };
if (!username || !password) return new Response('Staff quotes are unavailable until access is configured.', { status: 503, headers });
let credentials = '';
try {
const authorization = request.headers.get('authorization') || '';
if (authorization.startsWith('Basic ')) credentials = atob(authorization.slice(6));
} catch { /* Invalid credentials receive the same challenge. */ }
if (credentials !== `${username}:${password}`) return new Response('Staff access required.', { status: 401, headers: { ...headers, 'WWW-Authenticate': 'Basic realm="Codeboxx staff", charset="UTF-8"' } });
const response = await context.next();
Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
return response;
};

export const config = { path: ['/quotes', '/quotes/*', '/quotes.html'], onError: 'fail' };
