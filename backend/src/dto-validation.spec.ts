import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserActivityLogDto } from './analytics/dto/create-user-activity-log.dto';
import { CreateHabitDto } from './habits/dto/create-habit.dto';
import { CreateHabitLogDto } from './progress/dto/create-habit-log.dto';

describe('DTO validation', () => {
  it('rejects invalid habit payloads', async () => {
    const dto = plainToInstance(CreateHabitDto, {
      title: '',
      startDate: 'not-a-date',
      scheduleDays: [{ weekday: 'FUNDAY' }],
    });

    const errors = await validate(dto);
    const errorProperties = [
      ...errors.map((error) => error.property),
      ...errors.flatMap((error) =>
        (error.children ?? []).map((childError) => childError.property),
      ),
    ];

    expect(errorProperties).toEqual(
      expect.arrayContaining([
        'title',
        'measurementUnit',
        'targetValue',
        'minimumTarget',
        'startDate',
        'scheduleDays',
      ]),
    );
  });

  it('rejects invalid habit log payloads', async () => {
    const dto = plainToInstance(CreateHabitLogDto, {
      completedAt: 'not-a-date',
      triggerSource: 'INVALID_SOURCE',
    });

    const errors = await validate(dto);
    const errorProperties = errors.map((error) => error.property);

    expect(errorProperties).toEqual(
      expect.arrayContaining(['completedAt', 'triggerSource']),
    );
  });

  it('rejects invalid activity log payloads', async () => {
    const dto = plainToInstance(CreateUserActivityLogDto, {
      activityType: '',
      occurredAt: 'not-a-date',
    });

    const errors = await validate(dto);
    const errorProperties = errors.map((error) => error.property);

    expect(errorProperties).toEqual(
      expect.arrayContaining(['activityType', 'occurredAt']),
    );
  });
});
