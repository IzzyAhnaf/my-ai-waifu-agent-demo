import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`📱 Klien Flutter Terhubung: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Klien Flutter Terputus: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleTextMessage(@MessageBody() data: { text: string }, @ConnectedSocket() client: Socket) {
    console.log(`Pesan masuk dari ponsel: ${data.text}`);
    
    client.emit('typing', { status: true });
  }

  broadcastToClient(event: string, payload: any) {
    this.server.emit(event, payload);
  }
}