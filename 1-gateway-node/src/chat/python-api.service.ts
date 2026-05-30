import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Injectable()
export class PythonApiService {
  private readonly logger = new Logger(PythonApiService.name);
  private readonly PYTHON_URL = 'http://127.0.0.1:8000/api/chat'; 

  constructor(
    private readonly chatGateway: ChatGateway,
    private readonly chatService: ChatService
  ) {}

  async sendVoiceToPython(audioBuffer: Buffer, clientId: string) {
    const formData = new FormData();
    formData.append('audio_file', audioBuffer, {
      filename: 'voice_input.wav',
      contentType: 'audio/wav',
    });

    try {
      this.logger.log('Mengirim audio ke Python AI Service...');
      
      const response = await axios.post(`${this.PYTHON_URL}/voice`, formData, {
        headers: { ...formData.getHeaders() },
        responseType: 'stream', 
      });

      let fullAiResponse = '';

      response.data.on('data', (chunk: Buffer) => {
        const textChunk = chunk.toString().replace(/^data:\s*/gm, '').trim();
        
        if (textChunk) {
          fullAiResponse += textChunk + ' '; // Kumpulkan kata demi kata
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
          } catch (ttsError) {
            this.logger.error('Gagal membuat suara TTS:', ttsError);
          }
        }
      });

    } catch (error) {
        this.logger.error('Gagal terhubung ke Python AI Service', (error as Error).message);
        this.chatGateway.server.to(clientId).emit('error', { message: 'Otak AI sedang bermasalah.' });
    }
  }
}