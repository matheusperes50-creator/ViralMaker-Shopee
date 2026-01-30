import { GoogleGenAI } from "@google/genai";

export interface StagingConfig {
  environment: string;
  lighting: string;
  style: string;
}

export const generateStagedImages = async (base64Product: string, config: StagingConfig): Promise<string[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isAuto = config.environment.toLowerCase() === 'automático';

  // Geramos apenas 1 imagem por vez para evitar erros de quota (429) comuns em chaves novas
  const prompt = `
    INSTRUCTION: Take the product from the provided image and place it in a NEW professional environment.
    ENVIRONMENT: ${isAuto ? 'Professional high-end commercial studio setup' : config.environment}.
    STYLE: ${config.style}, ultra-realistic advertising photography, 8k, sharp focus.
    LIGHTING: ${config.lighting}, soft cinematic shadows.
    COMPOSITION: Product centered, eye-level shot, professional depth of field (blurred background).
    CRITICAL RULE: The product must look EXACTLY as provided, but perfectly integrated into the surface with realistic contact shadows.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { 
            inlineData: { 
              data: base64Product.includes(',') ? base64Product.split(',')[1] : base64Product, 
              mimeType: 'image/jpeg' 
            } 
          },
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    const images: string[] = [];
    if (response.candidates?.[0]?.content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          images.push(`data:image/png;base64,${part.inlineData.data}`);
        }
      }
    }

    if (images.length === 0) throw new Error("NO_IMAGE_RETURNED");
    return images;
    
  } catch (error) {
    console.error("Erro detalhado na API Gemini:", error);
    throw error;
  }
};