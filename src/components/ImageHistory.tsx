import React from 'react';
import { Trash2 } from 'lucide-react';
import { GeneratedImage } from '../types';

interface ImageHistoryProps {
  images: GeneratedImage[];
  onClearHistory: () => void;
  onImageClick: (image: GeneratedImage) => void;
}

const ImageHistory: React.FC<ImageHistoryProps> = ({
  images,
  onClearHistory,
  onImageClick,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">History</h2>
        <button
          onClick={onClearHistory}
          className="text-red-500 hover:text-red-700 flex items-center"
        >
          <Trash2 size={20} className="mr-1" />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
        {images.map((image, index) => (
          <div
            key={index}
            className="cursor-pointer"
            onClick={() => onImageClick(image)}
          >
            <img
              src={`data:image/png;base64,${image.imageData}`}
              alt={image.prompt}
              className="w-full h-32 object-cover mb-1"
            />
            <p className="text-xs text-gray-600 truncate">
              <strong>Prompt: </strong>
              {image.prompt}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(image.timestamp).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageHistory;