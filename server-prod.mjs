import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { reqHandler } from './dist/app/server/server.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '8080', 10);
const browserDistFolder = resolve(__dirname, 'dist/app/browser');

// Serve static assets with caching
app.use(express.static(browserDistFolder, {
  maxAge: '1y',
  index: false,
  redirect: false,
}));

// SSR & API Catch-all handler using middleware (Express 5 compatible)
app.use(async (req, res, next) => {
  try {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.get('host') || `localhost:${port}`;
    const fullUrl = `${protocol}://${host}${req.originalUrl}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => headers.append(key, v));
        } else {
          headers.set(key, value);
        }
      }
    }

    const init = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      if (chunks.length > 0) {
        init.body = Buffer.concat(chunks);
      }
    }

    const webReq = new Request(fullUrl, init);
    const webRes = await reqHandler(webReq);

    if (!webRes) {
      return next();
    }

    res.status(webRes.status);
    webRes.headers.forEach((val, key) => {
      res.setHeader(key, val);
    });

    const bodyBuf = Buffer.from(await webRes.arrayBuffer());
    res.send(bodyBuf);
  } catch (err) {
    console.error('Server error:', err);
    next(err);
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 MyFeedLK SSR production server running on port ${port}`);
});
