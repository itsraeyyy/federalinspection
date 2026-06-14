import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Build a Web API Request from the Express request
    const url = `${request.protocol}://${request.get('host')}${request.originalUrl}`;
    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (value)
        headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
    const webRequest = new globalThis.Request(url, {
      method: request.method,
      headers,
    });

    const session = await this.authService.auth.api.getSession({
      headers: webRequest.headers,
    });

    if (!session) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // Attach user and session to the request for downstream handlers
    (request as any).user = session.user;
    (request as any).session = session.session;

    return true;
  }
}
