export declare class ChatService {
    private readonly logger;
    private tts;
    constructor();
    generateVoice(text: string): Promise<Buffer>;
}
