
import { GoogleGenAI } from "@google/genai";

export interface StagingConfig {
  environment: string;
  lighting: string;
  style: string;
}

/**
 * Gera imagens de produtos ambientadas usando gemini-2.5-flash-image.
 * Este modelo utiliza a chave do ambiente e não exige o diálogo de seleção.
 */
export const generateStagedImages = async (base64Product: string, config: StagingConfig): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isAuto = config.environment.toLowerCase() === 'automático';

  const variations = [
    "Tomada ao nível dos olhos, composição centralizada, sombras suaves.",
    "Ângulo levemente superior, produto levemente fora do centro, iluminação dramática.",
    "Foco macro close-up, profundidade de campo rasa, reflexos de iluminação ambiente quentes."
  ];

  const generateOption = async (variation: string) => {
    const prompt = `
      INSTRUCTION: Pegue o produto da imagem fornecida e coloque-o em um NOVO ambiente.
      ${isAuto ? 'ANÁLISE DE AMBIENTE: Identifique o produto e coloque-o no ambiente comercial profissional mais adequado para esta categoria específica (ex: se for beleza, banheiro de mármore; se tecnologia, mesa moderna; se comida, cozinha limpa).' : `AMBIENTE: ${config.environment}.`}
      ESTILO: ${config.style}, fotografia comercial de alto padrão, ultra-realista, qualidade de estúdio profissional.
      ILUMINAÇÃO: ${config.lighting}, cinematográfica.
      PERSPECTIVA: ${variation}
      
      REGRAS CRÍTICAS:
      1. O produto da imagem original deve ser o foco central e parecer exatamente como fornecido.
      2. INTEGRAÇÃO: Garanta que o produto esteja perfeitamente integrado à superfície. Adicione sombras de contato realistas e reflexos do ambiente.
      3. COMPOSIÇÃO: Use profundidade de campo profissional (fundo bokeh).
      4. SEM FLUTUAR: O produto deve parecer firmemente colocado sobre a superfície.
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
