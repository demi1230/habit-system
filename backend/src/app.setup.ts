import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';

/**
 * HTTP configuration shared by the server (main.ts) and the e2e tests, so the
 * tests exercise the same routes and validation as production.
 */
export function configureApp(app: NestExpressApplication): void {
  // Rate limits key on the client IP. Behind a hosting proxy (Railway) the
  // client IP is in X-Forwarded-For; trust that many proxy hops (default 1).
  // Set TRUST_PROXY_HOPS=0 when the API is reached directly.
  app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS ?? 1));

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
}
