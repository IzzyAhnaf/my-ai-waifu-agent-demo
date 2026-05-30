import sqlite3
import chromadb
from datetime import datetime

class DualMemoryManager:
    def __init__(self):
        self.sql_conn = sqlite3.connect("waifu_memory.db", check_same_thread=False)
        self.sql_cursor = self.sql_conn.cursor()
        self.sql_cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                role TEXT,
                content TEXT
            )
        """)
        self.sql_conn.commit()

        self.chroma_client = chromadb.PersistentClient(path="./chroma_data")
        
        self.collection = self.chroma_client.get_or_create_collection(name="waifu_brain")

    def save_interaction(self, user_text, ai_text):
        """Menyimpan obrolan ke SQLite dan ChromaDB sekaligus"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        self.sql_cursor.execute("INSERT INTO chat_history (timestamp, role, content) VALUES (?, ?, ?)", 
                                (timestamp, "user", user_text))
        self.sql_cursor.execute("INSERT INTO chat_history (timestamp, role, content) VALUES (?, ?, ?)", 
                                (timestamp, "ai", ai_text))
        self.sql_conn.commit()

        combined_text = f"User: {user_text}\nWaifu: {ai_text}"
        doc_id = f"mem_{timestamp.replace(' ', '_').replace(':', '')}"

        self.collection.add(
            documents=[combined_text],
            metadatas=[{"timestamp": timestamp}],
            ids=[doc_id]
        )
        print(f"💾 [MEMORI DISIMPAN] {doc_id}")

    def recall_context(self, current_query, n_results=3):
        """Mencari ingatan masa lalu yang relevan dengan pertanyaan saat ini"""
        try:
            results = self.collection.query(
                query_texts=[current_query],
                n_results=n_results
            )
            
            if results['documents'] and results['documents'][0]:
                past_memories = results['documents'][0]
                context_string = "\n---\n".join(past_memories)
                return context_string
            return ""
        except Exception as e:
            print(f"⚠️ Gagal memanggil ingatan: {e}")
            return ""

waifu_memory = DualMemoryManager()