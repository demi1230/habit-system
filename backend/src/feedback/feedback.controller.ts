import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@ApiTags('feedback')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/:userId/feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Submit app feedback (rating + optional message)' })
  @ApiResponse({ status: 201, description: 'Feedback saved.' })
  create(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() dto: CreateFeedbackDto,
  ) {
    return this.feedbackService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List own feedback submissions' })
  list(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.feedbackService.findByUser(userId);
  }
}
