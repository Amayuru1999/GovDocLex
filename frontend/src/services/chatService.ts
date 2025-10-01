import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SERVER_API;

interface ChatMessage {
  message: string;
  sessionId?: string;
  context?: Record<string, unknown>;
}

interface ChatResponse {
  success: boolean;
  data: {
    response: string;
    sources: string[];
    sessionId: string;
    timestamp: string;
    processingTime: number;
  };
}

interface ChatHistoryResponse {
  success: boolean;
  data: {
    sessionId: string;
    messages: Array<{
      id: string;
      userMessage: string;
      botResponse: string;
      sources: string[];
      timestamp: string;
      processingTime: number;
    }>;
    totalCount: number;
    hasMore: boolean;
  };
}

interface ChatSession {
  id: string;
  sessionId: string;
  createdAt: string;
  lastActivity: string;
  messageCount: number;
  lastUserMessage: string;
  hasHistory: boolean;
}

interface ChatSessionsResponse {
  success: boolean;
  data: {
    sessions: ChatSession[];
    totalCount: number;
    hasMore: boolean;
  };
}

interface StreamCompleteResponse {
  type: 'complete';
  response: string;
  sources: string[];
  sessionId: string;
  timestamp: string;
  processingTime: number;
}

class ChatService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return { Authorization: `Bearer ${token}` };
  }

  async sendMessage(message: string, sessionId?: string, context?: Record<string, unknown>): Promise<ChatResponse> {
    try {
      const response = await axios.post<ChatResponse>(
        `${API_BASE_URL}/chat/message`,
        {
          message,
          sessionId,
          context,
        },
        {
          headers: this.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to send message');
      }
      throw error;
    }
  }

  async getChatHistory(sessionId: string, limit = 50, offset = 0): Promise<ChatHistoryResponse> {
    try {
      const response = await axios.get<ChatHistoryResponse>(
        `${API_BASE_URL}/chat/history/${sessionId}?limit=${limit}&offset=${offset}`,
        {
          headers: this.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to get chat history');
      }
      throw error;
    }
  }

  async getChatSessions(limit = 20, offset = 0): Promise<ChatSessionsResponse> {
    try {
      const response = await axios.get<ChatSessionsResponse>(
        `${API_BASE_URL}/chat/sessions?limit=${limit}&offset=${offset}`,
        {
          headers: this.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to get chat sessions');
      }
      throw error;
    }
  }

  async getUserChatHistory(limit = 50, offset = 0, sessionId?: string) {
    try {
      const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
      if (sessionId) {
        params.append('sessionId', sessionId);
      }

      const response = await axios.get(
        `${API_BASE_URL}/chat/user/history?${params}`,
        {
          headers: this.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to get user chat history');
      }
      throw error;
    }
  }

  async clearChatHistory(sessionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/chat/history/${sessionId}`,
        {
          headers: this.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to clear chat history');
      }
      throw error;
    }
  }

  async clearAllChatHistory(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/chat/user/history`,
        {
          headers: this.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to clear all chat history');
      }
      throw error;
    }
  }

  // Stream message with Server-Sent Events
  async streamMessage(
    message: string,
    sessionId: string | undefined,
    onChunk: (chunk: string) => void,
    onComplete: (response: StreamCompleteResponse) => void,
    onError: (error: Error) => void
  ) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat/stream`,
        {
          message,
          sessionId,
        },
        {
          headers: {
            ...this.getAuthHeader(),
            'Accept': 'text/event-stream',
          },
          responseType: 'stream',
        }
      );

      if (!response.data) {
        throw new Error('No response data');
      }

      const reader = response.data.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              switch (data.type) {
                case 'chunk':
                  onChunk(data.content);
                  break;
                case 'complete':
                  onComplete(data);
                  break;
                case 'error':
                  onError(new Error(data.error));
                  break;
              }
            } catch {
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        onError(new Error(error.response?.data?.message || error.response?.data?.error || 'Streaming failed'));
      } else {
        onError(error as Error);
      }
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Handle token expiration
  handleAuthError(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/login'; // Redirect to login page
  }
}

export const chatService = new ChatService();
export type { ChatMessage, ChatResponse, ChatHistoryResponse, ChatSession, ChatSessionsResponse };