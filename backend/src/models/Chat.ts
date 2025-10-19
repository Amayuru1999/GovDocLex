import mongoose, { Schema, Types } from 'mongoose';
import type { IChat } from '../types/index.js';

const chatSchema = new Schema<IChat>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: String, required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    context: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

chatSchema.index({ userId: 1, sessionId: 1, createdAt: 1 });
chatSchema.index({ sessionId: 1, createdAt: 1 });
chatSchema.index({ userId: 1, createdAt: -1 });

const Chat = mongoose.models.Chat || mongoose.model<IChat>('Chat', chatSchema);
export default Chat;
