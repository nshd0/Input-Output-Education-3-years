import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Story {
  title: string;
  content: string;
  moral?: string;
  questions: { question: string; options: string[]; answer: string }[];
}

export async function generateIndianStory(topic: string, stage: string): Promise<Story> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a short story for a ${stage} level student in an Indian school context. 
    Topic: ${topic}. 
    The story should be culturally relevant (Indian names, places, or themes like festivals, nature, village life).
    Keep the language simple and engaging.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          moral: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                answer: { type: Type.STRING },
              },
              required: ["question", "options", "answer"],
            },
          },
        },
        required: ["title", "content", "questions"],
      },
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse story JSON", e);
    throw new Error("Could not generate story");
  }
}

export async function textToSpeech(text: string, voice: 'Kore' | 'Zephyr' | 'Puck' = 'Kore'): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [{ parts: [{ text: `Speak in a friendly, encouraging voice for a child: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("No audio data returned");
  }
  return base64Audio;
}
