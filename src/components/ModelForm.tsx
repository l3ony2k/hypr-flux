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

  const renderField = (field: Field) => {
    const value = values[field.name] ?? field.default ?? '';

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.name}
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
            id={field.name}
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
          <div className="flex items-center gap-4">
            <input
              type="range"
              id={field.name}
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

      default:
        return (
          <input
            type={field.type}
            id={field.name}
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
      {modelConfig.fields.map((field) => (
        <div key={field.name}>
          <label
            htmlFor={field.name}
            className="block text-sm font-medium text-gray-700"
          >
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </label>
          {renderField(field)}
        </div>
      ))}
    </div>
  );
};

export default ModelForm;
