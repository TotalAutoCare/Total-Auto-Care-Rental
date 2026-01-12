
import { GoogleGenAI, Type } from "@google/genai";
import { TransactionType } from "../types";

// Helper to get key from environment or global config
const getApiKey = () => {
  // Try to find the key in the environment
  return process.env.API_KEY || (window as any).VITE_API_KEY || "";
};

export async function parseTransaction(text: string) {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("Gemini API Key is missing. Please set API_KEY in Vercel environment variables.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
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

    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Architect Parsing Error:", e);
    return null;
  }
}

export async function getFinancialAdvice(transactions: any[]) {
  const apiKey = getApiKey();
  if (!apiKey) return "API Key not configured in Vercel.";

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these transactions and provide architectural financial advice: ${JSON.stringify(transactions.slice(-10))}`,
      config: {
        systemInstruction: "You are the Personal Finance Architect. Be concise, professional, and strategic. Focus on wealth optimization and asset allocation."
      }
    });
    return response.text;
  } catch (e) {
    console.error("Advice Generation Error:", e);
    return "The market is quiet. Continue your strategic transaction tracking.";
  }
}
