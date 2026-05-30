"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PythonApiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonApiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const chat_gateway_1 = require("./chat.gateway");
const chat_service_1 = require("./chat.service");
let PythonApiService = PythonApiService_1 = class PythonApiService {
    chatGateway;
    chatService;
    logger = new common_1.Logger(PythonApiService_1.name);
    PYTHON_URL = 'http://127.0.0.1:8000/api/chat';
    constructor(chatGateway, chatService) {
        this.chatGateway = chatGateway;
        this.chatService = chatService;
    }
    async sendVoiceToPython(audioBuffer, clientId) {
        const formData = new form_data_1.default();
        formData.append('audio_file', audioBuffer, {
            filename: 'voice_input.wav',
            contentType: 'audio/wav',
        });
        try {
            this.logger.log('Mengirim audio ke Python AI Service...');
            const response = await axios_1.default.post(`${this.PYTHON_URL}/voice`, formData, {
                headers: { ...formData.getHeaders() },
                responseType: 'stream',
            });
            let fullAiResponse = '';
            response.data.on('data', (chunk) => {
                const textChunk = chunk.toString().replace(/^data:\s*/gm, '').trim();
                if (textChunk) {
                    fullAiResponse += textChunk + ' ';
                    this.chatGateway.server.to(clientId).emit('token_stream', { text: textChunk });
                }
            });
            response.data.on('end', async () => {
                this.logger.log('AI selesai berpikir. Merender suara TTS...');
                this.chatGateway.server.to(clientId).emit('stream_end', { status: 'done' });
                const finalCleanText = fullAiResponse.trim();
                if (finalCleanText) {
                    try {
                        const audioMp3Buffer = await this.chatService.generateVoice(finalCleanText);
                        this.chatGateway.server.to(clientId).emit('audio_response', { audio: audioMp3Buffer });
                        this.logger.log('🎵 Audio balasan berhasil dikirim ke Flutter!');
                    }
                    catch (ttsError) {
                        this.logger.error('Gagal membuat suara TTS:', ttsError);
                    }
                }
            });
        }
        catch (error) {
            this.logger.error('Gagal terhubung ke Python AI Service', error.message);
            this.chatGateway.server.to(clientId).emit('error', { message: 'Otak AI sedang bermasalah.' });
        }
    }
};
exports.PythonApiService = PythonApiService;
exports.PythonApiService = PythonApiService = PythonApiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [chat_gateway_1.ChatGateway,
        chat_service_1.ChatService])
], PythonApiService);
//# sourceMappingURL=python-api.service.js.map