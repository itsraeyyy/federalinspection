import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  public auth: ReturnType<typeof betterAuth>;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.auth = betterAuth({
      database: prismaAdapter(prisma, { provider: 'postgresql' }) as any,
      secret: this.config.get('BETTER_AUTH_SECRET'),
      baseURL: this.config.get('BETTER_AUTH_URL'),
      emailAndPassword: {
        enabled: true,
      },
      trustedOrigins: [
        this.config.get('FRONTEND_URL', 'http://localhost:3000'),
      ],
    } as any);
  }

  /**
   * Handle all Better Auth requests by forwarding the raw Request object.
   */
  async handleRequest(request: Request): Promise<Response> {
    return this.auth.handler(request);
  }
}
