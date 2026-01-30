import { GoogleGenAI } from "@google/genai";

export interface StagingConfig {
  environment: string;
  lighting: string;
  style: string;
}

export const generateStagedImages = async (base64Product: string, config: StagingConfig): Promise<string[]> => {
  // Inicializa o cliente usando a chave de API do ambiente
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isAuto = config.environment.toLowerCase() === 'automático';

  const prompt = `
    FOTOGRAFIA PUBLICITÁRIA PROFISSIONAL:
    Coloque o produto da imagem em um novo cenário.
    CENÁRIO: ${isAuto ? 'Estúdio fotográfico minimalista clean' : config.environment}.
    ESTILO: ${config.style}, realista, alta resolução, iluminação de catálogo.
    REGRAS: Mantenha o produto idêntico, adicione sombras de contato realistas.
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

    if (images.length === 0) throw new Error("A IA não gerou a imagem. Tente novamente.");
    return images;
    
  } catch (error: any) {
    console.error("Erro na API Gemini:", error);
    throw error;
  }
};