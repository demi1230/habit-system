import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Infrastructure — PrismaModule (global)
 * Provides PrismaService to all feature modules so that repository adapters
 * can inject it without explicit imports.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
