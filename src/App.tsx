import React, { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Moon, Sun, Info } from "lucide-react";
import ImageGenerator, { ImageGeneratorRef } from "./components/ImageGenerator";
import ImageHistory from "./components/ImageHistory";
import ImageModal from "./components/ImageModal";
import InfoModal from "./components/InfoModal";
import { GeneratedImage } from "./types";
import { DatabaseService } from "./services/databaseService";
import favicon from "/public/favicon.svg";

const db = new DatabaseService();

function App() {
  const generatorRef = useRef<ImageGeneratorRef>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Initialize darkMode based on the system preference
  const [darkMode, setDarkMode] = useState(() => {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  useEffect(() => {
    const loadImages = async () => {
      try {
        await db.init();
        const images = await db.loadImages();
        setGeneratedImages(images);
      } catch (error) {
        console.error("Failed to load images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, []);

  // Apply Dark Reader based on the darkMode state
  useEffect(() => {
    if (window.DarkReader) {
      if (darkMode) {
        window.DarkReader.enable({
          darkSchemeBackgroundColor: "#191919",
          darkSchemeTextColor: "#fafafa",
          scrollbarColor: "",
          selectionColor: "auto",
        });
      } else {
        window.DarkReader.disable();
      }
    }
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const handleImageGenerated = async (newImage: GeneratedImage) => {
    try {
      await db.saveImage(newImage);
      setGeneratedImages((prevImages) => [newImage, ...prevImages]);
      setCurrentImage(newImage);
    } catch (error) {
      console.error("Failed to save generated image:", error);
    }
  };

  const handleClearHistory = async () => {
    try {
      await db.clearAll();
      setGeneratedImages([]);
      setCurrentImage(null);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  const handleImageClick = (image: GeneratedImage) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleLoadSettings = (settings: GeneratedImage["settings"]) => {
    if (generatorRef.current) {
      // Create a clean copy of settings without any null/undefined values or binary data
      const cleanSettings = Object.entries(settings)
        .filter(([key, value]) => {
          // Skip null/undefined values
          if (value === null || value === undefined) return false;
          // Skip binary data fields like control_image
          if (key === "control_image") return false;
          // For has_control_image, we want to keep it but not send the actual image
          return true;
        })
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

      generatorRef.current.loadSettings(cleanSettings);
    }
  };

  const handleDeleteImage = async (timestamp: string) => {
    try {
      await db.deleteImage(timestamp);
      setGeneratedImages((prevImages) =>
        prevImages.filter((img) => img.timestamp !== timestamp),
      );
      if (currentImage?.timestamp === timestamp) {
        setCurrentImage(null);
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  const handleImportImages = async (images: GeneratedImage[]) => {
    try {
      await db.importImages(images);
      const updatedImages = await db.loadImages();
      setGeneratedImages(updatedImages);
    } catch (error) {
      console.error("Failed to import images:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="p-2 border-b flex justify-between items-center bg-white sticky top-0 z-50">
        <h1 className="text-3xl font-bold text-black flex items-center leading-none">
          <img src={favicon} alt="Favicon" className="h-6 w-6 mx-2" />
          <span className="flex items-center mb-1"> - Image Generation</span>
        </h1>
        <div>
          <button
            onClick={toggleDarkMode}
            className="px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
          >
            {darkMode ? <Sun /> : <Moon />}
          </button>
          <button
            onClick={() => setShowInfoModal(true)}
            className="px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
          >
            <Info />
          </button>
        </div>
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
                  style={{ maxHeight: "calc(100% - 4rem)" }}
                />
                <p className="mt-2 text-sm text-gray-600">
                  <strong>Prompt: </strong>
                  {currentImage.prompt}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  <strong>Settings: </strong>
                  {Object.entries(currentImage.settings)
                    .filter(([key]) => key !== "prompt")
                    .map(([key, value]) => {
                      // Special handling for placeholders
                      if (key === "control_image_file")
                        return `control_image: control_image.temp`;
                      if (key === "image_prompt_file")
                        return `image_prompt: image_prompt.temp`;
                      // Skip flags
                      if (
                        key === "has_control_image" ||
                        key === "has_image_prompt"
                      )
                        return null;
                      return `${key}: ${value}`;
                    })
                    .filter(Boolean) // Remove null entries
                    .join(", ")}
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
            onDeleteImage={handleDeleteImage}
            onImportImages={handleImportImages}
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
      {showInfoModal && <InfoModal onClose={() => setShowInfoModal(false)} />}
    </div>
  );
}

export default App;
