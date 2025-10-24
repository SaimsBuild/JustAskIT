import { z } from "zod";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const insertMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1, "Message content is required"),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;

export const chatRequestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  conversationHistory: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
