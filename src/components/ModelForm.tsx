import React, { useEffect } from 'react';
import { modelFamilies, type Field } from '../config/models';

interface ModelFormProps {
  modelId: string;
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

const ModelForm: React.FC<ModelFormProps> = ({ modelId, values, onChange }) => {
  const modelConfig = modelFamilies
    .flatMap((family) => family.models)
    .find(
      (model) =>
        model.id === modelId ||
        model.fields.some(
          (field) =>
            field.type === 'select' &&
            field.name === 'model' &&
            field.options?.includes(modelId)
        )
    );

  if (!modelConfig) return null;

  // Initialize values with defaults on load or model change
  useEffect(() => {
    modelConfig.fields.forEach((field) => {
      if (field.default !== undefined && values[field.name] === undefined) {
        onChange(field.name, field.default);
      }
    });
  }, [modelConfig, onChange, values]);

  // Filter fields based on the selected model version
  const getVisibleFields = () => {
    return modelConfig.fields.filter((field) => {
      // If showFor is not defined, show the field for all models
      if (!field.showFor) return true;
      // If showFor is defined, only show for specified models
      return field.showFor.includes(values.model || modelId);
    });
  };

  const renderField = (field: Field) => {
    const value = values[field.name] ?? field.default ?? '';

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={`${field.name}-${field.showFor?.join('-') || 'all'}`}
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            required={field.required}
            className="block w-full flex-grow border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        );

      case 'select':
        return (
          <select
            id={`${field.name}-${field.showFor?.join('-') || 'all'}`}
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            required={field.required}
            className="block w-full border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          >
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'range':
        return (
          <div className="flex items-center gap-2">
            <input
              type="range"
              id={`${field.name}-${field.showFor?.join('-') || 'all'}`}
              value={value}
              onChange={(e) => onChange(field.name, Number(e.target.value))}
              min={field.min}
              max={field.max}
              step={field.step}
              className="flex-grow"
            />
            <span className="text-sm text-gray-500 w-12 text-right">
              {value}
            </span>
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <label
              htmlFor={`${field.name}-${field.showFor?.join('-') || 'all'}`}
              className="text-sm font-medium text-gray-700"
            >
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="checkbox"
              id={`${field.name}-${field.showFor?.join('-') || 'all'}`}
              checked={value}
              onChange={(e) => onChange(field.name, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            id={`${field.name}-${field.showFor?.join('-') || 'all'}`}
            value={value}
            onChange={(e) => onChange(field.name, Number(e.target.value))}
            min={field.min}
            max={field.max}
            required={field.required}
            className="block w-full border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        );

      default:
        return (
          <input
            type={field.type}
            id={`${field.name}-${field.showFor?.join('-') || 'all'}`}
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            required={field.required}
            className="block w-full border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {getVisibleFields().map((field) => (
        <div key={`${field.name}-${field.showFor?.join('-') || 'all'}`}>
          {field.type !== 'checkbox' && (
            <label
              htmlFor={`${field.name}-${field.showFor?.join('-') || 'all'}`}
              className="block text-sm font-medium text-gray-700"
            >
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
          )}
          {renderField(field)}
        </div>
      ))}
    </div>
  );
};

export default ModelForm;
