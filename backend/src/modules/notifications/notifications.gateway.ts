import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*', // Should be restricted in prod
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private authService: AuthService) {}

  async handleConnection(client: Socket) {
    try {
      // Very basic token extraction from headers
      const cookie = client.handshake.headers.cookie;
      // In a real app, you parse the cookie and validate with better-auth
      // For this scaffold, we just let them connect, or they can emit an 'authenticate' event
      console.log(`Client connected: ${client.id}`);
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  sendToUser(userId: string, event: string, payload: any) {
    this.server.to(`user_${userId}`).emit(event, payload);
  }

  sendToAdmins(event: string, payload: any) {
    this.server.to('admins').emit(event, payload);
  }
}
