import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'behavior-based-habit-formation-system-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
