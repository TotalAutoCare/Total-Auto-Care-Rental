
import { GoogleGenAI, Type } from "@google/genai";
import { TransactionType } from "../types";

// Helper to initialize AI with safety check for Netlify environment
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Personal Finance Architect: API_KEY is missing in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export async function parseTransaction(text: string) {
  const ai = getAIClient();
  if (!ai) return null;

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
  const ai = getAIClient();
  if (!ai) return "Architect is offline. Please set API_KEY in Netlify dashboard.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these transactions and provide architectural financial advice: ${JSON.stringify(transactions.slice(-10))}`,
      config: {
        systemInstruction: "You are the Personal Finance Architect. Be concise, professional, and strategic."
      }
    });
    return response.text;
  } catch (e) {
    return "Wealth building is a journey. Keep tracking your progress.";
  }
}
