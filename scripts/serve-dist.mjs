import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve('dist');
const port = Number(process.env.PORT || 4173);
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8'
};

function safeFile(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^[/\\]+/, '');
  const file = resolve(root, clean);
  return file.startsWith(`${root}/`) || file === root ? file : undefined;
}

function headers(type) {
  return {
    'Content-Type': type,
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://api.sociobot.in; manifest-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY'
  };
}

createServer((request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  let pathname = url.pathname;
  if (pathname === '/demo' || pathname === '/privacy' || pathname === '/terms') {
    response.writeHead(308, { Location: `${pathname}/` });
    response.end();
    return;
  }
  if (pathname.endsWith('/')) pathname = join(pathname, 'index.html');
  let file = safeFile(pathname);
  let status = 200;
  if (!file || !existsSync(file) || statSync(file).isDirectory()) {
    file = join(root, '404.html');
    status = 404;
  }
  const type = types[extname(file)] || 'application/octet-stream';
  response.writeHead(status, headers(type));
  createReadStream(file).pipe(response);
}).listen(port, '0.0.0.0', () => {
  console.log(`Serving ${root} on http://0.0.0.0:${port}`);
});
