import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./public/', import.meta.url));
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf' };

createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
      return;
    }
    const requestURL = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(requestURL.pathname);
    let file = resolve(root, '.' + pathname);
    if (file !== resolve(root) && !file.startsWith(resolve(root) + sep)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    let info = await stat(file);
    if (info.isDirectory()) {
      file = resolve(file, 'index.html');
      info = await stat(file);
    }
    const headers = { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' };
    // Framer's CMS requests concatenated byte ranges through a query parameter.
    if (extname(file) === '.framercms' && requestURL.searchParams.has('range')) {
      const ranges = requestURL.searchParams.get('range').split(',').map(range => /^(\d+)-(\d+)$/.exec(range));
      if (ranges.length > 500 || ranges.some(range => !range || Number(range[1]) > Number(range[2]) || Number(range[2]) >= info.size)) {
        res.writeHead(416).end('Invalid CMS range');
        return;
      }
      const data = await readFile(file);
      const body = Buffer.concat(ranges.map(range => data.subarray(Number(range[1]), Number(range[2]) + 1)));
      res.writeHead(200, { ...headers, 'Content-Length': body.length });
      res.end(req.method === 'HEAD' ? undefined : body);
      return;
    }
    let start = 0, end = info.size - 1, status = 200;
    if (req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!match || (!match[1] && !match[2])) {
        res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end();
        return;
      }
      if (!match[1]) start = Math.max(0, info.size - Number(match[2]));
      else { start = Number(match[1]); if (match[2]) end = Math.min(end, Number(match[2])); }
      if (start > end || start >= info.size) {
        res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end();
        return;
      }
      status = 206;
      headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
    }
    res.writeHead(status, { ...headers, 'Content-Length': end - start + 1 });
    if (req.method === 'HEAD') res.end();
    else createReadStream(file, { start, end }).pipe(res);
  } catch (error) {
    const status = error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : 400;
    res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' }).end(status === 404 ? 'Page not found' : 'Invalid request');
  }
}).listen(port, host, () => console.log(`Kyte Website → http://${host}:${port}`));
