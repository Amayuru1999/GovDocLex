import React, { useRef, useState } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface FileUploadProps {
  onFileSelect?: (files: File[]) => void;
  onUpload?: (files: File[]) => Promise<void>;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

interface FileWithStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onUpload,
  accept = '.pdf,.doc,.docx,.txt',
  multiple = true,
  maxSize = 10, // 10MB default
  maxFiles = 5,
  disabled = false,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileWithStatus[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB limit`;
    }

    // Check file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;
    
    const isValidType = allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type;
      }
      // Handle MIME type patterns with wildcards
      if (type.includes('*')) {
        const pattern = type.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(mimeType);
      }
      return mimeType === type;
    });

    if (!isValidType) {
      return `File type not supported. Allowed types: ${accept}`;
    }

    return null;
  };

  const handleFileSelection = (files: FileList | null) => {
    if (!files) return;

    const newFiles: FileWithStatus[] = [];
    const currentFileCount = selectedFiles.length;

    for (let i = 0; i < files.length && newFiles.length + currentFileCount < maxFiles; i++) {
      const file = files[i];
      const error = validateFile(file);
      
      // Check for duplicates
      const isDuplicate = selectedFiles.some(f => 
        f.file.name === file.name && f.file.size === file.size
      );

      if (isDuplicate) {
        continue;
      }

      newFiles.push({
        file,
        status: error ? 'error' : 'pending',
        error: error || undefined,
      });
    }

    const updatedFiles = [...selectedFiles, ...newFiles];
    setSelectedFiles(updatedFiles);
    
    if (onFileSelect) {
      onFileSelect(updatedFiles.map(f => f.file));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFileSelection(files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(e.target.files);
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    
    if (onFileSelect) {
      onFileSelect(updatedFiles.map(f => f.file));
    }
  };

  const handleUpload = async () => {
    if (!onUpload || selectedFiles.length === 0) return;

    const validFiles = selectedFiles.filter(f => f.status !== 'error');
    if (validFiles.length === 0) return;

    setIsUploading(true);

    // Update status to uploading
    setSelectedFiles(files => 
      files.map(f => f.status === 'pending' ? { ...f, status: 'uploading' as const } : f)
    );

    try {
      await onUpload(validFiles.map(f => f.file));
      
      // Update status to success
      setSelectedFiles(files => 
        files.map(f => f.status === 'uploading' ? { ...f, status: 'success' as const } : f)
      );
    } catch (error) {
      // Update status to error
      setSelectedFiles(files => 
        files.map(f => f.status === 'uploading' ? { 
          ...f, 
          status: 'error' as const, 
          error: error instanceof Error ? error.message : 'Upload failed'
        } : f)
      );
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: FileWithStatus['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'uploading':
        return <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragging 
            ? 'border-[#2EF2B8] bg-[#2EF2B8]/5' 
            : 'border-gray-600 hover:border-gray-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium mb-2">
          {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
        </p>
        <p className="text-sm text-gray-400">
          Supported formats: {accept} • Max {maxSize}MB per file • Up to {maxFiles} files
        </p>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Selected Files ({selectedFiles.length})</h4>
          <div className="space-y-2">
            {selectedFiles.map((fileWithStatus, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-[#0D1520]/50 border border-gray-600 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getStatusIcon(fileWithStatus.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {fileWithStatus.file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(fileWithStatus.file.size)}
                    </p>
                    {fileWithStatus.error && (
                      <p className="text-xs text-red-400 mt-1">
                        {fileWithStatus.error}
                      </p>
                    )}
                  </div>
                </div>
                
                {fileWithStatus.status !== 'uploading' && (
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="text-gray-400 hover:text-red-400 p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && onUpload && (
        <div className="flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={
              isUploading || 
              selectedFiles.length === 0 || 
              selectedFiles.every(f => f.status === 'error' || f.status === 'success')
            }
            className="bg-[#2EF2B8] hover:bg-[#2EF2B8]/80 text-black"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-black border-t-transparent mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};