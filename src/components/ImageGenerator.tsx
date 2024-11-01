import React, { useState, useEffect } from 'react';
import { Settings, Loader } from 'lucide-react';
import { GeneratedImage } from '../types';

interface ImageGeneratorProps {
  onImageGenerated: (image: GeneratedImage) => void;
}

const SETTINGS_KEY = 'hyprFluxSettings';

const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  onImageGenerated,
}) => {
  const [apiKey, setApiKey] = useState(
    localStorage.getItem('hyprFluxApiKey') || import.meta.env.VITE_HYPRLAB_API_KEY || ''
  );
  const [prompt, setPrompt] = useState('');
  const [steps, setSteps] = useState(() => 
    Number(localStorage.getItem('hyprFluxSteps')) || 20
  );
  const [height, setHeight] = useState(() =>
    Number(localStorage.getItem('hyprFluxHeight')) || 1024
  );
  const [width, setWidth] = useState(() =>
    Number(localStorage.getItem('hyprFluxWidth')) || 1024
  );
  const [model, setModel] = useState(
    localStorage.getItem('hyprFluxModel') || 'flux-1.1-pro'
  );
  const [customModel, setCustomModel] = useState(
    localStorage.getItem('hyprFluxCustomModel') || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const models = ['custom', ...(import.meta.env.VITE_HYPRLAB_MODELS || '').split(',')];

  // Cache settings when they change
  useEffect(() => {
    localStorage.setItem('hyprFluxApiKey', apiKey);
    localStorage.setItem('hyprFluxSteps', steps.toString());
    localStorage.setItem('hyprFluxHeight', height.toString());
    localStorage.setItem('hyprFluxWidth', width.toString());
    localStorage.setItem('hyprFluxModel', model);
    localStorage.setItem('hyprFluxCustomModel', customModel);
  }, [apiKey, steps, height, width, model, customModel]);

  const loadSettings = (settings: GeneratedImage['settings']) => {
    setModel(settings.model);
    setSteps(settings.steps);
    setHeight(settings.height);
    setWidth(settings.width);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        'https://api.hyprlab.io/v1/images/generations',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model === 'custom' ? customModel : model,
            prompt,
            steps,
            height,
            width,
            response_format: 'b64_json',
            output_format: 'png',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate image');
      }

      const data = await response.json();
      const newImage: GeneratedImage = {
        imageData: data.data[0].b64_json,
        prompt,
        settings: { 
          model: model === 'custom' ? customModel : model, 
          steps, 
          height, 
          width 
        },
        timestamp: new Date().toISOString(),
      };

      onImageGenerated(newImage);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error generating image. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-2 flex items-center">
        Image Settings
      </h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-2 flex-grow flex flex-col"
      >
        <div>
          <label
            htmlFor="apiKey"
            className="block text-sm font-medium text-gray-700 mt-2"
          >
            API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
            className="block w-full border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            placeholder="Enter your HyprLab API key"
          />
        </div>
        <div>
          <label
            htmlFor="model"
            className="block text-sm font-medium text-gray-700"
          >
            Model
          </label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="block w-full border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          >
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          {model === 'custom' && (
            <input
              type="text"
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              required={model === 'custom'}
              className="mt-2 block w-full border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="Enter custom model name"
            />
          )}
        </div>
        <div className="flex-grow flex flex-col">
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-gray-700"
          >
            Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
            className="block w-full flex-grow border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            placeholder="Describe the image you want to generate..."
          />
        </div>
        <div className="mt-2">
          <label
            htmlFor="steps"
            className="block text-sm font-medium text-gray-700"
          >
            Steps: {steps}
          </label>
          <input
            type="range"
            id="steps"
            value={steps}
            onChange={(e) => setSteps(Number(e.target.value))}
            min="1"
            max="50"
            className="block w-full"
          />
        </div>
        <div>
          <label
            htmlFor="height"
            className="block text-sm font-medium text-gray-700"
          >
            Height: {height}px
          </label>
          <input
            type="range"
            id="height"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            min="256"
            max="1440"
            step="32"
            className="block w-full"
          />
        </div>
        <div>
          <label
            htmlFor="width"
            className="block text-sm font-medium text-gray-700"
          >
            Width: {width}px
          </label>
          <input
            type="range"
            id="width"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            min="256"
            max="1440"
            step="32"
            className="block w-full mb-4"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || (model === 'custom' && !customModel)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold p-2 focus:outline-none focus:shadow-outline flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader className="animate-spin mr-2" />
              Generating...
            </>
          ) : (
            'Generate Image'
          )}
        </button>
      </form>
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
};

// Export both the component and the loadSettings function
export default ImageGenerator;
export type { ImageGeneratorProps };
// Add this line to export the loadSettings functionality
export { type LoadSettingsFunction };
type LoadSettingsFunction = (settings: GeneratedImage['settings']) => void;