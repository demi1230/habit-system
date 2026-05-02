import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateFeedbackDto) {
    return this.prisma.userFeedback.create({
      data: {
        userId,
        message: dto.message.trim(),
      },
      select: { id: true, message: true, createdAt: true },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.userFeedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, message: true, createdAt: true },
    });
  }
}
