import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

/**
 * Infrastructure — Prisma database client.
 * Lives in the infrastructure layer; injected only by repository adapters.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly runtimeUrl: string;
  private readonly usesAccelerate: boolean;

  constructor(configService: ConfigService) {
    const runtimeUrl = configService.getOrThrow<string>('DATABASE_URL');
    const directUrl =
      configService.get<string>('DIRECT_DATABASE_URL') ??
      configService.get<string>('DIRECT_URL');

    const isAccelerateUrl =
      runtimeUrl.startsWith('prisma://') ||
      runtimeUrl.startsWith('prisma+postgres://');

    const connectionDescription = isAccelerateUrl
      ? 'Prisma Accelerate / Prisma Postgres URL'
      : 'direct PostgreSQL connection string';

    if (isAccelerateUrl) {
      super({ accelerateUrl: runtimeUrl });
    } else {
      const adapter = new PrismaPg({ connectionString: runtimeUrl });
      super({ adapter });
    }

    if (isAccelerateUrl && directUrl) {
      this.logger.log(
        'Prisma runtime is using Accelerate URL from DATABASE_URL. DIRECT_DATABASE_URL is available for CLI/migrations if needed.',
      );
    } else if (isAccelerateUrl) {
      this.logger.log(
        'Prisma runtime is using Accelerate URL from DATABASE_URL.',
      );
    } else {
      this.logger.log(
        'Prisma runtime is using direct PostgreSQL driver adapter.',
      );
    }

    this.runtimeUrl = runtimeUrl;
    this.usesAccelerate = isAccelerateUrl;
    this.logger.debug(`Prisma runtime mode: ${connectionDescription}.`);
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      const prismaError = error as {
        code?: string;
        meta?: { message?: string };
      };

      if (this.usesAccelerate && prismaError.code === 'P6002') {
        throw new Error(
          'Prisma could not connect because the API key inside DATABASE_URL is invalid. ' +
            'Generate a new Prisma Postgres / Accelerate connection string in Prisma Console and replace DATABASE_URL in backend/.env. ' +
            'If you prefer, you can also switch DATABASE_URL to a direct postgres://... connection string instead.',
        );
      }

      if (
        this.usesAccelerate &&
        (this.runtimeUrl.startsWith('prisma://') ||
          this.runtimeUrl.startsWith('prisma+postgres://'))
      ) {
        this.logger.error(
          `Prisma startup failed while using Accelerate URL. Original error: ${prismaError.meta?.message ?? String(error)}`,
        );
      }

      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
