import { PythonApiService } from './python-api.service';
export declare class ChatController {
    private readonly pythonService;
    constructor(pythonService: PythonApiService);
    handleVoiceInput(file: Express.Multer.File, clientId: string): Promise<{
        status: string;
        message: string;
    }>;
}
