import {APP_BASE_HREF} from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import {fileURLToPath} from 'node:url';
import {dirname, join, resolve} from 'node:path';
import bootstrap from './src/main.server';
import * as fs from 'node:fs';
import * as https from 'node:https';

// The Express app is exported so that it can be used by serverless Functions.
// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  //const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const serverDistFolder = join(process.cwd(), 'dist', 'shop-frontend', 'server');
  const browserDistFolder = join(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.csr.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // 1. SSR для всех HTML-страниц (кроме статики)
  server.get('/*path', (req, res, next) => {
    // Пропускаем запросы к статике (с расширением)

    console.log('SSR route:', req.url);

    if (req.url.includes('.') && !req.url.endsWith('.html')) {
      return next();
    }

    const { protocol, originalUrl, baseUrl, headers } = req;
    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  // 2. Статические файлы (JS, CSS, изображения)
  server.use(express.static(browserDistFolder, {
    maxAge: '1y',
    index: false // отключаем автоиндексацию
  }));

  return server;
}


function run(): void {
  const port = process.env['PORT'] || 4043; // HTTPS обычно на 443
  const server = app();

  // Проверяем, есть ли сертификаты
  const sslKey = 'localhost.key';
  const sslCert = 'localhost.crt';

  if (fs.existsSync(sslKey) && fs.existsSync(sslCert)) {
    const options = {
      key: fs.readFileSync(sslKey),
      cert: fs.readFileSync(sslCert)
    };
    const httpsServer = https.createServer(options, server);
    httpsServer.listen(port, () => {
      console.log(`Node Express server listening on https://localhost:${port}`);
    });
  } else {
    // Если нет сертификатов — запускаем HTTP
    server.listen(port, () => {
      console.log(`Node Express server listening on http://localhost:${port}`);
    });
  }
}

run();
