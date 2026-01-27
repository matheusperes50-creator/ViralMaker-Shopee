export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

declare global {
  interface Window {
    process: {
      env: {
        API_KEY: string;
      };
      nextTick: (cb: () => void) => void;
    }
  }
}

export {};