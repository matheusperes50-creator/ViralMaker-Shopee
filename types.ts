
export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  GENERATING_VIDEO = 'GENERATING_VIDEO',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

declare global {
  interface Window {
    process: {
      env: {
        API_KEY: string;
      }
    }
  }
}

export {};
