export interface GeneratedImage {
  url: string;
  prompt: string;
  settings: {
    model: string;
    steps: number;
    height: number;
    width: number;
  };
  timestamp: string;
}