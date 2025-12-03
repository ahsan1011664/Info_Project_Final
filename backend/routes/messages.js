const express = require('express');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
<<<<<<< HEAD

const router = express.Router();

=======
const SessionState = require('../models/SessionState');

const router = express.Router();

// Replay attack protection constants
const MAX_MESSAGE_AGE_MS = 5 * 60 * 1000; // 5 minutes - reject messages older than this
const MAX_SEQUENCE_GAP = 100; // Allow up to 100 sequence numbers gap (for out-of-order delivery)

>>>>>>> 44486ae (Full Deployment)
// Simple JWT auth middleware (same pattern as in kx.js)
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
    console.error('[MSG] JWT verification error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

<<<<<<< HEAD
// Store a new encrypted message (ciphertext only)
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { sessionId, to, ciphertext, iv, msgSeq, timestamp } = req.body;

    if (!sessionId || !to || !ciphertext || !iv || typeof msgSeq !== 'number') {
      return res.status(400).json({
        error: 'sessionId, to, ciphertext, iv and numeric msgSeq are required'
=======
// Store a new encrypted message (ciphertext only) with replay attack protection
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { sessionId, to, ciphertext, iv, msgSeq, timestamp, nonce } = req.body;

    if (!sessionId || !to || !ciphertext || !iv || typeof msgSeq !== 'number' || !nonce) {
      return res.status(400).json({
        error: 'sessionId, to, ciphertext, iv, nonce and numeric msgSeq are required'
>>>>>>> 44486ae (Full Deployment)
      });
    }

    const from = req.user.username;
<<<<<<< HEAD

=======
    const messageTimestamp = timestamp ? new Date(timestamp) : new Date();
    const now = Date.now();
    const messageAge = now - messageTimestamp.getTime();

    // REPLAY PROTECTION: Check 1 - Timestamp validation
    if (messageAge > MAX_MESSAGE_AGE_MS) {
      console.warn(
        `[REPLAY] Rejected old message: sessionId=${sessionId}, from=${from}, to=${to}, msgSeq=${msgSeq}, age=${messageAge}ms`
      );
      return res.status(400).json({
        error: 'Message timestamp is too old (possible replay attack)'
      });
    }

    if (messageAge < -60000) {
      // Message timestamp is more than 1 minute in the future (clock skew)
      console.warn(
        `[REPLAY] Rejected future-dated message: sessionId=${sessionId}, from=${from}, to=${to}, msgSeq=${msgSeq}, future=${-messageAge}ms`
      );
      return res.status(400).json({
        error: 'Message timestamp is in the future (clock skew detected)'
      });
    }

    // REPLAY PROTECTION: Check 2 - Check for duplicate (same sessionId, from, to, msgSeq, nonce)
    const existingMessage = await Message.findOne({
      sessionId,
      from,
      to,
      msgSeq,
      nonce
    });

    if (existingMessage) {
      console.warn(
        `[REPLAY] ⚠️ REPLAY ATTACK DETECTED: Duplicate message detected - sessionId=${sessionId}, from=${from}, to=${to}, msgSeq=${msgSeq}, nonce=${nonce.substring(0, 8)}...`
      );
      return res.status(409).json({
        error: 'Duplicate message detected (replay attack prevented)'
      });
    }

    // REPLAY PROTECTION: Check 3 - Sequence number validation
    // Get or create session state
    const [userA, userB] = [from, to].sort();
    let sessionState = await SessionState.findOne({
      sessionId,
      userA,
      userB
    });

    if (!sessionState) {
      sessionState = new SessionState({
        sessionId,
        userA,
        userB,
        highestSeqAtoB: 0,
        highestSeqBtoA: 0,
        seenNonces: []
      });
    }

    // Determine direction and check sequence
    const isAtoB = from === userA;
    const currentHighest = isAtoB ? sessionState.highestSeqAtoB : sessionState.highestSeqBtoA;

    // Allow sequence numbers that are:
    // 1. Higher than current (normal progression)
    // 2. Within MAX_SEQUENCE_GAP of current (out-of-order delivery)
    // 3. Reject if too far behind (likely replay)
    if (msgSeq < currentHighest - MAX_SEQUENCE_GAP) {
      console.warn(
        `[REPLAY] ⚠️ REPLAY ATTACK DETECTED: Sequence number too low - sessionId=${sessionId}, from=${from}, to=${to}, msgSeq=${msgSeq}, expected > ${currentHighest - MAX_SEQUENCE_GAP}, currentHighest=${currentHighest}`
      );
      return res.status(400).json({
        error: 'Message sequence number is too low (possible replay attack)'
      });
    }

    // Check if nonce was already seen
    if (sessionState.seenNonces.includes(nonce)) {
      console.warn(
        `[REPLAY] ⚠️ REPLAY ATTACK DETECTED: Duplicate nonce - sessionId=${sessionId}, from=${from}, to=${to}, msgSeq=${msgSeq}, nonce=${nonce.substring(0, 8)}...`
      );
      return res.status(409).json({
        error: 'Duplicate nonce detected (replay attack prevented)'
      });
    }

    // Store the message
>>>>>>> 44486ae (Full Deployment)
    const message = new Message({
      sessionId,
      from,
      to,
      ciphertext,
      iv,
      msgSeq,
<<<<<<< HEAD
      timestamp: timestamp ? new Date(timestamp) : new Date()
=======
      nonce,
      timestamp: messageTimestamp
>>>>>>> 44486ae (Full Deployment)
    });

    await message.save();

<<<<<<< HEAD
    console.log(
      `[MSG] Encrypted message stored: sessionId=${sessionId}, from=${from}, to=${to}, msgSeq=${msgSeq}`
=======
    // Update session state
    if (isAtoB) {
      sessionState.highestSeqAtoB = Math.max(sessionState.highestSeqAtoB, msgSeq);
    } else {
      sessionState.highestSeqBtoA = Math.max(sessionState.highestSeqBtoA, msgSeq);
    }

    // Add nonce to seen list (keep last 1000 nonces to prevent memory bloat)
    sessionState.seenNonces.push(nonce);
    if (sessionState.seenNonces.length > 1000) {
      sessionState.seenNonces = sessionState.seenNonces.slice(-1000);
    }

    sessionState.lastUpdated = new Date();
    await sessionState.save();

    console.log(
      `[MSG] ✅ Encrypted message stored: sessionId=${sessionId}, from=${from}, to=${to}, msgSeq=${msgSeq}, nonce=${nonce.substring(0, 8)}..., timestamp=${new Date().toISOString()}`
>>>>>>> 44486ae (Full Deployment)
    );

    return res.status(201).json({ message: 'Encrypted message stored' });
  } catch (error) {
<<<<<<< HEAD
=======
    if (error.code === 11000) {
      // MongoDB duplicate key error
      console.warn(
        `[REPLAY] ⚠️ REPLAY ATTACK DETECTED: Database duplicate key violation - ${error.message}`
      );
      return res.status(409).json({
        error: 'Duplicate message detected (replay attack prevented)'
      });
    }
>>>>>>> 44486ae (Full Deployment)
    console.error('[MSG] Send error:', error);
    return res.status(500).json({ error: 'Internal server error in /messages/send' });
  }
});

// Get encrypted messages for a conversation (both directions)
router.get('/conversation/:peerUsername/:sessionId', authenticateToken, async (req, res) => {
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

    const messages = await Message.find(criteria).sort({ msgSeq: 1, timestamp: 1 }).lean();

    // Only return ciphertext + IV + metadata (no plaintext)
    const safeMessages = messages.map((m) => ({
      from: m.from,
      to: m.to,
      sessionId: m.sessionId,
      ciphertext: m.ciphertext,
      iv: m.iv,
      msgSeq: m.msgSeq,
<<<<<<< HEAD
      timestamp: m.timestamp
    }));

    console.log(
      `[MSG] Returning ${safeMessages.length} encrypted message(s) for conversation ${me}<->${peer}, sessionId=${sessionId}`
=======
      nonce: m.nonce,
      timestamp: m.timestamp
    }));

    // Log server-side metadata access (conversation retrieval)
    console.log(
      `[MSG] 📋 Server-side metadata access: conversation retrieved, user=${me}, peer=${peer}, sessionId=${sessionId}, messageCount=${safeMessages.length}, timestamp=${new Date().toISOString()}`
>>>>>>> 44486ae (Full Deployment)
    );

    return res.json(safeMessages);
  } catch (error) {
    console.error('[MSG] Conversation error:', error);
    return res.status(500).json({ error: 'Internal server error in /messages/conversation' });
  }
});

module.exports = router;


