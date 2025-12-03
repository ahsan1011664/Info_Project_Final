const mongoose = require('mongoose');

const fileChunkSchema = new mongoose.Schema(
  {
    fileId: {
      type: String,
      required: true,
      index: true
    },
    chunkIndex: {
      type: Number,
      required: true
    },
    ciphertext: {
      type: String,
      required: true
    },
    iv: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient file retrieval
fileChunkSchema.index({ fileId: 1, chunkIndex: 1 }, { unique: true });

const FileChunk = mongoose.model('FileChunk', fileChunkSchema);

const fileMetadataSchema = new mongoose.Schema(
  {
    fileId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    sessionId: {
      type: String,
      required: true,
      index: true
    },
    from: {
      type: String,
      required: true,
      index: true
    },
    to: {
      type: String,
      required: true,
      index: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    totalChunks: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index to efficiently query files for a conversation
fileMetadataSchema.index({ sessionId: 1, from: 1, to: 1 });

const FileMetadata = mongoose.model('FileMetadata', fileMetadataSchema);

module.exports = { FileChunk, FileMetadata };

