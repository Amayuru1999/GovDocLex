import React, { useState } from 'react';
import { Upload, FileText, Settings } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { DocumentUploadModal } from '../components/chatbot/DocumentUploadModal';
import { UserDocuments } from '../components/chatbot/UserDocuments';

const DocumentsPage: React.FC = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    // Refresh the documents list
    setRefreshKey(prev => prev + 1);
    setIsUploadModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#1a1f2e] to-[#0f1419]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Document Management
              </h1>
              <p className="text-gray-400">
                Upload and manage your documents for the RAG chatbot
              </p>
            </div>
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-[#2EF2B8] hover:bg-[#2EF2B8]/80 text-black font-medium"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#0D1520]/50 border-[#34495E]/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Documents</p>
                  <p className="text-2xl font-bold text-white">--</p>
                </div>
                <FileText className="w-8 h-8 text-[#2EF2B8]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0D1520]/50 border-[#34495E]/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Processing</p>
                  <p className="text-2xl font-bold text-yellow-500">--</p>
                </div>
                <Settings className="w-8 h-8 text-yellow-500 animate-spin" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0D1520]/50 border-[#34495E]/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Ready</p>
                  <p className="text-2xl font-bold text-green-500">--</p>
                </div>
                <FileText className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <Card className="bg-[#0D1520]/50 border-[#34495E]/40">
          <CardContent className="p-6">
            <UserDocuments key={refreshKey} />
          </CardContent>
        </Card>

        {/* Upload Modal */}
        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      </div>
    </div>
  );
};

export default DocumentsPage;