
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { FINTECH_SYSTEM_PROMPT, FALLBACK_MESSAGE } from "./constants";
import { FileData, Message, Source, Sender } from "./types";

export const generateFintechResponse = async (
  prompt: string,
  history: Message[],
  files: FileData[],
  allowFallback: boolean = false
): Promise<{ text: string; sources?: Source[] }> => {
  // Create a new instance right before the call to ensure it uses the current process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  // Updated to gemini-3-pro-preview as financial analysis is a complex reasoning task.
  const model = "gemini-3-pro-preview";
  
  const historyParts = history.map(m => ({
    role: m.sender === Sender.USER ? 'user' : 'model',
    parts: [{ text: m.text }]
  }));

  const fileParts: Part[] = files.map(f => {
    if (f.type.startsWith('image/')) {
      return {
        inlineData: {
          data: f.data.split(',')[1],
          mimeType: f.type
        }
      };
    } else {
      return { text: `Attached Document Content (Filename: ${f.name}):\n---BEGIN---\n${f.data}\n---END---` };
    }
  });

  let modeInstruction = "";
  if (files.length > 0 && !allowFallback) {
    modeInstruction = "DOCUMENT_LOCK: Answer using ONLY the attached file content. If the information is missing, trigger the mandatory fallback string exactly.";
  } else if (allowFallback) {
    modeInstruction = "EXTENDED_SEARCH: User has authorized real-time market data access. Provide comprehensive analysis using Google Search.";
  }

  const contents = [
    ...historyParts,
    { 
      role: 'user' as const, 
      parts: [
        ...fileParts, 
        { text: `${modeInstruction}\n\nUser Financial Query: ${prompt}\n\nSystem: If numerical trends are discussed, use [CHART_DATA: ...] with type 'line', 'bar', or 'pie'.` }
      ] 
    }
  ];

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: FINTECH_SYSTEM_PROMPT,
        tools: allowFallback ? [{ googleSearch: {} }] : [],
        temperature: allowFallback ? 0.3 : 0.0,
      },
    });

    const candidate = response.candidates?.[0];
    const generatedText = response.text || "I apologize, but I am unable to process this financial query at the moment.";
    
    const sources: Source[] = [];
    const chunks = candidate?.groundingMetadata?.groundingChunks;
    
    if (Array.isArray(chunks)) {
      chunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri) {
          sources.push({
            title: chunk.web.title || "Market Intelligence Link",
            uri: chunk.web.uri
          });
        }
      });
    }

    return { 
      text: generatedText,
      sources: sources.length > 0 ? sources : undefined
    };
  } catch (error: any) {
    console.error("FinTech Node Exception:", error);
    // Rethrow to allow the UI to catch and handle key errors
    throw error;
  }
};
