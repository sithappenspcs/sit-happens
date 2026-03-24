import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('AppGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    return { event: 'room_joined', data: room };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(client: Socket, room: string) {
    client.leave(room);
    this.logger.log(`Client ${client.id} left room: ${room}`);
  }

  // Broadcasters
  notifyAdmin(event: string, data: any) {
    this.server.to('admin').emit(event, data);
  }

  notifyStaff(staffId: number, event: string, data: any) {
    this.server.to(`staff:${staffId}`).emit(event, data);
  }

  notifyClient(clientId: number, event: string, data: any) {
    this.server.to(`client:${clientId}`).emit(event, data);
  }
}
