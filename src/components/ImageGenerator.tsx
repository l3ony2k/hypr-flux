import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Settings, Loader } from 'lucide-react';
import { GeneratedImage } from '../types';
import ModelTabs from './ModelTabs';
import ModelForm from './ModelForm';
import { modelFamilies, modelValidations } from '../config/models';

interface ImageGeneratorProps {
  onImageGenerated: (image: GeneratedImage) => void;
}

export interface ImageGeneratorRef {
  loadSettings: (settings: GeneratedImage['settings']) => void;
}

const ImageGenerator = forwardRef<ImageGeneratorRef, ImageGeneratorProps>(
  ({ onImageGenerated }, ref) => {
    const [apiKey, setApiKey] = useState(
      localStorage.getItem('hyprFluxApiKey') || ''
    );
    const [selectedModel, setSelectedModel] = useState('flux-1.1-pro');
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Load saved form values from localStorage
    useEffect(() => {
      const savedValues = localStorage.getItem(`hyprFlux_${selectedModel}`);
      if (savedValues) {
        setFormValues(JSON.parse(savedValues));
      } else {
        // Initialize with default values from model config
        const defaults: Record<string, any> = {};
        const selectedConfig = modelFamilies.find((family) =>
          family.models.some((model) => model.id === selectedModel)
        );
        const modelConfig = selectedConfig?.models.find(
          (model) => model.id === selectedModel
        );
        modelConfig?.fields.forEach((field) => {
          if (field.default !== undefined) {
            defaults[field.name] = field.default;
          }
        });
        setFormValues(defaults);
      }
    }, [selectedModel]);

    // Save form values to localStorage when they change
    useEffect(() => {
      localStorage.setItem(
        `hyprFlux_${selectedModel}`,
        JSON.stringify(formValues)
      );
    }, [formValues, selectedModel]);

    // Save API key to localStorage
    useEffect(() => {
      localStorage.setItem('hyprFluxApiKey', apiKey);
    }, [apiKey]);

    useImperativeHandle(ref, () => ({
      loadSettings: (settings: GeneratedImage['settings']) => {
        const selectedConfig = modelFamilies.find((family) =>
          family.models.some((model) => model.id === settings.model)
        );
        const modelConfig = selectedConfig?.models.find(
          (model) => model.id === settings.model
        );
        if (modelConfig) {
          setSelectedModel(settings.model);
          setFormValues(settings);
        }
      },
    }));

    const handleModelSelect = (modelId: string) => {
      setSelectedModel(modelId);
    };

    const handleFormChange = (name: string, value: any) => {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');

      try {
        const requestBody = {
          ...formValues,
          model: selectedModel,
          response_format: 'b64_json',
          output_format: 'png',
        };

        // Validate request body against model schema
        const modelSchema = modelValidations[selectedModel];
        if (modelSchema) {
          modelSchema.parse(requestBody);
        }

        const response = await fetch(
          'https://api.hyprlab.io/v1/images/generations',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to generate image');
        }

        const data = await response.json();
        const newImage: GeneratedImage = {
          imageData: data.data[0].b64_json,
          prompt: formValues.prompt,
          settings: {
            model: selectedModel,
            ...formValues,
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
        <ModelTabs
          selectedModel={selectedModel}
          onModelSelect={handleModelSelect}
        />
        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex-grow flex flex-col mt-4"
        >
          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-gray-700"
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
          <div className="flex-grow">
            <ModelForm
              modelId={selectedModel}
              values={formValues}
              onChange={handleFormChange}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
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
  }
);

ImageGenerator.displayName = 'ImageGenerator';

export default ImageGenerator;
