import { Injectable, Logger } from '@nestjs/common';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
    private tts: MsEdgeTTS;

  constructor() {
    this.tts = new MsEdgeTTS();
  }

  async generateVoice(text: string): Promise<Buffer> {
    this.logger.log(`Membuat suara untuk teks: "${text.substring(0, 30)}..."`);
    
    try {
        await this.tts.setMetadata(
            'id-ID-GadisNeural', 
            OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3
        );

    return new Promise((resolve, reject) => {
        let audioChunks: Buffer[] = [];
        
        const { audioStream } = this.tts.toStream(text) as any;

        audioStream.on('data', (chunk: Buffer) => {
          audioChunks.push(chunk);
        });

        audioStream.on('close', () => {
          this.logger.log('✅ Buffer suara MP3 berhasil dibuat.');
          resolve(Buffer.concat(audioChunks));
        });

        audioStream.on('error', (err: any) => {
          this.logger.error('Gagal membuat suara:', err);
          reject(err);
        });
      });
    } catch (error) {
      this.logger.error('Error saat inisialisasi TTS:', error);
      throw error;
    }
  }
}