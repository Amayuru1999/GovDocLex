import axios from 'axios';

interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    uploadedFiles: Array<{
      filename: string;
      originalName: string;
      size: number;
      processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
    }>;
  };
  error?: string;
}

interface ProcessingStatusResponse {
  success: boolean;
  data?: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    error?: string;
  };
}

class DocumentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      'Authorization': `Bearer ${token}`,
    };
  }



  async uploadDocuments(files: File[]): Promise<UploadResponse> {
    try {
      console.log('🔄 Starting document upload...', {
        filesCount: files.length,
        endpoint: `${import.meta.env.VITE_SERVER_API}/documents/upload`
      });

      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('documents', file);
        console.log(`📄 Adding file: ${file.name} (${file.size} bytes)`);
      });

      // Log auth headers (without token value for security)
      const authHeaders = this.getAuthHeaders();
      console.log('🔐 Auth headers prepared:', { hasAuth: !!authHeaders.Authorization });

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_API}/documents/upload`,
        formData,
        {
          headers: {
            ...authHeaders,
            // Don't set Content-Type manually for FormData, let axios handle it
          },
          timeout: 300000, // 5 minutes timeout for large files
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              console.log(`📊 Upload progress: ${percentCompleted}%`);
            }
          },
        }
      );

      console.log('✅ Upload successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Upload error details:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        isAxiosError: axios.isAxiosError(error),
        response: axios.isAxiosError(error) ? error.response?.data : null,
        status: axios.isAxiosError(error) ? error.response?.status : null,
        endpoint: `${import.meta.env.VITE_SERVER_API}/documents/upload`
      });

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Cannot connect to server. Please ensure the backend server is running on http://localhost:5000');
        }
        if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
          throw new Error('Network error. Please check your internet connection and server status.');
        }
        if (error.response?.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (error.response?.status === 413) {
          throw new Error('File size too large. Please upload smaller files.');
        } else if (error.response?.status === 400) {
          throw new Error(error.response.data?.error || 'Invalid file format or data.');
        } else if (error.response?.status === 500) {
          throw new Error('Server error occurred during upload. Please try again.');
        } else if (error.response?.status === 404) {
          throw new Error('Upload endpoint not found. Please check if the backend server is properly configured.');
        }
        throw new Error(error.response?.data?.error || `Upload failed with status ${error.response?.status || 'unknown'}`);
      }
      throw new Error(`Network error occurred during upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getProcessingStatus(filename: string): Promise<ProcessingStatusResponse> {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_API}/documents/status/${encodeURIComponent(filename)}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (error.response?.status === 404) {
          throw new Error('Document not found.');
        }
        throw new Error(error.response?.data?.error || 'Failed to get processing status');
      }
      throw new Error('Network error occurred while checking status');
    }
  }

  async getUserDocuments(): Promise<{
    success: boolean;
    data?: Array<{
      filename: string;
      originalName: string;
      uploadDate: string;
      size: number;
      processingStatus: string;
    }>;
  }> {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_API}/documents/user-documents`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(error.response?.data?.error || 'Failed to get user documents');
      }
      throw new Error('Network error occurred while fetching documents');
    }
  }

  async deleteDocument(filename: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_SERVER_API}/documents/${encodeURIComponent(filename)}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (error.response?.status === 404) {
          throw new Error('Document not found.');
        }
        throw new Error(error.response?.data?.error || 'Failed to delete document');
      }
      throw new Error('Network error occurred while deleting document');
    }
  }
}

export const documentService = new DocumentService();