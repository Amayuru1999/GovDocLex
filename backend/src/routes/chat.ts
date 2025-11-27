import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { chatService } from '../services/chatService.js';
import { logger } from '../utils/logger.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validation middleware for chat messages
const validateChatMessage = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters')
    .escape(),
  body('sessionId')
    .optional()
    .isUUID()
    .withMessage('Session ID must be a valid UUID'),
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object')
];

// POST /api/chat/message - Send a message to the RAG system
router.post('/message', protect as any, validateChatMessage, async (req: Request, res: Response) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { message, sessionId, context } = req.body as any;
    const userId = (req as any).user._id; // Get userId from authenticated user
    
    logger.info('Chat message received', {
      userId,
      sessionId,
      messageLength: message.length,
      hasContext: !!context
    });

    // Process the message through the RAG system
    const response = await chatService.processMessage(message, {
      userId,
      sessionId,
      context,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        response: response.answer,
        sources: response.sources || [],
        sessionId: response.sessionId,
        timestamp: response.timestamp,
        processingTime: response.processingTime
      }
    });

  } catch (error) {
    logger.error('Error processing chat message:', error);
    
    res.status(500).json({
      error: 'Failed to process message',
      message: 'An error occurred while processing your request. Please try again.',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/chat/stream - Stream a message response (for real-time chat)
router.post('/stream', protect as any, validateChatMessage, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { message, sessionId, context } = req.body as any;
    const userId = (req as any).user._id; // Get userId from authenticated user
    
    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Send initial connection message
    res.write(`data: ${JSON.stringify({
      type: 'connection',
      message: 'Connected to chat stream',
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Process message with streaming
    await chatService.processMessageStream(message, {
      userId,
      sessionId,
      context,
      onChunk: (chunk: any) => {
        res.write(`data: ${JSON.stringify({
          type: 'chunk',
          content: chunk,
          timestamp: new Date().toISOString()
        })}\n\n`);
      },
      onComplete: (response: any) => {
        res.write(`data: ${JSON.stringify({
          type: 'complete',
          response: response.answer,
          sources: response.sources || [],
          sessionId: response.sessionId,
          timestamp: response.timestamp,
          processingTime: response.processingTime
        })}\n\n`);
        
        res.write(`data: ${JSON.stringify({
          type: 'end',
          timestamp: new Date().toISOString()
        })}\n\n`);
        
        res.end();
      },
      onError: (error: any) => {
        res.write(`data: ${JSON.stringify({
          type: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        })}\n\n`);
        res.end();
      }
    });

  } catch (error) {
    logger.error('Error in chat stream:', error);
    
    if (!(res as any).headersSent) {
      res.status(500).json({
        error: 'Failed to process stream',
        message: 'An error occurred while processing your request.'
      });
    }
  }
});

// GET /api/chat/history/:sessionId - Get chat history for a session
router.get('/history/:sessionId', protect as any, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params as any;
    const { limit = 50, offset = 0 } = req.query as any;
    const userId = (req as any).user._id;

    const history = await chatService.getChatHistory(sessionId, userId, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        sessionId,
        messages: history.messages,
        totalCount: history.totalCount,
        hasMore: history.hasMore
      }
    });

  } catch (error) {
    logger.error('Error fetching chat history:', error);
    
    res.status(500).json({
      error: 'Failed to fetch chat history',
      message: 'An error occurred while retrieving chat history.'
    });
  }
});

// DELETE /api/chat/history/:sessionId - Clear chat history for a session
router.delete('/history/:sessionId', protect as any, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params as any;
    const userId = (req as any).user._id;
    
    await chatService.clearChatHistory(sessionId, userId);
    
    res.json({
      success: true,
      message: 'Chat history cleared successfully'
    });

  } catch (error) {
    logger.error('Error clearing chat history:', error);
    
    res.status(500).json({
      error: 'Failed to clear chat history',
      message: 'An error occurred while clearing chat history.'
    });
  }
});

// GET /api/chat/sessions - Get all chat sessions for current user
router.get('/sessions', protect as any, async (req: Request, res: Response) => {
  try {
    const { limit = 20, offset = 0 } = req.query as any;
    const userId = (req as any).user._id;
    
    const sessions = await chatService.getChatSessions(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        sessions: sessions.sessions,
        totalCount: sessions.totalCount,
        hasMore: sessions.hasMore
      }
    });

  } catch (error) {
    logger.error('Error fetching chat sessions:', error);
    
    res.status(500).json({
      error: 'Failed to fetch chat sessions',
      message: 'An error occurred while retrieving chat sessions.'
    });
  }
});

// GET /api/chat/user/history - Get all chat history for current user across all sessions
router.get('/user/history', protect as any, async (req: Request, res: Response) => {
  try {
    const { limit = 50, offset = 0, sessionId } = req.query as any;
    const userId = (req as any).user._id;
    
    const history = await chatService.getUserChatHistory(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      sessionId: sessionId || null
    });

    res.json({
      success: true,
      data: {
        messages: history.messages,
        totalCount: history.totalCount,
        hasMore: history.hasMore
      }
    });

  } catch (error) {
    logger.error('Error fetching user chat history:', error);
    
    res.status(500).json({
      error: 'Failed to fetch user chat history',
      message: 'An error occurred while retrieving your chat history.'
    });
  }
});

// DELETE /api/chat/user/history - Clear all chat history for current user
router.delete('/user/history', protect as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    
    await chatService.clearUserChatHistory(userId);
    
    res.json({
      success: true,
      message: 'All chat history cleared successfully'
    });

  } catch (error) {
    logger.error('Error clearing user chat history:', error);
    
    res.status(500).json({
      error: 'Failed to clear chat history',
      message: 'An error occurred while clearing your chat history.'
    });
  }
});

export default router;
