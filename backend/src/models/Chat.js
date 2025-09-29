import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String, // keep your existing UUID for grouping sessions
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: { type: String, required: true },
    context: { type: Object }, // optional extra metadata
  },
  { timestamps: true } // adds createdAt / updatedAt
);

// Add indexes for better query performance
chatSchema.index({ userId: 1, sessionId: 1, createdAt: 1 });
chatSchema.index({ sessionId: 1, createdAt: 1 });
chatSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Chat", chatSchema);
