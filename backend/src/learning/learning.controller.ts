import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LearningService } from './learning.service';
import {
  LogArticleInteractionDto,
  LogRecommendationInteractionDto,
} from './dto';

@ApiTags('learning')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/:userId/recommendations')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  /**
   * GET /users/:userId/recommendations
   * Returns active recommendations for the user, optionally filtered by habitId.
   */
  @Get()
  @ApiOperation({ summary: 'Get active recommendations for user' })
  async getRecommendations(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Query('habitId') habitId?: string,
  ) {
    return this.learningService.getRecommendations(userId, habitId);
  }

  /**
   * POST /users/:userId/recommendations/refresh
   * Regenerate recommendations for a specific habit.
   */
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh recommendations for a habit' })
  async refreshRecommendations(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Query('habitId', new ParseUUIDPipe()) habitId: string,
  ) {
    return this.learningService.refreshRecommendations(userId, habitId);
  }

  /**
   * GET /users/:userId/recommendations/:recommendationId
   * Get a single recommendation by ID.
   */
  @Get(':recommendationId')
  @ApiOperation({ summary: 'Get a single recommendation' })
  async getRecommendation(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('recommendationId', new ParseUUIDPipe()) recommendationId: string,
  ) {
    return this.learningService.getRecommendationById(userId, recommendationId);
  }

  /**
   * POST /users/:userId/recommendations/:recommendationId/interactions
   * Log a recommendation interaction (CLICKED, DISMISSED, APPLIED, etc).
   */
  @Post(':recommendationId/interactions')
  @HttpCode(201)
  @ApiOperation({ summary: 'Log a recommendation interaction' })
  async logRecommendationInteraction(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('recommendationId', new ParseUUIDPipe()) recommendationId: string,
    @Body() dto: LogRecommendationInteractionDto,
  ) {
    return this.learningService.logRecommendationInteraction(
      userId,
      recommendationId,
      dto,
    );
  }

  /**
   * POST /users/:userId/recommendations/:recommendationId/dismiss
   * Dismiss a recommendation.
   */
  @Post(':recommendationId/dismiss')
  @HttpCode(200)
  @ApiOperation({ summary: 'Dismiss a recommendation' })
  async dismissRecommendation(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('recommendationId', new ParseUUIDPipe()) recommendationId: string,
  ) {
    return this.learningService.dismissRecommendation(userId, recommendationId);
  }
}

@ApiTags('learning')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/:userId/articles')
export class ArticleController {
  constructor(private readonly learningService: LearningService) {}

  /**
   * POST /users/:userId/articles/:articleId/interactions
   * Log an article interaction (OPENED, COMPLETED, BOOKMARKED, UNBOOKMARKED).
   */
  @Post(':articleId/interactions')
  @HttpCode(201)
  @ApiOperation({ summary: 'Log an article interaction' })
  async logArticleInteraction(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('articleId') articleId: string,
    @Body() dto: LogArticleInteractionDto,
  ) {
    return this.learningService.logArticleInteraction(userId, articleId, dto);
  }

  /**
   * GET /users/:userId/articles/interactions
   * Get user article interaction history.
   */
  @Get('interactions')
  @ApiOperation({ summary: 'Get article interaction history' })
  async getArticleInteractions(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.learningService.getArticleInteractionHistory(
      userId,
      parsedLimit,
    );
  }
}
