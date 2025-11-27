import { ragService } from './ragService.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

class ChatService {
  constructor() {
    // No need for in-memory storage anymore
  }

  async processMessage(message: string, options: any = {}) {
    const startTime = Date.now();
    const sessionId = options.sessionId || uuidv4();
    const userId = options.userId;
    
    try {
      logger.info('Processing chat message', {
        userId,
        sessionId,
        messageLength: message.length
      });

      // Validate user exists
      if (userId) {
        const user = await User.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }
      }

      // Save user message to database
      if (userId) {
        await Chat.create({
          userId,
          sessionId,
          role: 'user',
          content: message,
          context: options.context || {}
        });
      }

      // Process through RAG system
      const ragResponse = await ragService.query(message, {
        collections: options.context?.collections || [],
        maxResults: 5,
        includeSources: true
      });

      const processingTime = Date.now() - startTime;

      // Save assistant response to database
      if (userId) {
        await Chat.create({
          userId,
          sessionId,
          role: 'assistant',
          content: ragResponse.answer,
          context: {
            sources: ragResponse.sources || [],
            processingTime,
            ...options.context
          }
        });
      }

      // Return response
      return {
        answer: ragResponse.answer,
        sources: ragResponse.sources || [],
        sessionId,
        timestamp: new Date().toISOString(),
        processingTime
      };

    } catch (error: any) {
      logger.error('Error processing chat message:', error);
      
      const errorResponse = {
        answer: 'I apologize, but I encountered an error while processing your message. Please try again later.',
        sources: [],
        sessionId,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        error: error.message
      };

      // Save error response if we have a user
      if (userId) {
        try {
          await Chat.create({
            userId,
            sessionId,
            role: 'assistant',
            content: errorResponse.answer,
            context: {
              error: error.message,
              processingTime: errorResponse.processingTime
            }
          });
        } catch (saveError) {
          logger.error('Error saving error response to database:', saveError);
        }
      }

      return errorResponse;
    }
  }

  async processMessageStream(message: string, options: any = {}) {
    const startTime = Date.now();
    const sessionId = options.sessionId || uuidv4();
    const userId = options.userId;
    
    try {
      logger.info('Processing streaming chat message', {
        userId,
        sessionId,
        messageLength: message.length
      });

      // Validate user exists
      if (userId) {
        const user = await User.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }
      }

      // Save user message to database
      if (userId) {
        await Chat.create({
          userId,
          sessionId,
          role: 'user',
          content: message,
          context: options.context || {}
        });
      }

      let fullResponse = '';

      // Process through RAG system with streaming
      await ragService.queryStream(message, {
        collections: options.context?.collections || [],
        maxResults: 5,
        includeSources: true,
        onChunk: (chunk: any) => {
          fullResponse += chunk;
          if (options.onChunk) {
            options.onChunk(chunk);
          }
        },
        onComplete: async (ragResponse: any) => {
          const processingTime = Date.now() - startTime;

          // Save assistant response to database
          if (userId) {
            try {
              await Chat.create({
                userId,
                sessionId,
                role: 'assistant',
                content: ragResponse.answer || fullResponse,
                context: {
                  sources: ragResponse.sources || [],
                  processingTime,
                  ...options.context
                }
              });
            } catch (saveError) {
              logger.error('Error saving streaming response to database:', saveError);
            }
          }

          // Call completion callback
          if (options.onComplete) {
            options.onComplete({
              answer: ragResponse.answer || fullResponse,
              sources: ragResponse.sources || [],
              sessionId,
              timestamp: new Date().toISOString(),
              processingTime
            });
          }
        },
        onError: async (error: any) => {
          logger.error('Error in streaming chat:', error);
          
          // Save error response
          if (userId) {
            try {
              await Chat.create({
                userId,
                sessionId,
                role: 'assistant',
                content: 'I encountered an error while processing your message. Please try again.',
                context: {
                  error: error.message,
                  processingTime: Date.now() - startTime
                }
              });
            } catch (saveError) {
              logger.error('Error saving stream error to database:', saveError);
            }
          }

          if (options.onError) {
            options.onError(error);
          }
        }
      });

    } catch (error: any) {
      logger.error('Error processing streaming chat message:', error);
      
      if (options.onError) {
        options.onError(error);
      }
    }
  }

  async getChatHistory(sessionId: string, userId: string, options: any = {}) {
    try {
      const limit = options.limit || 50;
      const offset = options.offset || 0;
      
      // Build query - include userId for security
      const query: any = { sessionId };
      if (userId) {
        query.userId = userId;
      }
      
      // Get total count
      const totalCount = await Chat.countDocuments(query);
      
      // Get messages with pagination
      const messages = await Chat.find(query)
        .sort({ createdAt: 1 }) // Sort by creation time ascending
        .skip(offset)
        .limit(limit)
        .populate('userId', 'name email')
        .lean();

      // Format messages for response
      const formattedMessages = (messages as any[]).reduce((acc: any[], msg: any) => {
        if (msg.role === 'user') {
          // Start a new conversation pair
          acc.push({
            id: msg._id,
            userMessage: msg.content,
            botResponse: null,
            sources: [],
            timestamp: msg.createdAt,
            processingTime: null
          });
        } else if (msg.role === 'assistant' && acc.length > 0) {
          // Complete the last conversation pair
          const lastEntry = acc[acc.length - 1];
          lastEntry.botResponse = msg.content;
          lastEntry.sources = msg.context?.sources || [];
          lastEntry.processingTime = msg.context?.processingTime || null;
        }
        return acc;
      }, [] as any[]);

      return {
        messages: formattedMessages,
        totalCount: Math.ceil(totalCount / 2), // Divide by 2 since we have user+assistant pairs
        hasMore: offset + limit < totalCount
      };

    } catch (error) {
      logger.error('Error getting chat history:', error);
      return {
        messages: [],
        totalCount: 0,
        hasMore: false
      };
    }
  }

  async clearChatHistory(sessionId: string, userId: string) {
    try {
      // Build query - include userId for security
      const query: any = { sessionId };
      if (userId) {
        query.userId = userId;
      }

      await Chat.deleteMany(query);
      logger.info('Chat history cleared for session', { sessionId, userId });
      return true;
    } catch (error) {
      logger.error('Error clearing chat history:', error);
      return false;
    }
  }

  async clearUserChatHistory(userId: string) {
    try {
      const query: any = { userId };
      await Chat.deleteMany(query);
      logger.info('User chat history cleared', { userId });
      return true;
    } catch (error) {
      logger.error('Error clearing user chat history:', error);
      return false;
    }
  }

  async getSessionStats() {
    try {
      // Example stats: total sessions, total messages, active sessions
      const totalMessages = await Chat.countDocuments({});
      const sessionsAgg = await Chat.aggregate([
        { $group: { _id: '$sessionId' } },
        { $count: 'total' }
      ] as any[]);
      const totalSessions = sessionsAgg.length > 0 ? sessionsAgg[0].total : 0;
      const activeSessions = totalSessions; // placeholder - could be refined

      return { totalSessions, totalMessages, activeSessions };
    } catch (error) {
      logger.error('Error getting session stats:', error);
      return { totalSessions: 0, totalMessages: 0, activeSessions: 0 };
    }
  }

  async getChatSessions(userId: string, options: any = {}) {
    try {
      const limit = options.limit || 20;
      const offset = options.offset || 0;
      
      // Get unique sessions for the user with latest message info
      const pipeline = [
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { 
          $group: {
            _id: '$sessionId',
            firstMessage: { $first: '$createdAt' },
            lastMessage: { $last: '$createdAt' },
            messageCount: { $sum: 1 },
            lastUserMessage: { 
              $last: { 
                $cond: [
                  { $eq: ['$role', 'user'] }, 
                  '$content', 
                  null
                ] 
              } 
            }
          }
        },
        { $sort: { lastMessage: -1 } },
        { $skip: offset },
        { $limit: limit }
      ];

      const sessions = await Chat.aggregate(pipeline as any[]);
      
      // Get total count of unique sessions
      const totalCountPipeline = [
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$sessionId' } },
        { $count: 'total' }
      ];
      
      const countResult = await Chat.aggregate(totalCountPipeline as any[]);
      const totalCount = countResult.length > 0 ? countResult[0].total : 0;

      const formattedSessions = (sessions as any[]).map(session => ({
        id: session._id,
        sessionId: session._id,
        createdAt: session.firstMessage,
        lastActivity: session.lastMessage,
        messageCount: Math.ceil(session.messageCount / 2), // Divide by 2 for user+assistant pairs
        lastUserMessage: session.lastUserMessage,
        hasHistory: true
      }));

      return {
        sessions: formattedSessions,
        totalCount,
        hasMore: offset + limit < totalCount
      };

    } catch (error) {
      logger.error('Error getting chat sessions:', error);
      return {
        sessions: [],
        totalCount: 0,
        hasMore: false
      };
    }
  }

  async getUserChatHistory(userId: string, options: any = {}) {
    try {
      const limit = options.limit || 50;
      const offset = options.offset || 0;
      const sessionId = options.sessionId;
      
      // Build query
      const query: any = { userId };
      if (sessionId) {
        query.sessionId = sessionId;
      }
      
      // Get total count
      const totalCount = await Chat.countDocuments(query);
      
      // Get messages with pagination
      const messages = await Chat.find(query)
        .sort({ createdAt: -1 }) // Sort by creation time descending for recent first
        .skip(offset)
        .limit(limit)
        .lean();

      return {
        messages: (messages as any[]).map(msg => ({
          id: msg._id,
          sessionId: msg.sessionId,
          role: msg.role,
          content: msg.content,
          context: msg.context,
          timestamp: msg.createdAt
        })),
        totalCount,
        hasMore: offset + limit < totalCount
      };

    } catch (error) {
      logger.error('Error getting user chat history:', error);
      return {
        messages: [],
        totalCount: 0,
        hasMore: false
      };
    }
  }
}

// Create singleton instance
export const chatService = new ChatService();
