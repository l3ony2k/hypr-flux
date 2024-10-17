import React, { useState, useEffect } from 'react';
import { Settings, Image as ImageIcon } from 'lucide-react';
import ImageGenerator from './components/ImageGenerator';
import ImageHistory from './components/ImageHistory';
import { GeneratedImage } from './types';

function App() {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <ImageIcon className="mr-2" /> Pixo Image Generator
        </h1>
      </header>
      <main className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <section className="w-full lg:w-1/2">
            <ImageGenerator onImageGenerated={handleImageGenerated} />
          </section>
          <section className="w-full lg:w-1/2">
            <div className="bg-white p-6 rounded-lg shadow-md h-full">
              <h2 className="text-2xl font-bold mb-4">Result</h2>
              {currentImage ? (
                <>
                  <img
                    src={currentImage.url}
                    alt={currentImage.prompt}
                    className="w-full h-auto object-contain rounded-lg shadow-md"
                    style={{ maxHeight: 'calc(100% - 6rem)' }}
                  />
                  <p className="mt-2 text-sm text-gray-600">Prompt: {currentImage.prompt}</p>
                  <p className="text-xs text-gray-500">
                    Settings: {currentImage.settings.model}, {currentImage.settings.steps} steps, {currentImage.settings.width}x{currentImage.settings.height}
                  </p>
                </>
              ) : (
                <div className="w-full h-[512px] bg-gray-200 flex items-center justify-center rounded-lg">
                  <p className="text-gray-500">Generated image will appear here</p>
                </div>
              )}
            </div>
          </section>
        </div>
        <section>
          <ImageHistory images={generatedImages} />
        </section>
      </main>
    </div>
  );
}

export default App;