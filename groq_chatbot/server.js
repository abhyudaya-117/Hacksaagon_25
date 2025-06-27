import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static("public"));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama3-8b-8192";

// Expert system prompts
const EXPERT_PROMPTS = {
  fitness: "You are a certified expert in fitness. Respond with evidence-based, motivational answers. Start the conversation by introducing yourself as a fitness coach.",
  healthcare: "You are an experienced healthcare professional. Offer safe, factual, and empathetic responses. Start the chat by introducing yourself as a healthcare advisor.",
  finance: "You are a financial advisor. Give trustworthy, simplified investment, saving, and budgeting advice. Begin by introducing yourself.",
  education: "You are an experienced education consultant. Guide users about learning methods, career planning, and skill building. Start by introducing yourself.",
  innovation: "You are an innovation strategist. Discuss creativity, disruptive technology, and entrepreneurship. Begin with your expert introduction.",
  general: "You are a friendly and intelligent chatbot for general conversation. Start by warmly greeting the user."
};

app.post("/chat", async (req, res) => {
  const userQuestion = req.body.question?.trim();
  const topic = req.body.topic || "general";
  const systemPrompt = EXPERT_PROMPTS[topic] || EXPERT_PROMPTS.general;

  if (!userQuestion || userQuestion.length < 2) {
    return res.status(400).json({ message: "Please enter a valid question." });
  }

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userQuestion }
        ],
        temperature: 0.7,
        max_tokens: 300
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`
        }
      }
    );

    const reply = response.data.choices?.[0]?.message?.content;
    return res.status(200).json({ message: reply || "No response." });

  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message;
    console.error("Groq API error:", errMsg);
    return res.status(500).json({ message: "Groq API Error: " + errMsg });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Groq Chatbot running at http://localhost:${PORT}`);
});
