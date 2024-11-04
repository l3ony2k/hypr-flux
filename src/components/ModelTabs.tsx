import React from 'react';
import { modelFamilies } from '../config/models';

interface ModelTabsProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
}

const ModelTabs: React.FC<ModelTabsProps> = ({
  selectedModel,
  onModelSelect,
}) => {
  // Find the family of the selected model
  const selectedFamily = modelFamilies.find((family) =>
    family.models.some(
      (model) =>
        model.fields.some(
          (field) =>
            field.type === 'select' &&
            field.name === 'model' &&
            field.options?.includes(selectedModel)
        ) || model.id === selectedModel
    )
  );

  return (
    <div className="border-b border-gray-200">
      <nav
        className="-mb-px flex space-x-2 overflow-x-auto"
        aria-label="Model families"
      >
        {modelFamilies.map((family) => {
          const isSelected = family.id === selectedFamily?.id;
          const defaultModel =
            family.models[0].fields.find((f) => f.name === 'model')?.default ||
            family.models[0].id;

          return (
            <button
              key={family.id}
              onClick={() => onModelSelect(defaultModel)}
              className={`
                whitespace-nowrap py-1 px-2 border-b-2 text-sm
                ${
                  isSelected
                    ? 'border-blue-500 text-blue-600 font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              aria-current={isSelected ? 'page' : undefined}
            >
              {family.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default ModelTabs;
