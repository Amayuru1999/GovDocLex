import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';
import { FileUpload } from '../ui/FileUpload';
import { Button } from '../ui/Button';
import { documentService } from '../../services/documentService';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  const handleFileSelect = () => {
    setUploadStatus('idle');
    setUploadMessage('');
  };

  const handleUpload = async (files: File[]) => {
    try {
      setUploadStatus('uploading');
      setUploadMessage('Uploading documents...');

      const response = await documentService.uploadDocuments(files);

      if (response.success) {
        setUploadStatus('success');
        setUploadMessage(
          `Successfully uploaded ${files.length} document${files.length > 1 ? 's' : ''}. ` +
          'Documents have been stored and are ready to use.'
        );
        
        // Clear files after successful upload
        setTimeout(() => {
          if (onUploadSuccess) {
            onUploadSuccess();
          }
        }, 2000);
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      setUploadStatus('error');
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload documents. Please try again.';
      setUploadMessage(errorMessage);
    }
  };

  const handleClose = () => {
    if (uploadStatus !== 'uploading') {
      setUploadStatus('idle');
      setUploadMessage('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-[#0D1520] border border-[#34495E]/40 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#34495E]/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#2EF2B8]/10 rounded-lg">
              <FileText className="w-6 h-6 text-[#2EF2B8]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Upload Documents</h2>
              <p className="text-sm text-gray-400">
                Add documents to your personal knowledge base
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={uploadStatus === 'uploading'}
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Upload Status Message */}
          {uploadMessage && (
            <div className={`mb-4 p-4 rounded-lg border ${
              uploadStatus === 'success' 
                ? 'bg-green-900/20 border-green-600/30 text-green-400'
                : uploadStatus === 'error'
                ? 'bg-red-900/20 border-red-600/30 text-red-400'
                : 'bg-blue-900/20 border-blue-600/30 text-blue-400'
            }`}>
              <div className="flex items-center space-x-2">
                {uploadStatus === 'uploading' && (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                )}
                <span>{uploadMessage}</span>
              </div>
            </div>
          )}

          {/* File Upload Component */}
          <FileUpload
            onFileSelect={handleFileSelect}
            onUpload={handleUpload}
            accept=".pdf,.doc,.docx,.txt"
            multiple={true}
            maxSize={10}
            maxFiles={5}
            disabled={uploadStatus === 'uploading'}
          />

          {/* Information */}
          {/* <div className="mt-6 p-4 bg-[#2EF2B8]/5 border border-[#2EF2B8]/20 rounded-lg">
            <h3 className="font-medium text-[#2EF2B8] mb-2">📋 Upload Guidelines</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Supported formats: PDF, DOC, DOCX, TXT</li>
              <li>• Maximum file size: 10MB per file</li>
              <li>• Up to 5 files can be uploaded at once</li>
              <li>• Documents will be processed and made searchable</li>
              <li>• Processing may take a few minutes for large documents</li>
            </ul>
          </div> */}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-[#34495E]/40">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={uploadStatus === 'uploading'}
            className="text-gray-400 hover:text-white"
          >
            {uploadStatus === 'success' ? 'Done' : 'Cancel'}
          </Button>
        </div>
      </div>
    </div>
  );
};