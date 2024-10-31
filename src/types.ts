export interface GeneratedImage {
  imageData: string;  // base64 encoded image data
  prompt: string;
  settings: {
    model: string;
    steps: number;
    height: number;
    width: number;
  };
  timestamp: string;
}