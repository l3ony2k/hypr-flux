import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface InfoModalProps {
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
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
      <div ref={modalRef} className="bg-white max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">About Hypr Image</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:bg-gray-200 p-2"
          >
            <X size={24} />
          </button>
        </div>
        <div className="prose text-gray-700">
          <p className="mb-2">
            Welcome to Hypr Image - The AI Image Generation Playground for
            Hyprlab.io!
          </p>
          <p className="mb-2">
            This platform provides access to cutting-edge AI image models,
            allowing you to:
          </p>
          <ul className="list-disc list-inside mx-4 mb-2">
            <li>Generate high-quality images using various AI models</li>
            <li>Customize generation parameters for optimal results</li>
            <li>Save and manage your generated images</li>
            <li>Download your creations in high resolution</li>
          </ul>
          <p className="mb-2">
            To get started, simply 1) enter your API key, 2) choose a model, 3)
            provide a prompt, and 4) adjust the settings to your liking or just
            leave it to defaults, then 4) hit the generate button. Your
            generated images will be saved automatically in your history.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
