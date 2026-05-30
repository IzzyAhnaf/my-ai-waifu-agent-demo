import { Controller, Post, UseInterceptors, UploadedFile, HttpException, HttpStatus, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PythonApiService } from './python-api.service';

@Controller('chat')
export class ChatController {
  
  constructor(private readonly pythonService: PythonApiService) {}
  @Post('voice')
  @UseInterceptors(FileInterceptor('audio_file', { storage: memoryStorage() }))
  async handleVoiceInput(
    @UploadedFile() file: Express.Multer.File,
    @Body('clientid') clientId: string) {
    if (!file) {
      throw new HttpException('File audio tidak ditemukan', HttpStatus.BAD_REQUEST);
    }

    try {
    console.log(`Menerima audio dari Flutter, ukuran: ${file.size} bytes`);

      this.pythonService.sendVoiceToPython(file.buffer, clientId);

      return { status: 'success', message: 'Audio sedang diproses AI' };
    } catch (error) {
      throw new HttpException('Gagal memproses audio', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}