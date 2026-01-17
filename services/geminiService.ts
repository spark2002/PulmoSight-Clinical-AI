
import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeXRay = async (base64Image: string): Promise<ScanResult> => {
  const model = 'gemini-3-flash-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1] || base64Image,
          },
        },
        {
          text: "Analyze this pulmonary X-ray for diagnostic purposes. Identify signs of Tuberculosis, Pneumonia, or Normal lung tissue. Return a structured JSON report."
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          confidence: { type: Type.NUMBER, description: "Confidence score 0-100" },
          diagnosis: { type: Type.STRING, description: "Main diagnosis" },
          findings: { type: Type.ARRAY, items: { type: Type.STRING } },
          reportText: { type: Type.STRING, description: "Full clinical-style report text" },
          patientId: { type: Type.STRING },
        },
        required: ["confidence", "diagnosis", "findings", "reportText", "patientId"]
      }
    }
  });

  return JSON.parse(response.text) as ScanResult;
};

export const chatWithAI = async (message: string, context: string) => {
  const model = 'gemini-3-flash-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: `
      Context from Medical Report: ${context}
      User Question: ${message}
      Answer as a medical AI assistant. Be precise, professional, and empathetic. Always advise consulting a human professional.
    `,
  });

  return response.text;
};
