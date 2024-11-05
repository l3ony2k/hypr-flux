export interface GeneratedImage {
  imageData: string;  // base64 encoded image data
  prompt: string;
  revised_prompt?: string; // Optional revised prompt from DALL-E
  settings: {
    model: string;
    steps?: number;
    height?: number;
    width?: number;
    size?: string;
    quality?: string;
    style?: string;
    n?: number;
  };
  timestamp: string;
}