import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
export declare class PythonApiService {
    private readonly chatGateway;
    private readonly chatService;
    private readonly logger;
    private readonly PYTHON_URL;
    constructor(chatGateway: ChatGateway, chatService: ChatService);
    sendVoiceToPython(audioBuffer: Buffer, clientId: string): Promise<void>;
}
