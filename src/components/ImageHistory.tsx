import React, { useState } from 'react';
import { Trash2, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { GeneratedImage } from '../types';
import { generateUniqueFileName } from '../utils/fileUtils';

interface ImageHistoryProps {
  images: GeneratedImage[];
  onClearHistory: () => void;
  onImageClick: (image: GeneratedImage) => void;
}

const IMAGES_PER_PAGE = 60;

const ImageHistory: React.FC<ImageHistoryProps> = ({
  images,
  onClearHistory,
  onImageClick,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(images.length / IMAGES_PER_PAGE);

  const handleClearClick = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all images? This action cannot be undone.'
      )
    ) {
      onClearHistory();
    }
  };

  const handleDownload = (e: React.MouseEvent, image: GeneratedImage) => {
    e.stopPropagation(); // Prevent opening the modal
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${image.imageData}`;
    link.download = generateUniqueFileName(image.prompt, image.timestamp);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
  const endIndex = startIndex + IMAGES_PER_PAGE;
  const currentImages = images.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">History</h2>
        <div className="flex items-center gap-4">
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
          <button
            onClick={handleClearClick}
            className="text-red-500 hover:text-red-700 flex items-center"
            title="Clear history"
          >
            <Trash2 size={20} className="mr-1" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 xl:grid-cols-10 gap-2">
        {currentImages.map((image) => (
          <div
            key={image.timestamp}
            className="group relative cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onImageClick(image)}
          >
            <img
              src={`data:image/png;base64,${image.imageData}`}
              alt={image.prompt}
              className="w-full h-32 object-cover mb-1"
            />
            <button
              onClick={(e) => handleDownload(e, image)}
              className="absolute top-2 right-2 p-1 bg-white bg-opacity-75 hover:bg-opacity-100 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Download image"
            >
              <Download size={16} />
            </button>
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
      {images.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No images in history
        </div>
      )}
    </div>
  );
};

export default ImageHistory;
