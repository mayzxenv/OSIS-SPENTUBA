const WORKER_BASE_URL = 'https://019bd78e-c6c9-70be-99f0-e319b1d30389.osis-spentuba.workers.dev';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'accept-encoding',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
]);

function normalizeRequestBody(request: any): Promise<Buffer | undefined> {
  if (!request.method || request.method === 'GET' || request.method === 'HEAD') {
    return Promise.resolve(undefined);
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    request.on('data', (chunk: Buffer) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    request.on('end', () => {
      resolve(chunks.length > 0 ? Buffer.concat(chunks) : undefined);
    });

    request.on('error', reject);
  });
}

function buildTargetUrl(requestUrl: string): string {
  const incomingUrl = new URL(requestUrl, 'http://localhost');
  const path = incomingUrl.pathname.replace(/^\/api\/?/, '/api/');
  return new URL(`${path}${incomingUrl.search}`, WORKER_BASE_URL).toString();
}

function copyRequestHeaders(sourceHeaders: Record<string, string | string[] | undefined>): Headers {
  const headers = new Headers();

  for (const [key, value] of Object.entries(sourceHeaders)) {
    if (value === undefined || HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      continue;
    }

    if (Array.isArray(value)) {
      headers.set(key, value.join(', '));
    } else {
      headers.set(key, value);
    }
  }

  return headers;
}

export default async function handler(request: any, response: any) {
  if (request.method === 'OPTIONS') {
    response.status(204);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Code');
    response.end();
    return;
  }

  try {
    const targetUrl = buildTargetUrl(request.url || '/api');
    const headers = copyRequestHeaders(request.headers || {});
    const body = await normalizeRequestBody(request);

    const proxyResponse = await fetch(targetUrl, {
      method: request.method || 'GET',
      headers,
      body,
      redirect: 'manual',
    });

    response.status(proxyResponse.status);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Cache-Control', 'no-store, max-age=0');

    proxyResponse.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase()) && key.toLowerCase() !== 'content-length') {
        response.setHeader(key, value);
      }
    });

    const text = await proxyResponse.text();
    response.send(text);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('API proxy failed:', error);
    response.status(502).json({ error: 'API proxy failed' });
  }
}