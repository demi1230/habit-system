import { ConflictException } from '@nestjs/common';
import { UserPrismaRepository } from './user.prisma-repository';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('../prisma/prisma.service', () => ({ PrismaService: class {} }));

describe('case-insensitive email lookup', () => {
  const user = { id: 'existing-user', email: 'Alice@Example.com' };
  const findUnique = jest.fn();
  const findMany = jest.fn();
  const repo = new UserPrismaRepository({
    user: { findUnique, findMany },
  } as unknown as PrismaService);

  beforeEach(() => jest.resetAllMocks());

  it('finds a legacy mixed-case email using lowercase input', async () => {
    findUnique.mockResolvedValue(null);
    findMany.mockResolvedValue([user]);
    await expect(repo.findByEmail(' alice@example.com ')).resolves.toEqual(
      user,
    );
    expect(findMany).toHaveBeenCalledWith({
      where: { email: { equals: 'alice@example.com', mode: 'insensitive' } },
      take: 2,
    });
  });

  it('preserves exact matches for legacy accounts', async () => {
    findUnique.mockResolvedValue(user);
    await expect(repo.findByEmail('Alice@Example.com')).resolves.toEqual(user);
    expect(findMany).not.toHaveBeenCalled();
  });

  it('does not pick an arbitrary account when legacy addresses collide', async () => {
    findUnique.mockResolvedValue(null);
    findMany.mockResolvedValue([
      user,
      { id: 'other-user', email: 'ALICE@example.com' },
    ]);
    await expect(repo.findByEmail('alice@example.com')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
