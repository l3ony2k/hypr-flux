import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import ImageGenerator from './components/ImageGenerator';
import ImageHistory from './components/ImageHistory';
import ImageModal from './components/ImageModal';
import { GeneratedImage } from './types';
import { DatabaseService } from './services/databaseService';

const db = new DatabaseService();

function App() {
  const generatorRef = useRef<{ loadSettings: (settings: GeneratedImage['settings']) => void }>();
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      try {
        await db.init();
        const images = await db.loadImages();
        setGeneratedImages(images);
      } catch (error) {
        console.error('Failed to load images:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, []);

  const handleImageGenerated = async (newImage: GeneratedImage) => {
    try {
      await db.saveImage(newImage);
      setGeneratedImages((prevImages) => [newImage, ...prevImages]);
      setCurrentImage(newImage);
    } catch (error) {
      console.error('Failed to save generated image:', error);
    }
  };

  const handleClearHistory = async () => {
    try {
      await db.clearAll();
      setGeneratedImages([]);
      setCurrentImage(null);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  const handleImageClick = (image: GeneratedImage) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleLoadSettings = (settings: GeneratedImage['settings']) => {
    if (generatorRef.current?.loadSettings) {
      generatorRef.current.loadSettings(settings);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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
            <ImageGenerator 
              ref={generatorRef}
              onImageGenerated={handleImageGenerated} 
            />
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
                  {currentImage.settings.model}, {currentImage.settings.steps} steps,{' '}
                  {currentImage.settings.width}x{currentImage.settings.height}
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
        <ImageModal 
          image={selectedImage} 
          onClose={handleCloseModal}
          onLoadSettings={handleLoadSettings}
        />
      )}
    </div>
  );
}

export default App;