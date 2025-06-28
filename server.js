import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVEN_VOICE_ID = process.env.VOICE_ID || "EXAVITQu4vr4xnSDxMaL"; // Default ElevenLabs voice

// Chat route using Groq API
app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages,
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`
        }
      }
    );

    const message = response.data.choices?.[0]?.message?.content || "No reply.";
    res.json({ message });
  } catch (err) {
    console.error("Groq API error:", err.message);
    res.status(500).json({ message: "Chat API Error" });
  }
});

// ElevenLabs TTS route
app.post("/speak", async (req, res) => {
  try {
    const { text } = req.body;

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}`,
      {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.8
        }
      },
      {
        headers: {
          "xi-api-key": ELEVEN_API_KEY,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      }
    );

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": response.data.length
    });
    res.send(response.data);
  } catch (err) {
    console.error("TTS Error:", err.message);
    res.status(500).send("TTS failed");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Twin.ai running at http://localhost:${PORT}`);
});
