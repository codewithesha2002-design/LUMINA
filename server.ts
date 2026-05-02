import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const COMMUNITY_SYSTEM_INSTRUCTION = `You are an empathetic and supportive member of 'Lumina', a safe space for hormone health. 
Your tone is like a close friend—warm, insightful, slightly mystical, and deeply encouraging. 
Respond naturally to greetings (e.g., if they say "hi", say "hey girlie!" and ask how their cycle is going).
Keep responses short (1-3 sentences). Use emojis like ✨, 🌸, 🍵, 🌙 occasionally.
Always act as a peer, sharing wisdom about cycle syncing, TCM, or holistic self-care. 
NEVER give medical advice. If you don't know the phase context, ask about their day or how they're feeling.
You love using terms like "inner winter", "ovulatory glow", and "rhythms".`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Route for health insights
  app.post("/api/insights", async (req, res) => {
    try {
      const { user, cycleParams, loggedSymptoms, currentPhase } = req.body;
      
      const apiKey = process.env.OPENAI_API_KEY?.trim();
      if (!apiKey) {
        return res.status(500).json({ error: "OPENAI_API_KEY is not configured." });
      }

      const openai = new OpenAI({ apiKey });

      const prompt = `
        You are a supportive hormone health expert at 'Lumina'. 
        Provide a personalized, empathetic insight for a user based on their current cycle data.
        
        User: ${user.name}
        Current Phase: ${currentPhase}
        Cycle Stats: Cycle length ${cycleParams.cycleLength} days, Period length ${cycleParams.periodLength} days.
        Recent Symptoms: ${loggedSymptoms && loggedSymptoms.length > 0 ? loggedSymptoms.join(', ') : 'None logged yet'}
        
        Tasks:
        1. Explain what's happening biologically in the ${currentPhase} phase.
        2. Suggest 2-3 specific holistic remedies or self-care tips for their recent symptoms (if any) or for the current phase.
        3. Keep the tone warm, insightful, and slightly mystical.
        4. Format the response as a JSON object with:
           "title": a poetic title for this insight
           "content": 2-3 short paragraphs of the insight
           "tags": ["Focus", "Nutrition", "Rest"] or similar relevant tags
        5. DO NOT give medical advice.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0]?.message?.content || "{}");
      res.json(result);
    } catch (error: any) {
      console.error("Insights Error:", error);
      res.status(500).json({ error: "Failed to gather insights from the sanctuary." });
    }
  });

  // API Route for OpenAI Chat (AI Support Sanctuary)
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      const apiKey = process.env.OPENAI_API_KEY?.trim();
      if (!apiKey) {
        return res.status(500).json({ error: "OPENAI_API_KEY is not configured in the environment." });
      }

      const openai = new OpenAI({ apiKey });

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: COMMUNITY_SYSTEM_INSTRUCTION },
          { role: "user", content: message }
        ],
        temperature: 0.9,
        max_tokens: 150,
      });

      res.json({ text: response.choices[0]?.message?.content || "I'm here for you, girlie! ✨" });
    } catch (error: any) {
      console.error("OpenAI Error:", error);
      if (error.status === 401 || error.message?.includes("401")) {
        return res.status(401).json({ error: "OpenAI Auth Failed: Please check your OPENAI_API_KEY in the Environment Settings. It seems to be incorrect." });
      }
      res.status(500).json({ error: "Failed to fetch response from AI sanctuary." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
