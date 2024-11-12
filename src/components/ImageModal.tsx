import React, { useEffect, useRef } from 'react';
import { X, ImageDown } from 'lucide-react';
import { GeneratedImage } from '../types';
import { generateUniqueFileName } from '../utils/fileUtils';

interface ImageModalProps {
  image: GeneratedImage;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => {
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

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${image.imageData}`;
    link.download = generateUniqueFileName(image.prompt, image.timestamp);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSettingValue = (key: string, value: any) => {
    if (key === 'model') return value;
    if (key === 'prompt') return value;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.join(', ');
    return JSON.stringify(value);
  };

  const getSettingLabel = (key: string): string => {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-2 border-b bg-white sticky top-0 z-50">
          <h2 className="text-2xl font-bold px-4">Image Details</h2>
          <div className="flex p-2">
            <button
              onClick={handleDownload}
              className="text-gray-500 hover:bg-gray-200 p-2"
              title="Download image"
            >
              <ImageDown size={24} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:bg-gray-200 p-2"
              title="Close"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        <img
          src={`data:image/png;base64,${image.imageData}`}
          alt={image.prompt}
          className="w-full h-auto object-contain mb-4"
        />
        <div className="space-y-2">
          <table className="min-w-full table-auto border-collapse bg-white">
            <tbody>
              <tr className="border-b">
                <td className="p-2 align-top font-semibold bg-gray-100 w-1/4">
                  Prompt:
                </td>
                <td className="p-2 align-top">{image.prompt}</td>
              </tr>
              {image.revised_prompt && (
                <tr className="border-b">
                  <td className="p-2 align-top font-semibold bg-gray-100 w-1/4">
                    Revised Prompt:
                  </td>
                  <td className="p-2 align-top">{image.revised_prompt}</td>
                </tr>
              )}
              {Object.entries(image.settings)
                .filter(([key]) => key !== 'prompt')
                .map(([key, value]) => (
                  <tr key={key} className="border-b">
                    <td className="p-2 align-top font-semibold bg-gray-100 w-1/4">
                      {getSettingLabel(key)}:
                    </td>
                    <td className="p-2 align-top">
                      {renderSettingValue(key, value)}
                    </td>
                  </tr>
                ))}
              <tr className="border-b">
                <td className="p-2 align-top font-semibold bg-gray-100 w-1/4">
                  Generated:
                </td>
                <td className="p-2 align-top">
                  {new Date(image.timestamp).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
