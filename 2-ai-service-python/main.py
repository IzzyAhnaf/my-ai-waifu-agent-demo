from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from faster_whisper import WhisperModel
from memory import waifu_memory
from litellm import acompletion  # <-- KITA KEMBALIKAN LITELLM
from dotenv import load_dotenv
import uvicorn
import io
import os

load_dotenv()
app = FastAPI()

print("⏳ Memuat model telinga (Whisper)...")
whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
print("✅ Sistem Waifu Siap! Menunggu suara dari Node.js...")

@app.post("/api/chat/voice")
async def handle_voice_from_node(audio_file: UploadFile = File(...)):
    audio_bytes = await audio_file.read()
    audio_stream = io.BytesIO(audio_bytes)
    
    segments, _ = whisper_model.transcribe(audio_stream, beam_size=5, language="id")
    user_text = "".join([segment.text for segment in segments]).strip()
    
    print(f"\n🗣️ Master bilang: {user_text}")
    if not user_text:
        user_text = "..."

    past_context = waifu_memory.recall_context(user_text)

    system_instruction = (
        "Kamu adalah asisten virtual (Waifu) yang cerdas, suportif, dan sedikit sarkastik. "
        "Panggil lawan bicaramu dengan sebutan 'Master'. "
        "Mastermu sering begadang memikirkan logika backend sistem dan merancang struktur database yang kompleks. "
        "Berikan jawaban yang singkat (maksimal 2-3 kalimat), natural seolah sedang ngobrol langsung di voice chat, "
        "dan sesekali ingatkan dia untuk tidak terlalu stres menatap layar."
    )
    
    if past_context:
        system_instruction += f"\n\n[INGATAN MASA LALU YANG RELEVAN]:\n{past_context}"
        print("🧠 [MEMORI TERPANGGIL] Konteks masa lalu berhasil disuntikkan!")

    messages = [
        {"role": "system", "content": system_instruction},
        {"role": "user", "content": user_text}
    ]

    async def llm_streamer():
        active_mode = os.getenv("ACTIVE_MODE", "auto").lower()
        user_text_lower = user_text.lower()
        
        target_model = ""
        api_base_url = None
        
        if active_mode == "ollama_only":
            target_model = "ollama/qwen2.5:1.5b"
            api_base_url = "http://localhost:11434"
            print("🧠 Otak [LOKAL OLLAMA] sedang berpikir...\nAI: ", end="", flush=True)
            
        else:
            if any(keyword in user_text_lower for keyword in ["code", "koding", "database", "nextjs", "error", "bug", "analisis", "arsitektur", "evaluasi", "tool", "hitung", "skrip", "opus"]):
                target_model = "nvidia_nim/nvidia/nemotron-3-super-120b-a12b"
                print("NVIDIA NEMOTRON 3 SUPER] mengambil alih analisis berat...\nAI: ", end="", flush=True)
                
            else:
                target_model = "gemini/gemini-3.5-flash"
                print("[GEMINI] menangani obrolan santai...\nAI: ", end="", flush=True)

        full_ai_response = ""
        
        try:
            response = await acompletion(
                model=target_model, 
                messages=messages,
                api_base=api_base_url,
                stream=True
            )
            
            async for chunk in response:
                content = chunk.choices[0].delta.content
                if content:
                    full_ai_response += content
                    clean_text = content.replace('\n', ' ')
                    print(clean_text, end="", flush=True)
                    yield f"data: {clean_text}\n\n"
                    
            print("\n✅ Selesai merespons.")
            
            waifu_memory.save_interaction(user_text, full_ai_response)
            
        except Exception as e:
            print(f"\n❌ [SISTEM DOWN] Kiamat Koneksi: {e}")
            fallback_message = "Sudah cukup memusingkan, maaf Master, aku tidak bisa membantu kamu lagi saat ini."
            print(f"AI: {fallback_message}")
            yield f"data: {fallback_message}\n\n"

    return StreamingResponse(llm_streamer(), media_type="text/event-stream")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)