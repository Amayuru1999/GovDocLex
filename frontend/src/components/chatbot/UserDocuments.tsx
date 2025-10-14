import React, { useState, useEffect } from 'react';
import { FileText, Trash2, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { documentService } from '../../services/documentService';

interface UserDocument {
  filename: string;
  originalName: string;
  uploadDate: string;
  size: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
}

interface UserDocumentsProps {
  className?: string;
}

export const UserDocuments: React.FC<UserDocumentsProps> = ({ className = '' }) => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
    
    // Set up polling for processing status updates
    const interval = setInterval(() => {
      loadDocuments();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await documentService.getUserDocuments();
      if (response.success && response.data) {
        setDocuments(response.data as UserDocument[]);
      }
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setDeletingDoc(filename);
      await documentService.deleteDocument(filename);
      setDocuments(docs => docs.filter(doc => doc.filename !== filename));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    } finally {
      setDeletingDoc(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: UserDocument['processingStatus']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: UserDocument['processingStatus']) => {
    switch (status) {
      case 'completed':
        return 'Ready for search';
      case 'failed':
        return 'Processing failed';
      case 'processing':
        return 'Processing...';
      default:
        return 'Pending processing';
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="w-6 h-6 animate-spin text-[#2EF2B8]" />
          <span className="ml-2">Loading documents...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Documents</h2>
        <p className="text-gray-400">
          Manage your uploaded documents. Completed documents are searchable in the chatbot.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-600/30 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {documents.length === 0 ? (
        <Card className="bg-[#0D1520]/50 border-[#34495E]/40">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <h3 className="text-lg font-medium mb-2">No documents uploaded</h3>
            <p className="text-gray-400">
              Upload your documents to make them searchable in the chatbot.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card 
              key={doc.filename} 
              className="bg-[#0D1520]/50 border-[#34495E]/40 hover:border-[#2EF2B8]/30 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-[#2EF2B8] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{doc.originalName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                        <span>{formatFileSize(doc.size)}</span>
                        <span>{formatDate(doc.uploadDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Status */}
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(doc.processingStatus)}
                      <span className="text-sm text-gray-400">
                        {getStatusText(doc.processingStatus)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(doc.filename)}
                        disabled={deletingDoc === doc.filename}
                        className="text-gray-400 hover:text-red-400 p-2"
                      >
                        {deletingDoc === doc.filename ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-[#2EF2B8]/5 border border-[#2EF2B8]/20 rounded-lg">
        <h3 className="font-medium text-[#2EF2B8] mb-2">📋 Document Status</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li className="flex items-center space-x-2">
            <Clock className="w-3 h-3 text-yellow-500" />
            <span><strong>Pending:</strong> Document is queued for processing</span>
          </li>
          <li className="flex items-center space-x-2">
            <RefreshCw className="w-3 h-3 text-blue-500" />
            <span><strong>Processing:</strong> Document is being analyzed and indexed</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span><strong>Ready:</strong> Document is searchable in the chatbot</span>
          </li>
          <li className="flex items-center space-x-2">
            <AlertCircle className="w-3 h-3 text-red-500" />
            <span><strong>Failed:</strong> Processing failed, try re-uploading</span>
          </li>
        </ul>
      </div>
    </div>
  );
};