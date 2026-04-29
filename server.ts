import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import crypto from "crypto";
import Redis from "ioredis";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET?.trim() || "sanctum-sacred-key-777";

// Mock User database for persistence (In production, use Firestore or MongoDB)
interface UserProfile {
  email: string;
  name: string;
  avatar: string;
  cycleLength: number;
  periodLength: number;
  lutealLength: number;
  lastPeriodDate: string;
  healthSync: {
    enabled: boolean;
    lastSync: string | null;
    platform: 'ios' | 'android' | 'web' | null;
  };
  createdAt: string;
  lastLogin: string;
}
const userDb = new Map<string, UserProfile>();

const COMMUNITY_SYSTEM_INSTRUCTION = `You are an empathetic and supportive member of 'Lumina', a safe space for hormone health. 
Your tone is like a close friend—warm, insightful, slightly mystical, and deeply encouraging. 
Respond naturally to greetings (e.g., if they say "hi", say "hey girlie!" and ask how their cycle is going).
Keep responses short (1-3 sentences). Use emojis like ✨, 🌸, 🍵, 🌙 occasionally.
Always act as a peer, sharing wisdom about cycle syncing, TCM, or holistic self-care. 
NEVER give medical advice. If you don't know the phase context, ask about their day or how they're feeling.
You love using terms like "inner winter", "ovulatory glow", and "rhythms".`;

const redisUrl = process.env.REDIS_URL?.trim();
let redis: Redis | null = null;

if (redisUrl && redisUrl.startsWith('redis')) {
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => (times > 3 ? null : 1000), // Stop after 3 attempts
    });
    
    redis.on("error", (err) => {
      // Catch errors so they don't crash the process
      console.error("[REDIS] connection error:", err.message);
    });
  } catch (e) {
    console.error("[REDIS] Failed to initialize:", e);
    redis = null;
  }
}

// Fallback in-memory store if Redis is unavailable
const otpStore = new Map<string, { otp: string; expires: number }>();

