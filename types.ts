
export interface ProductAnalysis {
  name: string;
  category: string;
  features: string[];
  suggestedHooks: string[];
  targetAudience: string;
}

export interface GeneratedContent {
  imageUrl?: string;
  videoUrl?: string;
  script?: string;
  analysis?: ProductAnalysis;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  GENERATING_VIDEO = 'GENERATING_VIDEO',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Fix: Removed readonly modifier to ensure identical modifiers with the environment's Window declaration
    aistudio: AIStudio;
  }
}
