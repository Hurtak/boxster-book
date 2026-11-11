import { readFile, realpath, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { parseArgs } from 'node:util';
import { root } from './build';

const { values } = parseArgs({
  options: {
    port: { type: 'string', default: '8000' },
    host: { type: 'string', default: '127.0.0.1' },
    directory: { type: 'string', default: resolve(root, 'dist') },
  },
});
const folder = await realpath(resolve(values.directory)),
  port = Number(values.port);
if (!Number.isInteger(port) || port < 0 || port > 65535) throw Error('Port must be an integer from 0 to 65535');
const mime: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.glb': 'model/gltf-binary',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
};
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://localhost');
    let path = decodeURIComponent(url.pathname);
    if (path.startsWith('/boxster-book/')) path = '/site/' + path.slice('/boxster-book/'.length);
    if (path === '/') {
      response.writeHead(302, { Location: '/site/' }).end();
      return;
    }
    let file = resolve(folder, '.' + path);
    if (!file.startsWith(folder + sep)) {
      response.writeHead(403).end();
      return;
    }
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    file = await realpath(file);
    if (!file.startsWith(folder + sep)) {
      response.writeHead(403).end();
      return;
    }
    const bytes = await readFile(file);
    response
      .writeHead(200, {
        'Content-Type': mime[extname(file)] ?? 'application/octet-stream',
        'Cache-Control': 'no-cache',
      })
      .end(bytes);
  } catch {
    response.writeHead(404).end('Not found');
  }
});
server.on('error', (error) => {
  console.error(`Preview server: ${error.message}`);
  process.exitCode = 1;
});
server.listen(port, values.host, () =>
  console.log(`Book preview: http://${values.host}:${(server.address() as import('node:net').AddressInfo).port}/site/`),
);
