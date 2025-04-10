import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadProps {
  onFileSelect: (base64: string) => void;
  value?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, value }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          const base64Data = base64.split(",")[1];
          onFileSelect(base64Data);
          setPreview(base64);
        };
        reader.readAsDataURL(file);
      }
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-500"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the image here...</p>
        ) : (
          <p>Drag & drop an image here, or click to select</p>
        )}
      </div>
      {(preview || value) && (
        <div className="mt-2">
          <img
            src={preview || (value ? `data:image/png;base64,${value}` : "")}
            alt="Preview"
            className="max-h-32 mx-auto"
          />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
