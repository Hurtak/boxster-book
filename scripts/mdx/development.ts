import { resolve } from 'node:path';
import { mergeConfig, type InlineConfig, type Plugin } from 'vite-plus';
import { htmlDocument, root } from '../build';
import { assetUrls, collectAssets } from './assets';
import { bookConfig } from './bundler';
import { discoverBook } from './inventory';

export async function bookDevelopmentConfig(): Promise<InlineConfig> {
  const book = await discoverBook(resolve(root, 'book'), root);
  const assets = await collectAssets(book);
  const prefix = '/book-assets/';
  const html: Plugin = {
    name: 'book-development-html',
    apply: 'serve',
    configureServer(server) {
      // Run after Vite's module and asset middleware, before the final 404.
      return () => {
        server.middlewares.use(async (request, response, next) => {
          if (!['GET', 'HEAD'].includes(request.method ?? '')) return next();
          if (!request.headers.accept?.includes('text/html')) return next();
          try {
            const { render } = await server.ssrLoadModule('/src/entry-server.tsx');
            const document = htmlDocument(
              render(assetUrls(assets, prefix)),
              '',
              '<script type="module" src="/src/entry-client.tsx"></script>',
              'Development edition; production exports include dependency and font notices.',
            );
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.end(await server.transformIndexHtml(request.url ?? '/', document));
          } catch (error) {
            server.ssrFixStacktrace(error as Error);
            next(error);
          }
        });
      };
    },
  };
  return mergeConfig(bookConfig(book, assets, prefix, new Set()), {
    logLevel: 'info',
    appType: 'custom',
    plugins: [html],
    // This SSR app has no root HTML entry for Vite's dependency scanner.
    optimizeDeps: { entries: [resolve(root, 'src/entry-client.tsx')] },
    server: { host: '127.0.0.1' },
  });
}
