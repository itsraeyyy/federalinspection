import { All, Controller, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Catch-all route that forwards every /api/auth/* request
   * to Better Auth's built-in handler.
   */
  @All('*path')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    // Convert Express Request to Web API Request for Better Auth
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }

    const webRequest = new globalThis.Request(url, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    });

    const webResponse = await this.authService.handleRequest(webRequest);

    // Copy response back to Express
    res.status(webResponse.status);
    webResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const body = await webResponse.text();
    res.send(body);
  }
}
