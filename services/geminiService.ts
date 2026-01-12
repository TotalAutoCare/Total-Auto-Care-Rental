
import { GoogleGenAI, Type } from "@google/genai";
import { TransactionType } from "../types";

// Netlify uses process.env for build-time variables. 
// For client-side access, ensure API_KEY is set in the Netlify UI.
const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export async function parseTransaction(text: string) {
  if (!apiKey) {
    console.error("API Key missing. Please set API_KEY in your environment.");
    return null;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Parse the following financial transaction text: "${text}". 
    Extract the amount, description, and determine if it is an INCOME or an EXPENSE. 
    Current date is ${new Date().toISOString().split('T')[0]}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          type: { type: Type.STRING, enum: [TransactionType.INCOME, TransactionType.EXPENSE] },
          category: { type: Type.STRING }
        },
        required: ["description", "amount", "type", "category"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return null;
  }
}

export async function getFinancialAdvice(transactions: any[]) {
  if (!apiKey) return "API Key not configured. Please add your Gemini API Key to environment variables.";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze these transactions and provide a short, concise architectural advice for my personal finances: ${JSON.stringify(transactions)}`,
    config: {
      systemInstruction: "You are the Personal Finance Architect. Be concise, professional, and insight-driven. Focus on trends and health."
    }
  });
  return response.text;
}
