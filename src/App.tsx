import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import ImageGenerator from './components/ImageGenerator';
import ImageHistory from './components/ImageHistory';
import ImageModal from './components/ImageModal';
import { GeneratedImage } from './types';

function App() {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(
    null
  );

  useEffect(() => {
    const savedImages = localStorage.getItem('generatedImages');
    if (savedImages) {
      setGeneratedImages(JSON.parse(savedImages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('generatedImages', JSON.stringify(generatedImages));
  }, [generatedImages]);

  const handleImageGenerated = (newImage: GeneratedImage) => {
    setGeneratedImages((prevImages) => [newImage, ...prevImages]);
    setCurrentImage(newImage);
  };

  const handleClearHistory = () => {
    setGeneratedImages([]);
    localStorage.removeItem('generatedImages');
  };

  const handleImageClick = (image: GeneratedImage) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="p-4 border-b">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <ImageIcon className="mr-2" /> Hypr Flux
        </h1>
      </header>
      <main className="px-2 space-y-2 mt-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <section className="w-full sm:w-1/2 border p-2">
            <ImageGenerator onImageGenerated={handleImageGenerated} />
          </section>
          <section className="w-full sm:w-1/2 border p-2">
            <h2 className="text-2xl font-bold mb-2">Result</h2>
            {currentImage ? (
              <>
                <img
                  src={`data:image/png;base64,${currentImage.imageData}`}
                  alt={currentImage.prompt}
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: 'calc(100% - 4rem)' }}
                />
                <p className="mt-2 text-sm text-gray-600">
                  <strong>Prompt: </strong>
                  {currentImage.prompt}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  <strong>Settings: </strong>
                  {currentImage.settings.model}, {currentImage.settings.steps}{' '}
                  steps, {currentImage.settings.width}x
                  {currentImage.settings.height}
                </p>
              </>
            ) : (
              <div className="w-full h-[512px] bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">
                  <ImageIcon />
                </p>
              </div>
            )}
          </section>
        </div>
        <section className="border p-2">
          <ImageHistory
            images={generatedImages}
            onClearHistory={handleClearHistory}
            onImageClick={handleImageClick}
          />
        </section>
      </main>
      {selectedImage && (
        <ImageModal image={selectedImage} onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default App;