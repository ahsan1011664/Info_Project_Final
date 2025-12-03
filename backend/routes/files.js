const express = require('express');
const jwt = require('jsonwebtoken');
const { FileChunk, FileMetadata } = require('../models/File');

const router = express.Router();

// Simple JWT auth middleware (same pattern as messages.js)
const authenticateToken = (req, res, next) => {
  const header = req.headers['authorization'] || req.headers['Authorization'];
  if (!header) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = header.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Invalid Authorization header' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default-secret-change-in-production'
    );
    req.user = decoded;
    next();
  } catch (err) {
    console.error('[FILE] JWT verification error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Upload encrypted file (metadata + chunks)
router.post('/upload', authenticateToken, async (req, res) => {
  try {
    const { fileId, chunks, metadata } = req.body;

    if (!fileId || !chunks || !Array.isArray(chunks) || !metadata) {
      return res.status(400).json({
        error: 'fileId, chunks array, and metadata are required'
      });
    }

    const from = req.user.username;

    // Verify sender matches metadata
    if (metadata.from !== from) {
      return res.status(403).json({ error: 'Sender mismatch' });
    }

    // Validate chunks structure
    for (const chunk of chunks) {
      if (
        typeof chunk.chunkIndex !== 'number' ||
        !chunk.ciphertext ||
        !chunk.iv
      ) {
        return res.status(400).json({
          error: 'Each chunk must have chunkIndex, ciphertext, and iv'
        });
      }
    }

    // Store metadata
    const fileMetadata = new FileMetadata({
      fileId,
      sessionId: metadata.sessionId,
      from: metadata.from,
      to: metadata.to,
      fileName: metadata.fileName,
      fileType: metadata.fileType,
      fileSize: metadata.fileSize,
      totalChunks: metadata.totalChunks,
      timestamp: metadata.timestamp ? new Date(metadata.timestamp) : new Date()
    });

    await fileMetadata.save();

    // Store each chunk
    for (const chunk of chunks) {
      const fileChunk = new FileChunk({
        fileId,
        chunkIndex: chunk.chunkIndex,
        ciphertext: chunk.ciphertext,
        iv: chunk.iv
      });
      await fileChunk.save();
    }

    console.log(
      `[FILE] ✅ Encrypted file uploaded: fileId=${fileId}, from=${from}, to=${metadata.to}, chunks=${chunks.length}, size=${metadata.fileSize} bytes, timestamp=${new Date().toISOString()}`
    );

    return res.status(201).json({
      message: 'Encrypted file uploaded successfully',
      fileId
    });
  } catch (error) {
    console.error('[FILE] Upload error:', error);
    return res.status(500).json({ error: 'Internal server error in /files/upload' });
  }
});

// Get file metadata for a conversation
router.get('/list/:peerUsername/:sessionId', authenticateToken, async (req, res) => {
  try {
    const me = req.user.username;
    const peer = req.params.peerUsername;
    const sessionId = req.params.sessionId;

    if (!peer || !sessionId) {
      return res.status(400).json({ error: 'peerUsername and sessionId are required' });
    }

    const criteria = {
      sessionId,
      $or: [
        { from: me, to: peer },
        { from: peer, to: me }
      ]
    };

    const files = await FileMetadata.find(criteria)
      .sort({ timestamp: -1 })
      .lean();

    // Return only metadata (no ciphertext)
    const safeFiles = files.map((f) => ({
      fileId: f.fileId,
      fileName: f.fileName,
      fileType: f.fileType,
      fileSize: f.fileSize,
      totalChunks: f.totalChunks,
      from: f.from,
      to: f.to,
      sessionId: f.sessionId,
      timestamp: f.timestamp
    }));

    // Log server-side metadata access (file list retrieval)
    console.log(
      `[FILE] 📋 Server-side metadata access: file list retrieved, user=${me}, peer=${peer}, sessionId=${sessionId}, fileCount=${safeFiles.length}, timestamp=${new Date().toISOString()}`
    );

    return res.json(safeFiles);
  } catch (error) {
    console.error('[FILE] List error:', error);
    return res.status(500).json({ error: 'Internal server error in /files/list' });
  }
});

// Download encrypted file chunks
router.get('/download/:fileId', authenticateToken, async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const me = req.user.username;

    // Get file metadata
    const metadata = await FileMetadata.findOne({ fileId }).lean();
    if (!metadata) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Verify user has permission (sender or receiver)
    if (metadata.from !== me && metadata.to !== me) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all chunks for this file
    const chunks = await FileChunk.find({ fileId })
      .sort({ chunkIndex: 1 })
      .lean();

    if (chunks.length !== metadata.totalChunks) {
      console.warn(
        `[FILE] Warning: Expected ${metadata.totalChunks} chunks, found ${chunks.length} for fileId=${fileId}`
      );
    }

    // Return chunks + metadata (client will decrypt)
    const safeChunks = chunks.map((c) => ({
      chunkIndex: c.chunkIndex,
      ciphertext: c.ciphertext,
      iv: c.iv
    }));

    // Log server-side metadata access (file download)
    console.log(
      `[FILE] 📋 Server-side metadata access: file downloaded, user=${me}, fileId=${fileId}, chunks=${safeChunks.length}, timestamp=${new Date().toISOString()}`
    );

    return res.json({
      metadata: {
        fileId: metadata.fileId,
        fileName: metadata.fileName,
        fileType: metadata.fileType,
        fileSize: metadata.fileSize,
        totalChunks: metadata.totalChunks,
        sessionId: metadata.sessionId,
        from: metadata.from,
        to: metadata.to,
        timestamp: metadata.timestamp
      },
      chunks: safeChunks
    });
  } catch (error) {
    console.error('[FILE] Download error:', error);
    return res.status(500).json({ error: 'Internal server error in /files/download' });
  }
});

module.exports = router;

