import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static("public"));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama3-8b-8192"; // You can change to llama3-70b-8192 or mixtral-8x7b

app.post("/chat", async (req, res) => {
  const userQuestion = req.body.question?.trim();

  if (!userQuestion || userQuestion.length < 2) {
    return res.status(400).json({ message: "Please enter a valid question." });
  }

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: MODEL,
        messages: [{ role: "user", content: userQuestion }],
        temperature: 0.7,
        max_tokens: 200
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`
        }
      }
    );

    const reply = response.data.choices?.[0]?.message?.content;
    if (reply) {
      return res.status(200).json({ message: reply });
    } else {
      return res.status(500).json({ message: "Groq API returned no message." });
    }
  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message;
    console.error("Groq API error:", errMsg);
    return res.status(500).json({ message: "Groq API Error: " + errMsg });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Groq Chatbot running at http://localhost:${PORT}`);
});
