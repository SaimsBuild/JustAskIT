import type { Express } from "express";
import { createServer, type Server } from "http";
import { chatRequestSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/chat", async (req, res) => {
    try {
      const validatedData = chatRequestSchema.parse(req.body);
      const { message, conversationHistory = [] } = validatedData;

      const messages = [
        ...conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: "user" as const,
          content: message,
        },
      ];

      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: "OpenRouter API key not configured" });
        return;
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://justaski-ai.replit.app",
          "X-Title": "JustAskIT",
        },
        body: JSON.stringify({
          model: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
          messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("OpenRouter API error:", error);
        res.status(response.status).json({ 
          error: "Failed to get response from AI service" 
        });
        return;
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        res.status(500).json({ error: "Failed to read AI response" });
        return;
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              
              if (data === "[DONE]") {
                res.write(`data: [DONE]\n\n`);
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                
                if (content) {
                  res.write(`data: ${JSON.stringify({ content })}\n\n`);
                }
              } catch (e) {
                console.error("Error parsing OpenRouter response:", e);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error streaming response:", error);
      } finally {
        res.end();
      }
    } catch (error) {
      console.error("Chat API error:", error);
      if (!res.headersSent) {
        res.status(400).json({ 
          error: error instanceof Error ? error.message : "Invalid request" 
        });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