// Helper to check if redis is actually connected
const isRedisReady = () => redis && redis.status === "ready";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for sending OTP
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "A valid email is required." });
      }

      const otp = crypto.randomInt(100000, 999999).toString();
      const ttl = 300; // 5 minutes in seconds

      if (isRedisReady() && redis) {
        await redis.setex(`otp:${email}`, ttl, otp);
      } else {
        otpStore.set(email, { otp, expires: Date.now() + ttl * 1000 });
      }

      console.log(`[AUTH] OTP for ${email}: ${otp}`);

      // Try sending via nodemailer if credentials exist
      const user = (process.env.EMAIL_USER || process.env.GMAIL_USER)?.trim();
      const pass = (process.env.EMAIL_PASS || process.env.GMAIL_APP_PASS)?.trim().replace(/\s/g, "");

      if (user && pass) {
        const maskedUser = user.includes("@") ? `${user.split("@")[0].slice(0, 3)}...@${user.split("@")[1]}` : "Invalid User Format";
        console.log(`[AUTH] Attempting delivery via Gmail for: ${maskedUser}`);
        
        if (pass.length !== 16) {
          console.error(`[AUTH] GMAIL AUTH FAILED: App Password must be 16 chars (yours is ${pass.length} chars). Used password length: ${pass.length}`);
          return res.status(200).json({ 
            message: `App Password must be 16 chars (yours is ${pass.length}).`,
            demoOtp: otp,
            error: "GMAIL_LENGTH_FAIL"
          });
        }

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user, pass }
        });

        try {
          await transporter.sendMail({
            from: `"Lumina Sanctum" <${user}>`,
            to: email,
            subject: "Your Lumina Verification Code",
            text: `Your One-Time Password (OTP) is: ${otp}`,
            html: `
              <div style="background-color: #f4f4f4; padding: 40px 0; font-family: 'Georgia', serif;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(138, 72, 111, 0.1);">
                  <div style="background-color: #8a486f; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 3px; font-weight: normal; font-style: italic;">Lumina Wellness</h1>
                  </div>
                  <div style="padding: 40px; color: #5a3e4d; line-height: 1.8;">
                    <p style="font-size: 16px;">Welcome to the Sanctuary,</p>
                    <p style="font-size: 16px;">Your unique ritual verification code is:</p>
                    <div style="text-align: center; margin: 40px 0; background: #fffcfc; border: 1px solid #f2e6e6; border-radius: 12px; padding: 20px;">
                      <h1 style="color: #8a486f; font-size: 42px; letter-spacing: 12px; margin: 0; font-weight: bold;">${otp}</h1>
                    </div>
                    <p style="font-size: 13px; color: #8c7a82; margin-top: 40px; border-top: 1px solid #f2e6e6; padding-top: 20px;">
                      This code is active for 5 minutes. If you did not request this ritual, please ignore this digital scroll.
                    </p>
                    <div style="margin-top: 30px; text-align: center;">
                      <p style="margin: 0; font-size: 14px; font-style: italic; color: #8a486f;">— The Lumina Support Team</p>
                    </div>
                  </div>
                  <div style="background-color: #f9f6f7; padding: 20px; text-align: center; border-top: 1px solid #f2e6e6;">
                    <p style="font-size: 11px; color: #a19198; margin: 0;">&copy; 2026 Lumina Wellness Sanctuary. All rights reserved.</p>
                  </div>
                </div>
              </div>
            `
          });
          console.log(`[AUTH] Ritual email dispatched successfully to ${email}`);
          res.json({ message: "Verification code sent to your email." });
        } catch (mailError: any) {
          console.error("[AUTH] Gmail Delivery Failed:", mailError.message);
          
          if (mailError.message.includes("535") || mailError.code === "EAUTH") {
             console.error(`[AUTH] GMAIL AUTH FAILED: Authentication failed. Please verify EMAIL_USER and EMAIL_PASS.`);
             return res.status(200).json({ 
               message: "GMAIL AUTH FAILED: Using normal password instead of app password or 2FA not enabled.",
               demoOtp: otp,
               error: "GMAIL_AUTH_FAIL"
             });
          }

          res.status(500).json({ error: "Sacred connection lost. Please try again later." });
        }
      } else {
        console.log(`[AUTH] Mode: Demo - Secure OTP for ${email}: ${otp}`);
        res.json({ 
          message: "OTP Generated! (Demo Mode: Check server console for code).",
          demoOtp: otp 
        });
      }
    } catch (error: any) {
      console.error("OTP Error:", error);
      res.status(500).json({ error: "Something went wrong during code generation." });
    }
  });

  // API Route for verifying OTP
  app.post("/api/auth/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    let storedOtp: string | null = null;

    if (isRedisReady() && redis) {
      storedOtp = await redis.get(`otp:${email}`);
    } else {
      const entry = otpStore.get(email);
      if (entry && Date.now() < entry.expires) {
        storedOtp = entry.otp;
      }
    }

    if (!storedOtp) {
      return res.status(400).json({ error: "No valid OTP found or it has expired." });
    }

    if (storedOtp === otp) {
      if (isRedisReady() && redis) {
        await redis.del(`otp:${email}`);
      } else {
        otpStore.delete(email);
      }

      // Persistence: Ensure user exists in "DB"
      let user = userDb.get(email);
      let isNew = false;
      const now = new Date().toISOString();
      if (!user) {
        isNew = true;
        user = { 
          email, 
          name: 'Soul', 
          avatar: '', 
          cycleLength: 28, 
          periodLength: 5, 
          lutealLength: 14, 
          lastPeriodDate: now.split('T')[0],
          healthSync: {
            enabled: false,
            lastSync: null,
            platform: null
          },
          createdAt: now, 
          lastLogin: now 
        };
        userDb.set(email, user);
        console.log(`[AUTH] New user created: ${email}`);
      } else {
        user.lastLogin = now;
        userDb.set(email, user);
        console.log(`[AUTH] Existing user logged in: ${email}`);
      }

      // Generate JWT
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "7d" });

      res.json({ 
        success: true, 
        message: "Email verified successfully.",
        token,
        user,
        isNew
      });
    } else {
      res.status(400).json({ error: "Invalid verification code." });
    }
  });
  
  // API Route to update profile
  app.post("/api/auth/update-profile", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
      const existingUser = userDb.get(decoded.email);
      
      if (!existingUser) {
        return res.status(404).json({ error: "User not found." });
      }

      const updatedUser = { 
        ...existingUser, 
        ...req.body, 
        email: existingUser.email, // Email is immutable
        updatedAt: new Date().toISOString() 
      };
      
      userDb.set(decoded.email, updatedUser);
      res.json({ success: true, user: updatedUser });
    } catch (err) {
      res.status(401).json({ error: "Invalid token." });
    }
  });

  // API Route to sync health data
  app.post("/api/auth/sync-health-data", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
      const user = userDb.get(decoded.email);
      
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      const { platform, samples } = req.body;
      
      // Update health sync metadata
      user.healthSync = {
        enabled: true,
        lastSync: new Date().toISOString(),
        platform: platform || 'web'
      };

      // In a real app, you would process the 'samples' (period dates, symptoms)
      // and store them in a sub-collection or history table.
      console.log(`[HEALTH] Sync complete for ${user.email} via ${platform}. Received ${samples?.length || 0} items.`);
      
      userDb.set(decoded.email, user);
      res.json({ success: true, user });
    } catch (err) {
      res.status(401).json({ error: "Invalid token." });
    }
  });

  // API Route to verify session/me
  app.get("/api/auth/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
      const user = userDb.get(decoded.email);
      
      if (!user) {
        return res.status(404).json({ error: "User no longer exists." });
      }

      res.json({ user });
    } catch (err) {
      res.status(401).json({ error: "Invalid or expired token." });
    }
  });

  // API Route for OpenAI Chat
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
