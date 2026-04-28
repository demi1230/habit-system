/**
 * Domain entity — UserEntity
 * Core identity object for the system.
 */
export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string | null;
  currentLat: number | null;
  currentLng: number | null;
  createdAt: Date;
  updatedAt: Date;
}
