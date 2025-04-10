import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Settings, Loader } from "lucide-react";
import { GeneratedImage } from "../types";
import ModelTabs from "./ModelTabs";
import ModelForm from "./ModelForm";
import { modelFamilies, modelValidations } from "../config/models";

interface ImageGeneratorProps {
  onImageGenerated: (image: GeneratedImage) => void;
}

export interface ImageGeneratorRef {
  loadSettings: (settings: GeneratedImage["settings"]) => void;
}

const ImageGenerator = forwardRef<ImageGeneratorRef, ImageGeneratorProps>(
  ({ onImageGenerated }, ref) => {
    const [apiKey, setApiKey] = useState(
      localStorage.getItem("hyprFluxApiKey") || "",
    );
    const [selectedModel, setSelectedModel] = useState("flux-1.1-pro");
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Load saved form values from localStorage
    useEffect(() => {
      const savedValues = localStorage.getItem(`hyprFlux_${selectedModel}`);
      if (savedValues) {
        setFormValues(JSON.parse(savedValues));
      } else {
        // Initialize with default values from model config
        const selectedConfig = modelFamilies.find((family) =>
          family.models.some((model) => model.id === selectedModel),
        );
        const modelConfig = selectedConfig?.models.find(
          (model) => model.id === selectedModel,
        );
        const defaults: Record<string, any> = {};
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
        JSON.stringify(formValues),
      );
    }, [formValues, selectedModel]);

    // Save API key to localStorage
    useEffect(() => {
      localStorage.setItem("hyprFluxApiKey", apiKey);
    }, [apiKey]);

    useImperativeHandle(ref, () => ({
      loadSettings: (settings: GeneratedImage["settings"]) => {
        const selectedConfig = modelFamilies.find((family) =>
          family.models.some((model) => model.id === settings.model),
        );
        const modelConfig = selectedConfig?.models.find(
          (model) => model.id === settings.model,
        );
        if (modelConfig) {
          setSelectedModel(settings.model);
          setFormValues(settings);
        }
      },
    }));

    const handleModelSelect = (modelId: string) => {
      setSelectedModel(modelId);
      // Reset form values when model changes
      setFormValues({ model: modelId });
    };

    const handleFormChange = (name: string, value: any) => {
      setFormValues((prev) => {
        const newValues = { ...prev, [name]: value };
        // If model changed, clear values that aren't applicable to the new model
        if (name === "model") {
          const modelFields = modelFamilies
            .flatMap((family) => family.models)
            .find((model) =>
              model.fields.some(
                (field) =>
                  field.type === "select" &&
                  field.name === "model" &&
                  field.options?.includes(value),
              ),
            )
            ?.fields.filter(
              (field) => !field.showFor || field.showFor.includes(value),
            )
            .map((field) => field.name);

          Object.keys(newValues).forEach((key) => {
            if (!modelFields?.includes(key) && key !== "model") {
              delete newValues[key];
            }
          });
        }
        return newValues;
      });
    };

    const getValidRequestBody = (values: Record<string, any>) => {
      const currentModel = values.model || selectedModel;

      // Find the model configuration
      const selectedFamily = modelFamilies.find((family) =>
        family.models.some((model) =>
          model.fields.some(
            (field) =>
              field.type === "select" &&
              field.name === "model" &&
              field.options?.includes(currentModel),
          ),
        ),
      );

      const modelConfig = selectedFamily?.models.find((model) =>
        model.fields.some(
          (field) =>
            field.type === "select" &&
            field.name === "model" &&
            field.options?.includes(currentModel),
        ),
      );

      // Get only fields applicable to this model
      const applicableFields =
        modelConfig?.fields.filter(
          (field) =>
            !field.showFor || // Include global fields for the model family
            field.showFor.includes(currentModel), // Include fields specifically for this model
        ) || [];

      // Get field names that should be included
      const requiredFieldNames = applicableFields.map((field) => field.name);

      // Add always required fields
      requiredFieldNames.push("model", "prompt");

      // Create an object with only the required fields that have values
      const filteredValues = Object.entries(values).reduce(
        (acc, [key, value]) => {
          // Only include if it's a required field and has a value
          if (
            requiredFieldNames.includes(key) &&
            value !== undefined &&
            value !== null &&
            value !== ""
          ) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>,
      );

      // Special handling for DALL-E 3 models: remove style field if set to 'none'
      if (
        (currentModel === "dall-e-3" || currentModel === "azure/dall-e-3") &&
        filteredValues.style === "none"
      ) {
        delete filteredValues.style;
      }

      // Create the final request object
      const result = {
        ...filteredValues,
        model: currentModel,
        response_format: "b64_json",
        output_format: "png",
      };

      // Mark fields with binary data for special handling in storage
      // but keep them for the API request
      if (result.control_image) {
        result.has_control_image = true;
      }

      if (result.image_prompt) {
        result.has_image_prompt = true;
      }

      return result;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError("");

      try {
        const requestBody = getValidRequestBody(formValues);

        // Validate request body against model schema
        const modelSchema = modelValidations[requestBody.model];
        if (modelSchema) {
          modelSchema.parse(requestBody);
        }

        const apiEndpoint = "https://api.hyprlab.io/v1/images/generations";

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        };

        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers,
          body: JSON.stringify({
            ...requestBody,
            response_format: "b64_json",
            output_format: "png",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || // {error: {message: "..."}}
              errorData.message || // {message: "..."}
              errorData.error || // {error: "..."}
              response.statusText || // HTTP status text if all else fails
              "Failed to generate image, no error msg caught, plz check response manually.",
          );
        }

        const data = await response.json();

        // For API request, we sent the full requestBody, but for storage
        // we need to create a clean version that doesn't include any large binary data
        const storageSettings = { ...requestBody };

        // For all models: Replace binary data with placeholders
        if (storageSettings.control_image) {
          delete storageSettings.control_image;
          storageSettings.control_image_file = "control_image.temp";
        }

        if (storageSettings.image_prompt) {
          delete storageSettings.image_prompt;
          storageSettings.image_prompt_file = "image_prompt.temp";
        }

        // Remove flags as we use placeholders instead
        delete storageSettings.has_control_image;
        delete storageSettings.has_image_prompt;

        const newImage: GeneratedImage = {
          imageData: data.data[0].b64_json,
          prompt: formValues.prompt,
          revised_prompt: data.data[0].revised_prompt,
          settings: storageSettings,
          timestamp: new Date().toISOString(),
        };

        onImageGenerated(newImage);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error generating image. Please try again.",
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
          selectedModel={formValues.model || selectedModel}
          onModelSelect={handleModelSelect}
        />
        <form
          onSubmit={handleSubmit}
          className="space-y-2 flex-grow flex flex-col mt-2"
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
              placeholder="Enter your API key"
            />
          </div>
          <div className="flex-grow">
            <ModelForm
              modelId={formValues.model || selectedModel}
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
              "Generate Image"
            )}
          </button>
        </form>
        {error && <p className="mt-2 text-red-500">{error}</p>}
      </div>
    );
  },
);

ImageGenerator.displayName = "ImageGenerator";

export default ImageGenerator;
