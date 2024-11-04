import React from 'react';
import { modelConfigs, Field } from '../config/models';

interface ModelFormProps {
  modelId: string;
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

const ModelForm: React.FC<ModelFormProps> = ({ modelId, values, onChange }) => {
  const config = modelConfigs[modelId];
  if (!config) return null;

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
          <div className="space-y-1">
            <input
              type="range"
              id={field.name}
              value={value}
              onChange={(e) => onChange(field.name, Number(e.target.value))}
              min={field.min}
              max={field.max}
              step={field.step}
              className="block w-full"
            />
            <div className="text-sm text-gray-500">
              Current value: {value}
            </div>
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
    <div className="space-y-4">
      {config.fields.map((field) => (
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