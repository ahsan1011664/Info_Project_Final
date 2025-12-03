const mongoose = require('mongoose');

/**
 * SessionState model tracks the highest seen sequence number for each direction
 * in a session. Used for replay attack detection.
 */
const sessionStateSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true
    },
    userA: {
      type: String,
      required: true,
      index: true
    },
    userB: {
      type: String,
      required: true,
      index: true
    },
    // Highest sequence number seen from userA to userB
    highestSeqAtoB: {
      type: Number,
      default: 0
    },
    // Highest sequence number seen from userB to userA
    highestSeqBtoA: {
      type: Number,
      default: 0
    },
    // Track seen nonces to detect exact duplicates
    seenNonces: [{
      type: String
    }],
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Unique index on session and user pair
sessionStateSchema.index({ sessionId: 1, userA: 1, userB: 1 }, { unique: true });

const SessionState = mongoose.model('SessionState', sessionStateSchema);

module.exports = SessionState;

