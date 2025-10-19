import mongoose, { Schema } from 'mongoose';
import type { IDocument } from '../types/index.js';

const documentSchema = new Schema<IDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    filename: { type: String },
    originalName: { type: String },
    filePath: { type: String },
    size: { type: Number },
    uploadDate: { type: Date, default: Date.now },
    processingStatus: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    processingError: { type: String, default: null },
    chromaCollection: { type: String, default: null },
    chunksCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

documentSchema.index({ userId: 1, uploadDate: -1 });

const DocumentModel = mongoose.models.Document || mongoose.model<IDocument>('Document', documentSchema);
export default DocumentModel;
