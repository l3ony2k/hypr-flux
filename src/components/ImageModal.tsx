import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { GeneratedImage } from '../types';

interface ImageModalProps {
  image: GeneratedImage;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white p-4 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">Image Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <img src={image.url} alt={image.prompt} className="w-full h-auto object-contain mb-4" />
        <div className="space-y-2">
          <p><strong>Prompt:</strong> {image.prompt}</p>
          <p><strong>Model:</strong> {image.settings.model}</p>
          <p><strong>Steps:</strong> {image.settings.steps}</p>
          <p><strong>Dimensions:</strong> {image.settings.width}x{image.settings.height}</p>
          <p><strong>Generated:</strong> {new Date(image.timestamp).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;