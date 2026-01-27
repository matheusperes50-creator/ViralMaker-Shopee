
import { GoogleGenAI } from "@google/genai";

export interface StagingConfig {
  environment: string;
  lighting: string;
  style: string;
}

/**
 * Generates high-quality staged product images using gemini-2.5-flash-image.
 * This model uses the default process.env.API_KEY and does not trigger the manual key selection dialog.
 */
export const generateStagedImages = async (base64Product: string, config: StagingConfig): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isAuto = config.environment.toLowerCase() === 'automático';

  const variations = [
    "Eye-level shot, centered composition, soft shadows.",
    "Slightly high angle, product slightly off-center for dynamic feel, dramatic rim lighting.",
    "Macro close-up focus, shallow depth of field, warm ambient lighting reflections."
  ];

  const generateOption = async (variation: string) => {
    const prompt = `
      INSTRUCTION: Take the product from the provided image and place it into a NEW environment.
      ${isAuto ? 'ENVIRONMENT ANALYSIS: Identify the product and place it in the most suitable, high-end professional commercial environment for this specific category (e.g., if it is a beauty product, use a marble bathroom; if tech, use a modern desk; if food, use a clean kitchen).' : `ENVIRONMENT: ${config.environment}.`}
      STYLE: ${config.style}, high-end commercial photography, ultra-realistic, professional studio quality.
      LIGHTING: ${config.lighting}, cinematic.
      PERSPECTIVE: ${variation}
      
      CRITICAL RULES:
      1. The product from the original image must be the central focus and look exactly as provided.
      2. INTEGRATION: Ensure the product is perfectly integrated into the surface. Add realistic contact shadows, ambient occlusion, and reflections.
      3. COMPOSITION: Use professional depth of field (bokeh background).
      4. NO FLOATING: The product must look firmly and heavily placed on the surface.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { 
            inlineData: { 
              data: base64Product.split(',')[1], 
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

    for (const part of response.candidates?.[0]?.content.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Falha ao gerar opção de imagem");
  };

  return Promise.all([
    generateOption(variations[0]),
    generateOption(variations[1]),
    generateOption(variations[2])
  ]);
};
