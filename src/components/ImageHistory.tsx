import React from 'react';
import { GeneratedImage } from '../types';

interface ImageHistoryProps {
  images: GeneratedImage[];
}

const ImageHistory: React.FC<ImageHistoryProps> = ({ images }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">History</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="border rounded-lg p-4">
            <img src={image.url} alt={image.prompt} className="w-full h-48 object-cover mb-2 rounded" />
            <p className="text-xs font-medium text-gray-700 mb-1 line-clamp-2">Prompt: {image.prompt}</p>
            <p className="text-xs text-gray-500">
              Settings: {image.settings.model}, {image.settings.steps} steps, {image.settings.width}x{image.settings.height}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Generated: {new Date(image.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageHistory;