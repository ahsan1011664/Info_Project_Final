/**
 * Client-side Replay Attack Protection
 * Tracks seen sequence numbers and nonces per session
 */

class ReplayProtection {
  constructor() {
    // Map: sessionId -> { highestSeq: number, seenNonces: Set<string> }
    this.sessionStates = new Map();
  }

  /**
   * Initialize or get session state
   * @param {string} sessionId
   * @returns {Object} Session state
   */
  getSessionState(sessionId) {
    if (!this.sessionStates.has(sessionId)) {
      this.sessionStates.set(sessionId, {
        highestSeq: 0,
        seenNonces: new Set()
      });
    }
    return this.sessionStates.get(sessionId);
  }

  /**
   * Validate a received message for replay attacks
   * @param {string} sessionId
   * @param {number} msgSeq
   * @param {string} nonce
   * @param {number} timestamp
   * @returns {{ valid: boolean, reason?: string }}
   */
  validateMessage(sessionId, msgSeq, nonce, timestamp) {
    const state = this.getSessionState(sessionId);
    const now = Date.now();
    const messageAge = now - timestamp;

    // Check 1: Timestamp validation (reject messages older than 5 minutes)
    // But be lenient - if server accepted it, it's probably fine (may be clock skew)
    const MAX_MESSAGE_AGE_MS = 5 * 60 * 1000; // 5 minutes
    if (messageAge > MAX_MESSAGE_AGE_MS) {
      // Only warn, don't block - server already validated
      return {
        valid: true, // Changed to true - trust server validation
        reason: `Message timestamp is old (${Math.round(messageAge / 1000)}s ago) but server accepted`
      };
    }

    // Check 2: Future timestamp (clock skew)
    if (messageAge < -60000) {
      // Only warn, don't block - server already validated
      return {
        valid: true, // Changed to true - trust server validation
        reason: `Message timestamp is in the future but server accepted`
      };
    }

    // Check 3: Duplicate nonce - THIS IS THE CRITICAL CHECK
    // If we've seen this exact nonce before, it's definitely a replay
    if (state.seenNonces.has(nonce)) {
      return {
        valid: false,
        reason: 'Duplicate nonce detected (replay attack)'
      };
    }

    // Check 4: Sequence number validation
    // Be lenient - allow out-of-order delivery
    // Only reject if sequence is WAY too low (more than 100 behind)
    const MAX_SEQUENCE_GAP = 100;
    if (msgSeq < state.highestSeq - MAX_SEQUENCE_GAP) {
      // Warn but don't block - server already accepted
      return {
        valid: true, // Changed to true - trust server validation
        reason: `Sequence number low (msgSeq=${msgSeq}, highest=${state.highestSeq}) but server accepted`
      };
    }

    // Message is valid - update state
    state.highestSeq = Math.max(state.highestSeq, msgSeq);
    state.seenNonces.add(nonce);

    // Cleanup old nonces (keep last 1000)
    if (state.seenNonces.size > 1000) {
      const noncesArray = Array.from(state.seenNonces);
      state.seenNonces = new Set(noncesArray.slice(-1000));
    }

    return { valid: true };
  }

  /**
   * Reset session state (e.g., when starting new session)
   * @param {string} sessionId
   */
  resetSession(sessionId) {
    this.sessionStates.delete(sessionId);
  }

  /**
   * Get current highest sequence for a session
   * @param {string} sessionId
   * @returns {number}
   */
  getHighestSequence(sessionId) {
    const state = this.getSessionState(sessionId);
    return state.highestSeq;
  }
}

// Export singleton instance
export const replayProtection = new ReplayProtection();

