import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import type { IUserRepository } from '../domain/repositories/user.repository';

jest.mock('bcrypt', () => ({ hash: jest.fn(), compare: jest.fn() }));

describe('email authentication', () => {
  const findByEmail = jest.fn();
  const create = jest.fn();
  const sign = jest.fn().mockReturnValue('token');
  const service = new AuthService(
    { findByEmail, create } as unknown as IUserRepository,
    { sign } as unknown as JwtService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('stores new email addresses in lowercase without changing the password', async () => {
    findByEmail.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hash');
    await service.register({
      email: 'Alice@Example.com',
      password: 'Secret123!',
    });
    expect(create).toHaveBeenCalledWith({
      email: 'alice@example.com',
      passwordHash: 'hash',
      displayName: null,
    });
    expect(bcrypt.hash).toHaveBeenCalledWith('Secret123!', 12);
  });

  it('rejects registration when the lookup finds an existing mixed-case address', async () => {
    findByEmail.mockResolvedValue({ email: 'Alice@Example.com' });
    await expect(
      service.register({ email: 'alice@example.com', password: 'Secret123!' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(create).not.toHaveBeenCalled();
  });

  it('logs into the existing account found by the case-insensitive lookup', async () => {
    findByEmail.mockResolvedValue({
      id: 'existing-user',
      email: 'Alice@Example.com',
      passwordHash: 'hash',
      displayName: 'Alice',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    await expect(
      service.login({ email: 'alice@example.com', password: 'Secret123!' }),
    ).resolves.toEqual({ accessToken: 'token', displayName: 'Alice' });
    expect(sign).toHaveBeenCalledWith({
      sub: 'existing-user',
      email: 'Alice@Example.com',
    });
  });

  it('still rejects an incorrect password', async () => {
    findByEmail.mockResolvedValue({ passwordHash: 'hash' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.login({ email: 'alice@example.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(sign).not.toHaveBeenCalled();
  });
});
