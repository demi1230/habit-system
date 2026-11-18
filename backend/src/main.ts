import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { APP_TIMEZONE } from './shared/time';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureApp(app);

  // Day boundaries must follow APP_TIMEZONE, not the host timezone. Logging
  // both makes a mismatch visible in deployment logs.
  const hostTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const hostOffsetHours = -new Date().getTimezoneOffset() / 60;
  new Logger('Bootstrap').log(
    `Host timezone: ${hostTimeZone} (UTC${hostOffsetHours >= 0 ? '+' : ''}${hostOffsetHours}); application timezone: ${APP_TIMEZONE}`,
  );

  const corsOrigins = (
    process.env.CORS_ORIGINS ??
    process.env.APP_ORIGIN ??
    'http://localhost:5173,http://localhost:4173'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  // API docs are public when enabled, so they are off in production unless
  // SWAGGER_ENABLED=true is set explicitly.
  const swaggerEnabled =
    process.env.SWAGGER_ENABLED !== undefined
      ? process.env.SWAGGER_ENABLED === 'true'
      : process.env.NODE_ENV !== 'production';

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Habit Formation System API')
      .setDescription(
        'Backend API for the Behavior-Based Habit Formation System thesis project.',
      )
      .setVersion('2.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
