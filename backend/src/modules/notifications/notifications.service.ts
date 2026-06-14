import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationsGateway,
  ) {}

  async createNotification(userId: string, type: string, title: string, message: string) {
    const notification = await this.prisma.notification.create({
      data: { userId, type, title, message },
    });

    // Emit via WebSockets
    this.gateway.sendToUser(userId, 'new_notification', notification);

    return notification;
  }

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.update({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  /** Send broadcast to all admins */
  async notifyAdmins(type: string, title: string, message: string) {
    // Ideally we would look up users with admin roles here, but for now we emit to an 'admins' room
    this.gateway.sendToAdmins('admin_notification', { type, title, message, createdAt: new Date() });
  }
}
