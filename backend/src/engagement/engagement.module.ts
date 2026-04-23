import { Module } from '@nestjs/common';
import { ENGAGEMENT_SERVICE } from './engagement.constants';
import { EngagementController } from './engagement.controller';
import { EngagementService } from './engagement.service';

@Module({
  controllers: [EngagementController],
  providers: [
    EngagementService,
    {
      provide: ENGAGEMENT_SERVICE,
      useExisting: EngagementService,
    },
  ],
  exports: [EngagementService, ENGAGEMENT_SERVICE],
})
export class EngagementModule {}
