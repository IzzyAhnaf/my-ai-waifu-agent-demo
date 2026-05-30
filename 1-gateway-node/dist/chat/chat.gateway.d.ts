import { Server, Socket } from 'socket.io';
export declare class ChatGateway {
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleTextMessage(data: {
        text: string;
    }, client: Socket): Promise<void>;
    broadcastToClient(event: string, payload: any): void;
}
