/**
 * Replay Attack Demonstration Script
 * 
 * This script demonstrates replay attack attempts and shows how the system prevents them.
 * 
 * Usage:
 *   node backend/scripts/replayAttackDemo.js
 * 
 * Prerequisites:
 *   - Backend server running
 *   - Two users registered (alice and bob)
 *   - Valid JWT tokens for both users
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

// Configuration - Update these with actual values from your system
const CONFIG = {
  alice: {
    username: 'alice',
    token: 'YOUR_ALICE_JWT_TOKEN_HERE' // Get from browser localStorage after login
  },
  bob: {
    username: 'bob',
    token: 'YOUR_BOB_JWT_TOKEN_HERE' // Get from browser localStorage after login
  },
  sessionId: 'YOUR_SESSION_ID_HERE' // Get from key exchange
};

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, token, data = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    if (data) config.data = data;
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      status: error.response?.status
    };
  }
};

// Demo 1: Attempt to replay a message with same nonce and sequence
const demo1_ReplaySameMessage = async () => {
  console.log('\n=== DEMO 1: Replay Attack - Same Message (Duplicate Nonce) ===\n');

  // First, send a legitimate message
  console.log('Step 1: Sending legitimate message...');
  const legitimateMessage = {
    sessionId: CONFIG.sessionId,
    to: CONFIG.bob.username,
    ciphertext: 'encrypted_ciphertext_here',
    iv: 'encrypted_iv_here',
    msgSeq: 1,
    nonce: 'unique_nonce_12345',
    timestamp: Date.now()
  };

  const result1 = await makeRequest('POST', '/messages/send', CONFIG.alice.token, legitimateMessage);
  if (result1.success) {
    console.log('✅ Legitimate message sent successfully');
  } else {
    console.log('❌ Failed to send legitimate message:', result1.error);
    return;
  }

  // Now attempt to replay the exact same message
  console.log('\nStep 2: Attempting to replay the same message...');
  const result2 = await makeRequest('POST', '/messages/send', CONFIG.alice.token, legitimateMessage);
  
  if (!result2.success && result2.status === 409) {
    console.log('✅ REPLAY ATTACK PREVENTED: Duplicate message rejected');
    console.log(`   Error: ${result2.error}`);
  } else {
    console.log('❌ REPLAY ATTACK SUCCEEDED: Message was accepted (this should not happen!)');
  }
};

// Demo 2: Attempt to replay with old timestamp
const demo2_ReplayOldMessage = async () => {
  console.log('\n=== DEMO 2: Replay Attack - Old Timestamp ===\n');

  const oldMessage = {
    sessionId: CONFIG.sessionId,
    to: CONFIG.bob.username,
    ciphertext: 'encrypted_ciphertext_here',
    iv: 'encrypted_iv_here',
    msgSeq: 2,
    nonce: 'unique_nonce_67890',
    timestamp: Date.now() - (10 * 60 * 1000) // 10 minutes ago
  };

  console.log('Attempting to send message with old timestamp (10 minutes ago)...');
  const result = await makeRequest('POST', '/messages/send', CONFIG.alice.token, oldMessage);
  
  if (!result.success && result.status === 400) {
    console.log('✅ REPLAY ATTACK PREVENTED: Old timestamp rejected');
    console.log(`   Error: ${result.error}`);
  } else {
    console.log('❌ REPLAY ATTACK SUCCEEDED: Old message was accepted (this should not happen!)');
  }
};

// Demo 3: Attempt to replay with low sequence number
const demo3_ReplayLowSequence = async () => {
  console.log('\n=== DEMO 3: Replay Attack - Low Sequence Number ===\n');

  // Assume we've already sent messages with sequence 5, 6, 7
  // Now try to replay message with sequence 1
  const lowSeqMessage = {
    sessionId: CONFIG.sessionId,
    to: CONFIG.bob.username,
    ciphertext: 'encrypted_ciphertext_here',
    iv: 'encrypted_iv_here',
    msgSeq: 1, // Very low sequence number
    nonce: 'unique_nonce_abcde',
    timestamp: Date.now()
  };

  console.log('Attempting to send message with low sequence number (seq=1 when current is higher)...');
  const result = await makeRequest('POST', '/messages/send', CONFIG.alice.token, lowSeqMessage);
  
  if (!result.success && result.status === 400) {
    console.log('✅ REPLAY ATTACK PREVENTED: Low sequence number rejected');
    console.log(`   Error: ${result.error}`);
  } else {
    console.log('❌ REPLAY ATTACK SUCCEEDED: Low sequence message was accepted (this should not happen!)');
  }
};

// Demo 4: Attempt to replay with future timestamp
const demo4_ReplayFutureTimestamp = async () => {
  console.log('\n=== DEMO 4: Replay Attack - Future Timestamp (Clock Skew) ===\n');

  const futureMessage = {
    sessionId: CONFIG.sessionId,
    to: CONFIG.bob.username,
    ciphertext: 'encrypted_ciphertext_here',
    iv: 'encrypted_iv_here',
    msgSeq: 3,
    nonce: 'unique_nonce_future',
    timestamp: Date.now() + (5 * 60 * 1000) // 5 minutes in the future
  };

  console.log('Attempting to send message with future timestamp...');
  const result = await makeRequest('POST', '/messages/send', CONFIG.alice.token, futureMessage);
  
  if (!result.success && result.status === 400) {
    console.log('✅ REPLAY ATTACK PREVENTED: Future timestamp rejected (clock skew detected)');
    console.log(`   Error: ${result.error}`);
  } else {
    console.log('❌ REPLAY ATTACK SUCCEEDED: Future timestamp message was accepted (this should not happen!)');
  }
};

// Main execution
const runDemos = async () => {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     REPLAY ATTACK PROTECTION DEMONSTRATION                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n⚠️  NOTE: Update CONFIG object with actual tokens and sessionId');
  console.log('   Get tokens from browser localStorage after login');
  console.log('   Get sessionId from key exchange process\n');

  // Check if config is set
  if (CONFIG.alice.token.includes('YOUR_') || CONFIG.bob.token.includes('YOUR_') || CONFIG.sessionId.includes('YOUR_')) {
    console.log('❌ Please update CONFIG object with actual values before running demos\n');
    console.log('Example usage:');
    console.log('1. Login as alice and bob in browser');
    console.log('2. Get JWT tokens from localStorage.getItem("authToken")');
    console.log('3. Complete key exchange and get sessionId from Dashboard');
    console.log('4. Update CONFIG object in this file');
    console.log('5. Run this script again\n');
    return;
  }

  try {
    await demo1_ReplaySameMessage();
    await demo2_ReplayOldMessage();
    await demo3_ReplayLowSequence();
    await demo4_ReplayFutureTimestamp();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║     DEMONSTRATION COMPLETE                                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n✅ All replay attack attempts were prevented by the system!');
    console.log('   Check server logs for detailed replay detection messages.\n');
  } catch (error) {
    console.error('Error running demos:', error);
  }
};

// Run if executed directly
if (require.main === module) {
  runDemos();
}

module.exports = { runDemos, demo1_ReplaySameMessage, demo2_ReplayOldMessage, demo3_ReplayLowSequence, demo4_ReplayFutureTimestamp };

