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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const python_api_service_1 = require("./python-api.service");
let ChatController = class ChatController {
    pythonService;
    constructor(pythonService) {
        this.pythonService = pythonService;
    }
    async handleVoiceInput(file, clientId) {
        if (!file) {
            throw new common_1.HttpException('File audio tidak ditemukan', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            console.log(`Menerima audio dari Flutter, ukuran: ${file.size} bytes`);
            this.pythonService.sendVoiceToPython(file.buffer, clientId);
            return { status: 'success', message: 'Audio sedang diproses AI' };
        }
        catch (error) {
            throw new common_1.HttpException('Gagal memproses audio', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Post)('voice'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('audio_file', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('clientid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "handleVoiceInput", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [python_api_service_1.PythonApiService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map