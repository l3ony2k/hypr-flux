import React, { useState, useRef } from 'react';
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  ImageDown,
} from 'lucide-react';
import { GeneratedImage } from '../types';
import { generateUniqueFileName } from '../utils/fileUtils';

interface ImageHistoryProps {
  images: GeneratedImage[];
  onClearHistory: () => void;
  onImageClick: (image: GeneratedImage) => void;
  onDeleteImage: (timestamp: string) => void;
  onImportImages: (images: GeneratedImage[]) => void;
}

const IMAGES_PER_PAGE = 60;

const ImageHistory: React.FC<ImageHistoryProps> = ({
  images,
  onClearHistory,
  onImageClick,
  onDeleteImage,
  onImportImages,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(images.length / IMAGES_PER_PAGE);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${image.imageData}`;
    link.download = generateUniqueFileName(image.prompt, image.timestamp);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (e: React.MouseEvent, timestamp: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this image?')) {
      onDeleteImage(timestamp);
    }
  };

  const handleExportHistory = () => {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      images: images,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hypr-flux-history-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate the imported data
      if (!data.version || !Array.isArray(data.images)) {
        throw new Error('Invalid import file format');
      }

      // Process and import the images
      onImportImages(data.images);

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import history. Please make sure the file is valid.');
    }
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
            onClick={handleExportHistory}
            className="text-gray-500 hover:text-gray-700 flex items-center"
            title="Export history"
          >
            <Upload size={20} />
          </button>
          <button
            onClick={handleImportClick}
            className="text-gray-500 hover:text-gray-700 flex items-center"
            title="Import history"
          >
            <Download size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            onClick={handleClearClick}
            className="text-red-500 hover:text-red-700 flex items-center mr-1"
            title="Clear history"
          >
            <Trash2 size={20} />
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
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                onClick={(e) => handleDownload(e, image)}
                className="p-1 bg-gray-200 bg-opacity-75 hover:bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Download image"
              >
                <ImageDown size={16} />
              </button>
              <button
                onClick={(e) => handleDelete(e, image.timestamp)}
                className="p-1 bg-gray-200 bg-opacity-75 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete image"
              >
                <Trash2 size={16} />
              </button>
            </div>
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
