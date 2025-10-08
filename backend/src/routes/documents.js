import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { protect } from '../middleware/authMiddleware.js';
import { logger } from '../utils/logger.js';
import { body, validationResult } from 'express-validator';
import Document from '../models/Document.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create user-specific directory
    const userId = req.user.id;
    const userUploadsDir = path.join(uploadsDir, userId);
    
    if (!fs.existsSync(userUploadsDir)) {
      fs.mkdirSync(userUploadsDir, { recursive: true });
    }
    
    cb(null, userUploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    
    cb(null, `${timestamp}_${sanitizedBaseName}${extension}`);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'text/plain'];
  
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5, // Maximum 5 files at once
  },
});

// Document model is now imported from models/Document.js

// POST /api/documents/upload - Upload documents
router.post('/upload', protect, upload.array('documents', 5), async (req, res) => {
  try {
    logger.info('📤 Document upload request received', {
      userId: req.user?.id,
      filesCount: req.files?.length || 0,
      userAgent: req.headers['user-agent']
    });

    if (!req.files || req.files.length === 0) {
      logger.warn('❌ No files in upload request');
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const userId = req.user.id;
    const uploadedFiles = [];

    // Process each uploaded file
    for (const file of req.files) {
      // Create document record in database
      const document = new Document({
        userId,
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        size: file.size,
        processingStatus: 'completed', // Mark as completed since we're not processing
      });

      await document.save();

      uploadedFiles.push({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        processingStatus: 'completed',
      });

      logger.info(`📄 Document uploaded and stored: ${file.originalname} by user ${userId}`);
    }

    res.json({
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} document(s)`,
      data: {
        uploadedFiles,
      },
    });

  } catch (error) {
    logger.error('Document upload error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 10MB per file.'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Maximum 5 files can be uploaded at once.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to upload documents'
    });
  }
});

// GET /api/documents/status/:filename - Get processing status
router.get('/status/:filename', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const filename = req.params.filename;

    const document = await Document.findOne({ userId, filename });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: {
        status: document.processingStatus,
        error: document.processingError,
      }
    });

  } catch (error) {
    logger.error('Get document status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get document status'
    });
  }
});

// GET /api/documents/user-documents - Get user's uploaded documents
router.get('/user-documents', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const userDocuments = await Document.find({ userId })
      .select('filename originalName uploadDate size processingStatus')
      .sort({ uploadDate: -1 });

    res.json({
      success: true,
      data: userDocuments
    });

  } catch (error) {
    logger.error('Get user documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user documents'
    });
  }
});

// DELETE /api/documents/:filename - Delete document
router.delete('/:filename', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const filename = req.params.filename;

    const document = await Document.findOne({ userId, filename });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Remove from database
    await Document.deleteOne({ _id: document._id });

    logger.info(`Document deleted: ${filename} by user ${userId}`);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    logger.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete document'
    });
  }
});

// Note: Python processing functions removed for simplified file upload
// Files are now just stored and marked as completed
// Processing can be added later when needed

export default router;