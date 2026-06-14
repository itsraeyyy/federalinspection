import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../auth/auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(@Req() req: Request) {
    return this.notificationsService.getUserNotifications((req as any).user.id);
  }

  @Post(':id/read')
  markAsRead(@Param('id') id: string, @Req() req: Request) {
    return this.notificationsService.markAsRead(id, (req as any).user.id);
  }
}
