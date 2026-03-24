import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtPayload } from './jwt-payload.interface';

/**
 * Extends PassportAuthGuard('jwt') to also enforce that the authenticated
 * user may only access routes that belong to their own userId URL param.
 *
 * This covers routes of the form /users/:userId/...
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Run Passport JWT verification first
    const authenticated = await (super.canActivate(context) as Promise<boolean>);
    if (!authenticated) {
      return false;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayload;
    const urlUserId = request.params['userId'];

    // If the route has a :userId param, enforce ownership
    if (urlUserId && user.sub !== urlUserId) {
      throw new ForbiddenException('You can only access your own resources.');
    }

    return true;
  }
}
