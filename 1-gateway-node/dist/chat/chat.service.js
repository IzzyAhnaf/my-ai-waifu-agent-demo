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
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const msedge_tts_1 = require("msedge-tts");
let ChatService = ChatService_1 = class ChatService {
    logger = new common_1.Logger(ChatService_1.name);
    tts;
    constructor() {
        this.tts = new msedge_tts_1.MsEdgeTTS();
    }
    async generateVoice(text) {
        this.logger.log(`Membuat suara untuk teks: "${text.substring(0, 30)}..."`);
        try {
            await this.tts.setMetadata('id-ID-GadisNeural', msedge_tts_1.OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
            return new Promise((resolve, reject) => {
                let audioChunks = [];
                const { audioStream } = this.tts.toStream(text);
                audioStream.on('data', (chunk) => {
                    audioChunks.push(chunk);
                });
                audioStream.on('close', () => {
                    this.logger.log('✅ Buffer suara MP3 berhasil dibuat.');
                    resolve(Buffer.concat(audioChunks));
                });
                audioStream.on('error', (err) => {
                    this.logger.error('Gagal membuat suara:', err);
                    reject(err);
                });
            });
        }
        catch (error) {
            this.logger.error('Error saat inisialisasi TTS:', error);
            throw error;
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ChatService);
//# sourceMappingURL=chat.service.js.map