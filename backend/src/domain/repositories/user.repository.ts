import { UserEntity } from '../entities/user.entity';

/** Injection token for the user repository port. */
export const USER_REPOSITORY = Symbol('IUserRepository');

export interface CreateUserData {
  email: string;
  passwordHash: string;
  displayName?: string | null;
  timezone?: string | null;
}

/**
 * Repository port (interface) for UserEntity persistence.
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  create(
    data: CreateUserData,
  ): Promise<
    Pick<UserEntity, 'id' | 'email' | 'displayName' | 'timezone' | 'createdAt'>
  >;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
  updateLocation(
    userId: string,
    lat: number | null,
    lng: number | null,
  ): Promise<void>;
  updateTimezone(userId: string, timezone: string): Promise<void>;
}
