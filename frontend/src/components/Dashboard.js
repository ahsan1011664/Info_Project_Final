import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPrivateKey } from '../utils/indexedDB';
import { importPrivateKeyJWK } from '../utils/crypto';
import { authAPI, kxAPI, messagesAPI } from '../services/api';
import {
  createKeyInit,
  processKeyInitAndCreateResp,
  processKeyRespAndDeriveKey,
  createKeyConfirm,
  decryptAndVerifyKeyConfirm
} from '../utils/keyExchange';
import { encryptMessage, decryptMessage } from '../utils/messageCrypto';
<<<<<<< HEAD
=======
import { encryptFile, decryptFile, downloadFile } from '../utils/fileCrypto';
import { filesAPI } from '../services/api';
import { replayProtection } from '../utils/replayProtection';
>>>>>>> 44486ae (Full Deployment)
import './Dashboard.css';

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const [hasPrivateKey, setHasPrivateKey] = useState(false);
  const [keyInfo, setKeyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [peerUsername, setPeerUsername] = useState('');
  const [kxLog, setKxLog] = useState([]);
  const [kxContext, setKxContext] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [msgSeq, setMsgSeq] = useState(1);
<<<<<<< HEAD
=======
  const [sharedFiles, setSharedFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
>>>>>>> 44486ae (Full Deployment)
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      navigate('/login');
      return;
    }

    setUsername(storedUsername);
    checkPrivateKey(storedUsername);
  }, [navigate]);

  const checkPrivateKey = async (username) => {
    try {
      setLoading(true);
      const privateKeyJWK = await getPrivateKey(username);
      
      // Try to import it to verify it's valid
      const privateKey = await importPrivateKeyJWK(
        privateKeyJWK,
        'RSASSA-PKCS1-v1_5'
      );
      
      setHasPrivateKey(true);
      setKeyInfo({
        algorithm: privateKeyJWK.alg || 'RSA-OAEP',
        keyType: privateKeyJWK.kty || 'RSA',
        keySize: '2048 bits'
      });
    } catch (error) {
      console.error('Private key check failed:', error);
      setHasPrivateKey(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const addLog = (msg) => {
    setKxLog((prev) => [`${new Date().toLocaleTimeString()}: ${msg}`, ...prev].slice(0, 20));
  };

  // Initiator: start key exchange with peer
  const handleStartKeyExchange = async () => {
    if (!peerUsername) {
      addLog('Please enter peer username');
      return;
    }
    try {
      addLog(`Starting key exchange with ${peerUsername} as initiator`);
      const { body, signature, context } = await createKeyInit(username, peerUsername);
      setKxContext({
        role: 'initiator',
        peer: peerUsername,
        keyInitBody: body,
        initContext: context,
        sessionId: body.sessionId,
        aesKey: null,
        transcriptHash: null
      });
      await kxAPI.sendMessage(peerUsername, 'KEY_INIT', { body, signature });
      addLog('KEY_INIT sent to server');
<<<<<<< HEAD
=======
      // Log key exchange attempt (security audit)
      console.log(`[SECURITY] 🔐 Key exchange attempt: initiator=${username}, responder=${peerUsername}, sessionId=${body.sessionId}, timestamp=${new Date().toISOString()}`);
>>>>>>> 44486ae (Full Deployment)
    } catch (error) {
      console.error('Key exchange start error:', error);
      addLog(`Error starting key exchange: ${error.message}`);
    }
  };

  // Poll inbox and process any pending KX messages
  const handleCheckInbox = async () => {
    try {
      const messages = await kxAPI.getInbox();
      if (!messages || messages.length === 0) {
        addLog('No key-exchange messages in inbox');
        return;
      }

      for (const msg of messages) {
        if (msg.messageType === 'KEY_INIT') {
          // We are responder (B)
          const { body, signature } = msg.payload;
          addLog(`Received KEY_INIT from ${msg.from}`);
<<<<<<< HEAD
=======
          // Log key exchange attempt (security audit)
          console.log(`[SECURITY] 🔐 Key exchange attempt: received KEY_INIT, responder=${username}, initiator=${msg.from}, timestamp=${new Date().toISOString()}`);
>>>>>>> 44486ae (Full Deployment)
          const initiatorInfo = await authAPI.getPublicKey(msg.from);
          const { body: respBody, signature: respSig, sessionContext } =
            await processKeyInitAndCreateResp(
              body,
              signature,
              initiatorInfo.publicKey,
              username
            );
          setKxContext({
            role: 'responder',
            peer: msg.from,
            keyInitBody: body,
            sessionId: body.sessionId,
            aesKey: sessionContext.aesKey,
            transcriptHash: sessionContext.transcriptHash,
            nonceA: sessionContext.nonceA,
            nonceB: sessionContext.nonceB
          });
          await kxAPI.sendMessage(msg.from, 'KEY_RESP', {
            body: respBody,
            signature: respSig
          });
          addLog('Processed KEY_INIT, sent KEY_RESP');
<<<<<<< HEAD
=======
          // Log key exchange attempt (security audit)
          console.log(`[SECURITY] 🔐 Key exchange attempt: responder=${username}, initiator=${msg.from}, sessionId=${body.sessionId}, timestamp=${new Date().toISOString()}`);
>>>>>>> 44486ae (Full Deployment)
        } else if (msg.messageType === 'KEY_RESP' && kxContext && kxContext.role === 'initiator') {
          // Initiator receives response
          const { body, signature } = msg.payload;
          addLog(`Received KEY_RESP from ${msg.from}`);
          const responderInfo = await authAPI.getPublicKey(msg.from);
          const { aesKey, sessionId, transcriptHash } = await processKeyRespAndDeriveKey(
            body,
            signature,
            responderInfo.publicKey,
            kxContext.keyInitBody,
            kxContext.initContext
          );
          const updatedContext = {
            ...kxContext,
            aesKey,
            sessionId,
            transcriptHash
          };
          setKxContext(updatedContext);
          const confirmMsg = await createKeyConfirm(
            'KEY_CONFIRM_A',
            sessionId,
            username,
            msg.from,
            aesKey,
            transcriptHash
          );
          await kxAPI.sendMessage(msg.from, 'KEY_CONFIRM_A', confirmMsg);
          addLog('Derived session key and sent KEY_CONFIRM_A');
<<<<<<< HEAD
=======
          // Log key exchange progress (security audit)
          console.log(`[SECURITY] 🔐 Key exchange in progress: initiator=${username}, responder=${msg.from}, sessionId=${sessionId}, timestamp=${new Date().toISOString()}`);
>>>>>>> 44486ae (Full Deployment)
        } else if (msg.messageType === 'KEY_CONFIRM_A' && kxContext && kxContext.role === 'responder') {
          // Responder receives confirmation from initiator
          addLog(`Received KEY_CONFIRM_A from ${msg.from}`);
          await decryptAndVerifyKeyConfirm(
            msg.payload,
            kxContext.aesKey,
            kxContext.transcriptHash
          );
          addLog('KEY_CONFIRM_A verified, sending KEY_CONFIRM_B');
<<<<<<< HEAD
=======
          // Log key exchange progress (security audit)
          console.log(`[SECURITY] 🔐 Key exchange in progress: responder=${username}, initiator=${msg.from}, sessionId=${kxContext.sessionId}, timestamp=${new Date().toISOString()}`);
>>>>>>> 44486ae (Full Deployment)
          const confirmB = await createKeyConfirm(
            'KEY_CONFIRM_B',
            kxContext.sessionId,
            username,
            msg.from,
            kxContext.aesKey,
            kxContext.transcriptHash
          );
          await kxAPI.sendMessage(msg.from, 'KEY_CONFIRM_B', confirmB);
        } else if (msg.messageType === 'KEY_CONFIRM_B' && kxContext && kxContext.role === 'initiator') {
          // Initiator receives final confirmation
          addLog(`Received KEY_CONFIRM_B from ${msg.from}`);
          await decryptAndVerifyKeyConfirm(
            msg.payload,
            kxContext.aesKey,
            kxContext.transcriptHash
          );
          addLog('KEY_CONFIRM_B verified. Secure session established!');
<<<<<<< HEAD
=======
          // Log successful key exchange completion (security audit)
          console.log(`[SECURITY] ✅ Key exchange completed: initiator=${username}, responder=${msg.from}, sessionId=${kxContext.sessionId}, timestamp=${new Date().toISOString()}`);
>>>>>>> 44486ae (Full Deployment)
        } else {
          addLog(`Received unrelated KX message of type ${msg.messageType}`);
        }
      }
    } catch (error) {
      console.error('Inbox processing error:', error);
      addLog(`Error checking inbox: ${error.message}`);
    }
  };

  const canChat = kxContext && kxContext.aesKey && kxContext.peer;

  // Send encrypted chat message using established session key
  const handleSendMessage = async () => {
    if (!canChat || !newMessage.trim()) return;

    try {
      const peer = kxContext.peer;
      const sessionId = kxContext.sessionId;
      const currentSeq = msgSeq;

      const encrypted = await encryptMessage(
        kxContext.aesKey,
        sessionId,
        username,
        peer,
        currentSeq,
        newMessage.trim()
      );

      await messagesAPI.sendEncrypted({
        sessionId,
        to: peer,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        msgSeq: currentSeq,
<<<<<<< HEAD
=======
        nonce: encrypted.nonce,
>>>>>>> 44486ae (Full Deployment)
        timestamp: encrypted.timestamp
      });

      // Display immediately in local chat
      setChatMessages((prev) => [
        ...prev,
        {
          from: username,
          to: peer,
          content: newMessage.trim(),
          timestamp: new Date(encrypted.timestamp)
        }
      ]);

      setMsgSeq(currentSeq + 1);
      setNewMessage('');
    } catch (error) {
      console.error('Send encrypted message error:', error);
      addLog(`Error sending encrypted message: ${error.message}`);
    }
  };

  // Load and decrypt conversation messages from server
  const handleLoadMessages = async () => {
    if (!canChat) return;

    try {
      const peer = kxContext.peer;
      const sessionId = kxContext.sessionId;
      const encryptedMessages = await messagesAPI.getConversation(peer, sessionId);

      const decrypted = [];
<<<<<<< HEAD
      for (const msg of encryptedMessages) {
        try {
=======
      const seenMessageKeys = new Set(); // Track messages we've already processed in this load
      
      for (const msg of encryptedMessages) {
        try {
          // Create unique key for this message (sessionId + msgSeq + nonce)
          const messageKey = `${msg.sessionId}|${msg.msgSeq}|${msg.nonce}`;
          
          // Skip if we've already processed this exact message in this load
          if (seenMessageKeys.has(messageKey)) {
            continue;
          }
          seenMessageKeys.add(messageKey);

          // IMPORTANT: Don't use client-side replay protection when loading messages from server
          // Server has already validated these messages. Client-side protection would incorrectly
          // flag legitimate messages as replays when loading them again.
          // Client-side protection should only be used for real-time incoming messages (if using WebSocket).
          
          // Just decrypt and display - server already validated
>>>>>>> 44486ae (Full Deployment)
          const plain = await decryptMessage(kxContext.aesKey, msg);
          decrypted.push({
            from: plain.from,
            to: plain.to,
            content: plain.content,
            timestamp: new Date(plain.timestamp)
          });
        } catch (err) {
<<<<<<< HEAD
          console.error('Decrypt message failed:', err);
=======
          // Log failed decryption (security audit)
          console.error(`[SECURITY] ❌ Failed message decryption: sessionId=${msg.sessionId}, from=${msg.from}, to=${msg.to}, msgSeq=${msg.msgSeq}, error=${err.message}, timestamp=${new Date().toISOString()}`);
>>>>>>> 44486ae (Full Deployment)
          addLog('Failed to decrypt one message (possible tampering or wrong key).');
        }
      }

      setChatMessages(decrypted);
    } catch (error) {
      console.error('Load messages error:', error);
      addLog(`Error loading messages: ${error.message}`);
    }
  };

<<<<<<< HEAD
=======
  // Upload encrypted file
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !canChat) {
      if (!canChat) {
        addLog('Establish secure session first before uploading files.');
      }
      return;
    }

    try {
      setUploadingFile(true);
      addLog(`Encrypting file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

      const peer = kxContext.peer;
      const sessionId = kxContext.sessionId;

      // Encrypt file client-side
      const { fileId, chunks, metadata } = await encryptFile(
        kxContext.aesKey,
        file,
        sessionId,
        username,
        peer
      );

      addLog(`File encrypted into ${chunks.length} chunk(s). Uploading...`);

      // Upload encrypted chunks to server
      await filesAPI.uploadFile(fileId, chunks, metadata);

      addLog(`✅ File uploaded successfully: ${file.name}`);
      setUploadingFile(false);
      event.target.value = ''; // Reset file input

      // Refresh file list
      handleLoadFiles();
    } catch (error) {
      console.error('File upload error:', error);
      addLog(`Error uploading file: ${error.message}`);
      setUploadingFile(false);
    }
  };

  // Load file list for current conversation
  const handleLoadFiles = async () => {
    if (!canChat) return;

    try {
      const peer = kxContext.peer;
      const sessionId = kxContext.sessionId;
      const files = await filesAPI.listFiles(peer, sessionId);
      setSharedFiles(files);
    } catch (error) {
      console.error('Load files error:', error);
      addLog(`Error loading files: ${error.message}`);
    }
  };

  // Download and decrypt file
  const handleDownloadFile = async (fileId) => {
    if (!canChat) return;

    try {
      addLog(`Downloading encrypted file chunks...`);
      const fileData = await filesAPI.downloadFile(fileId);

      addLog(`Decrypting ${fileData.chunks.length} chunk(s)...`);
      const decryptedBlob = await decryptFile(
        kxContext.aesKey,
        fileData.chunks,
        fileData.metadata
      );

      downloadFile(decryptedBlob, fileData.metadata.fileName);
      addLog(`✅ File downloaded and decrypted: ${fileData.metadata.fileName}`);
    } catch (error) {
      console.error('File download error:', error);
      addLog(`Error downloading/decrypting file: ${error.message}`);
    }
  };

  // Load files when session is established
  useEffect(() => {
    if (canChat && kxContext?.sessionId) {
      handleLoadFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canChat, kxContext?.sessionId]);

  // Reset replay protection when new session is established
  // Note: Client-side replay protection is disabled for loading messages since server already validates.
  // It would incorrectly flag legitimate messages when loading them from the server.
  useEffect(() => {
    if (kxContext?.sessionId) {
      replayProtection.resetSession(kxContext.sessionId);
      // Don't log this as it's not needed - server-side protection is authoritative
    }
  }, [kxContext?.sessionId]);

>>>>>>> 44486ae (Full Deployment)
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
<<<<<<< HEAD
          <h1 style={styles.headerTitle}>Secure Messaging Dashboard</h1>
          <button onClick={handleLogout} style={styles.logoutButton} className="dashboard-logout-button">
=======
          <h1 style={styles.headerTitle}>
            <span>🛡️</span>
            Secure Messaging Dashboard
          </h1>
          <button onClick={handleLogout} style={styles.logoutButton} className="dashboard-logout-button">
            <span>⏻</span>
>>>>>>> 44486ae (Full Deployment)
            Logout
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.welcomeCard}>
<<<<<<< HEAD
          <div style={styles.welcomeIcon}>👋</div>
          <h2 style={styles.welcomeTitle}>Welcome, {username}</h2>
          <p style={styles.welcomeSubtitle}>Your secure messaging dashboard</p>
=======
          <div style={styles.welcomeIcon}>⚡</div>
          <h2 style={styles.welcomeTitle}>Welcome, {username}</h2>
          <p style={styles.welcomeSubtitle}>Your secure end-to-end encrypted messaging platform</p>
>>>>>>> 44486ae (Full Deployment)
        </div>

        <div style={styles.cardsGrid}>
          {/* User Information Card */}
          <div style={styles.card} className="dashboard-card">
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>👤</span>
              <h3 style={styles.cardTitle}>User Information</h3>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Username:</span>
                <span style={styles.infoValue}>{username}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Account Status:</span>
                <span style={styles.statusBadge}>Active</span>
              </div>
            </div>
          </div>

          {/* Key Status Card */}
          <div style={styles.card} className="dashboard-card">
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>🔑</span>
              <h3 style={styles.cardTitle}>Cryptographic Keys</h3>
            </div>
            <div style={styles.cardBody}>
              {loading ? (
                <div style={styles.loading}>Checking keys...</div>
              ) : (
                <>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Private Key:</span>
                    {hasPrivateKey ? (
                      <span style={styles.statusBadgeSuccess}>
                        ✅ Stored Locally
                      </span>
                    ) : (
                      <span style={styles.statusBadgeWarning}>
                        ⚠️ Not Found
                      </span>
                    )}
                  </div>
                  {keyInfo && (
                    <>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Algorithm:</span>
                        <span style={styles.infoValue}>{keyInfo.algorithm}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Key Type:</span>
                        <span style={styles.infoValue}>{keyInfo.keyType}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Key Size:</span>
                        <span style={styles.infoValue}>{keyInfo.keySize}</span>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Security Information Card */}
          <div style={styles.card} className="dashboard-card">
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>🔒</span>
              <h3 style={styles.cardTitle}>Security Information</h3>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.securityList}>
                <div style={styles.securityItem}>
                  <span style={styles.securityIcon}>✓</span>
                  <span style={styles.securityText}>
                    Private key stored in browser's IndexedDB
                  </span>
                </div>
                <div style={styles.securityItem}>
                  <span style={styles.securityIcon}>✓</span>
                  <span style={styles.securityText}>
                    Private keys never transmitted to server
                  </span>
                </div>
                <div style={styles.securityItem}>
                  <span style={styles.securityIcon}>✓</span>
                  <span style={styles.securityText}>
                    Only public key stored on server
                  </span>
                </div>
                <div style={styles.securityItem}>
                  <span style={styles.securityIcon}>✓</span>
                  <span style={styles.securityText}>
                    End-to-end encryption ready
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* System Status Card */}
          <div style={styles.card} className="dashboard-card">
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>⚙️</span>
              <h3 style={styles.cardTitle}>System Status</h3>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.statusGrid}>
                <div style={styles.statusItem}>
                  <div style={styles.statusIndicator}></div>
                  <span style={styles.statusText}>Authentication</span>
                </div>
                <div style={styles.statusItem}>
                  <div style={styles.statusIndicator}></div>
                  <span style={styles.statusText}>Key Management</span>
                </div>
                <div style={styles.statusItem}>
                  <div style={styles.statusIndicator}></div>
                  <span style={styles.statusText}>Encryption</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Exchange Demo Card */}
          <div style={styles.card} className="dashboard-card">
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>🔄</span>
              <h3 style={styles.cardTitle}>Secure Key Exchange Demo (ECDH + Signatures)</h3>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.formRow}>
                <label style={styles.infoLabel}>
                  Peer Username:
                </label>
                <input
                  type="text"
                  value={peerUsername}
                  onChange={(e) => setPeerUsername(e.target.value)}
                  placeholder="Enter peer username (e.g., user2)"
                  style={styles.textInput}
                />
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleStartKeyExchange}
                  style={styles.primaryButton}
                >
                  Start Key Exchange (Initiator)
                </button>
                <button
                  type="button"
                  onClick={handleCheckInbox}
                  style={styles.secondaryButton}
                >
                  Check Inbox / Process Messages
                </button>
              </div>
              <div style={{ marginTop: '16px' }}>
                <div style={styles.infoLabel}>Protocol Status:</div>
                <div style={styles.logBox}>
                  {kxLog.length === 0 ? (
                    <div style={styles.logLine}>
                      No key exchange activity yet. Use the buttons above to start.
                    </div>
                  ) : (
                    kxLog.map((line, idx) => (
                      <div key={idx} style={styles.logLine}>
                        {line}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Encrypted Chat Demo Card */}
          <div style={styles.card} className="dashboard-card">
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>💬</span>
              <h3 style={styles.cardTitle}>End-to-End Encrypted Chat (AES-256-GCM)</h3>
            </div>
            <div style={styles.cardBody}>
              {!canChat ? (
                <div style={styles.loading}>
                  Establish a secure session with key exchange first, then you can send encrypted
                  messages.
                </div>
              ) : (
                <>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Chatting with:</span>
                    <span style={styles.infoValue}>{kxContext.peer}</span>
                  </div>
                  <div style={styles.chatBox}>
                    {chatMessages.length === 0 ? (
                      <div style={styles.chatEmpty}>No messages yet.</div>
                    ) : (
                      chatMessages.map((m, idx) => (
                        <div
                          key={idx}
                          style={
                            m.from === username ? styles.chatBubbleMe : styles.chatBubblePeer
                          }
                        >
                          <div style={styles.chatMeta}>
                            <span>{m.from}</span>
                            <span>
                              {m.timestamp instanceof Date
                                ? m.timestamp.toLocaleTimeString()
                                : ''}
                            </span>
                          </div>
                          <div style={styles.chatText}>{m.content}</div>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <textarea
                      rows={2}
                      style={styles.chatInput}
                      placeholder="Type encrypted message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={handleSendMessage}
                        style={styles.primaryButton}
                        disabled={!newMessage.trim()}
                      >
                        Send Encrypted Message
                      </button>
                      <button
                        type="button"
                        onClick={handleLoadMessages}
                        style={styles.secondaryButton}
                      >
                        Refresh Messages
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
<<<<<<< HEAD
=======

          {/* Encrypted File Sharing Card */}
          <div style={styles.card} className="dashboard-card">
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>📁</span>
              <h3 style={styles.cardTitle}>End-to-End Encrypted File Sharing (AES-256-GCM)</h3>
            </div>
            <div style={styles.cardBody}>
              {!canChat ? (
                <div style={styles.loading}>
                  Establish a secure session with key exchange first, then you can share encrypted
                  files.
                </div>
              ) : (
                <>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Sharing files with:</span>
                    <span style={styles.infoValue}>{kxContext.peer}</span>
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <label style={styles.infoLabel}>Upload Encrypted File:</label>
                    <div style={{
                      marginTop: '10px',
                      padding: '18px',
                      border: '2px dashed rgba(148, 163, 184, 0.3)',
                      borderRadius: '14px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      transition: 'all 0.3s ease',
                      cursor: uploadingFile ? 'not-allowed' : 'pointer',
                      borderColor: uploadingFile ? 'rgba(148, 163, 184, 0.2)' : 'rgba(14, 165, 233, 0.3)'
                    }}>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                        style={{
                          fontSize: '14px',
                          width: '100%',
                          cursor: uploadingFile ? 'not-allowed' : 'pointer',
                          color: '#f1f5f9'
                        }}
                      />
                    </div>
                    {uploadingFile && (
                      <div style={{
                        marginTop: '12px',
                        padding: '14px 18px',
                        background: 'rgba(14, 165, 233, 0.15)',
                        borderRadius: '12px',
                        border: '1px solid rgba(14, 165, 233, 0.3)',
                        color: '#7dd3fc',
                        fontSize: '14px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        <span className="button-spinner" style={{
                          width: '18px',
                          height: '18px',
                          border: '2px solid rgba(125, 211, 252, 0.3)',
                          borderTopColor: '#7dd3fc'
                        }}></span>
                        Encrypting and uploading...
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={styles.infoLabel}>Shared Files:</span>
                      <button
                        type="button"
                        onClick={handleLoadFiles}
                        style={styles.secondaryButton}
                      >
                        Refresh
                      </button>
                    </div>
                    {sharedFiles.length === 0 ? (
                      <div style={styles.chatEmpty}>No files shared yet.</div>
                    ) : (
                      <div style={styles.fileList}>
                        {sharedFiles.map((file) => (
                          <div key={file.fileId} style={styles.fileItem}>
                            <div style={styles.fileInfo}>
                              <span style={styles.fileName}>{file.fileName}</span>
                              <span style={styles.fileSize}>
                                {(file.fileSize / 1024).toFixed(2)} KB
                              </span>
                              <span style={styles.fileMeta}>
                                {file.from === username ? 'Sent' : 'Received'} •{' '}
                                {new Date(file.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(file.fileId)}
                              style={styles.primaryButton}
                            >
                              Download & Decrypt
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
>>>>>>> 44486ae (Full Deployment)
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
<<<<<<< HEAD
    backgroundColor: '#f8f9fa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e9ecef',
    padding: '20px 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
=======
    background: '#0a0e27',
    backgroundImage: `
      radial-gradient(circle at 20% 30%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
      linear-gradient(180deg, #0a0e27 0%, #1e293b 100%)
    `,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  header: {
    background: 'rgba(30, 41, 59, 0.8)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
    padding: '24px 0',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 100
>>>>>>> 44486ae (Full Deployment)
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
<<<<<<< HEAD
    fontSize: '24px',
    fontWeight: '600',
    color: '#212529',
    margin: 0
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
=======
    fontSize: '26px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
    letterSpacing: '-0.8px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  logoutButton: {
    padding: '10px 24px',
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
>>>>>>> 44486ae (Full Deployment)
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px'
  },
  welcomeCard: {
<<<<<<< HEAD
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    padding: '40px',
    marginBottom: '30px',
    textAlign: 'center',
    color: 'white',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  welcomeIcon: {
    fontSize: '48px',
    marginBottom: '10px'
  },
  welcomeTitle: {
    fontSize: '28px',
    fontWeight: '600',
    margin: '10px 0',
    color: 'white'
  },
  welcomeSubtitle: {
    fontSize: '16px',
    opacity: 0.9,
    margin: 0
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    border: '1px solid #e9ecef'
=======
    background: 'rgba(30, 41, 59, 0.6)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '48px 40px',
    marginBottom: '36px',
    textAlign: 'center',
    color: '#f1f5f9',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(148, 163, 184, 0.1)',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(148, 163, 184, 0.1)'
  },
  welcomeIcon: {
    fontSize: '72px',
    marginBottom: '20px',
    display: 'block',
    filter: 'drop-shadow(0 4px 12px rgba(14, 165, 233, 0.4))'
  },
  welcomeTitle: {
    fontSize: '36px',
    fontWeight: '800',
    margin: '16px 0',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-1px'
  },
  welcomeSubtitle: {
    fontSize: '16px',
    color: '#94a3b8',
    margin: 0,
    fontWeight: '500',
    letterSpacing: '0.3px'
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px'
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '28px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(148, 163, 184, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    position: 'relative',
    overflow: 'hidden'
>>>>>>> 44486ae (Full Deployment)
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
<<<<<<< HEAD
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f8f9fa'
  },
  cardIcon: {
    fontSize: '24px',
    marginRight: '12px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#212529',
    margin: 0
  },
  cardBody: {
    color: '#495057'
=======
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
  },
  cardIcon: {
    fontSize: '32px',
    marginRight: '16px',
    width: '56px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
    borderRadius: '14px',
    padding: '10px',
    filter: 'drop-shadow(0 2px 8px rgba(14, 165, 233, 0.3))'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#f1f5f9',
    margin: 0,
    letterSpacing: '-0.5px',
    lineHeight: '1.3'
  },
  cardBody: {
    color: '#cbd5e1'
>>>>>>> 44486ae (Full Deployment)
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
<<<<<<< HEAD
    padding: '12px 0',
    borderBottom: '1px solid #f8f9fa'
=======
    padding: '14px 0',
    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
    transition: 'background 0.2s ease'
>>>>>>> 44486ae (Full Deployment)
  },
  infoRowLast: {
    borderBottom: 'none'
  },
  infoLabel: {
<<<<<<< HEAD
    fontSize: '14px',
    color: '#6c757d',
    fontWeight: '500'
  },
  infoValue: {
    fontSize: '14px',
    color: '#212529',
    fontWeight: '600'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#e7f3ff',
    color: '#0066cc'
  },
  statusBadgeSuccess: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#d4edda',
    color: '#155724'
  },
  statusBadgeWarning: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#fff3cd',
    color: '#856404'
=======
    fontSize: '13px',
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  },
  infoValue: {
    fontSize: '15px',
    color: '#f1f5f9',
    fontWeight: '700',
    letterSpacing: '-0.2px'
  },
  statusBadge: {
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    color: '#ffffff',
    boxShadow: '0 2px 12px rgba(14, 165, 233, 0.4)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  },
  statusBadgeSuccess: {
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
    color: '#ffffff',
    boxShadow: '0 2px 12px rgba(16, 185, 129, 0.4)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  },
  statusBadgeWarning: {
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    color: '#ffffff',
    boxShadow: '0 2px 12px rgba(245, 158, 11, 0.4)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
>>>>>>> 44486ae (Full Deployment)
  },
  securityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  securityItem: {
    display: 'flex',
    alignItems: 'flex-start',
<<<<<<< HEAD
    gap: '12px'
  },
  securityIcon: {
    color: '#28a745',
    fontWeight: 'bold',
    fontSize: '16px',
    marginTop: '2px'
  },
  securityText: {
    fontSize: '14px',
    color: '#495057',
    lineHeight: '1.5'
=======
    gap: '14px',
    padding: '10px',
    borderRadius: '10px',
    transition: 'background 0.2s ease'
  },
  securityIcon: {
    color: '#14b8a6',
    fontWeight: 'bold',
    fontSize: '20px',
    marginTop: '2px',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(14, 165, 233, 0.2) 100%)',
    borderRadius: '8px',
    flexShrink: 0
  },
  securityText: {
    fontSize: '14px',
    color: '#cbd5e1',
    lineHeight: '1.6',
    fontWeight: '500'
>>>>>>> 44486ae (Full Deployment)
  },
  statusGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  statusIndicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
<<<<<<< HEAD
    backgroundColor: '#28a745',
    boxShadow: '0 0 0 3px rgba(40, 167, 69, 0.2)'
  },
  statusText: {
    fontSize: '14px',
    color: '#495057',
    fontWeight: '500'
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#6c757d',
    fontSize: '14px'
=======
    background: 'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)',
    boxShadow: '0 0 0 4px rgba(20, 184, 166, 0.2), 0 2px 8px rgba(20, 184, 166, 0.4)',
    animation: 'pulse 2s ease-in-out infinite'
  },
  statusText: {
    fontSize: '14px',
    color: '#cbd5e1',
    fontWeight: '600'
  },
  loading: {
    textAlign: 'center',
    padding: '36px 24px',
    color: '#94a3b8',
    fontSize: '15px',
    fontWeight: '500',
    background: 'rgba(15, 23, 42, 0.4)',
    borderRadius: '14px',
    border: '2px dashed rgba(148, 163, 184, 0.3)'
>>>>>>> 44486ae (Full Deployment)
  },
  formRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  textInput: {
    width: '100%',
<<<<<<< HEAD
    padding: '8px 10px',
    borderRadius: '4px',
    border: '1px solid #ced4da',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  primaryButton: {
    padding: '8px 14px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  secondaryButton: {
    padding: '8px 14px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  logBox: {
    marginTop: '8px',
    maxHeight: '160px',
    overflowY: 'auto',
    borderRadius: '4px',
    border: '1px solid #e9ecef',
    padding: '8px',
    backgroundColor: '#fdfdfe'
  },
  logLine: {
    fontSize: '12px',
    color: '#495057',
    marginBottom: '4px'
  },
  chatBox: {
    marginTop: '10px',
    maxHeight: '200px',
    overflowY: 'auto',
    border: '1px solid #e9ecef',
    borderRadius: '6px',
    padding: '8px',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  chatEmpty: {
    fontSize: '13px',
    color: '#6c757d'
  },
  chatBubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '6px 10px',
    borderRadius: '10px',
    maxWidth: '80%',
    fontSize: '13px'
  },
  chatBubblePeer: {
    alignSelf: 'flex-start',
    backgroundColor: '#e9ecef',
    color: '#212529',
    padding: '6px 10px',
    borderRadius: '10px',
    maxWidth: '80%',
    fontSize: '13px'
=======
    padding: '14px 18px',
    borderRadius: '12px',
    border: '2px solid rgba(148, 163, 184, 0.2)',
    fontSize: '15px',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    background: 'rgba(15, 23, 42, 0.6)',
    color: '#f1f5f9',
    fontWeight: '500'
  },
  primaryButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #ec4899 100%)',
    backgroundSize: '200% 200%',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(14, 165, 233, 0.4)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  secondaryButton: {
    padding: '12px 24px',
    background: 'rgba(100, 116, 139, 0.2)',
    color: '#cbd5e1',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  },
  logBox: {
    marginTop: '12px',
    maxHeight: '240px',
    overflowY: 'auto',
    borderRadius: '14px',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    padding: '16px',
    background: 'rgba(15, 23, 42, 0.6)',
    fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
    fontSize: '12px',
    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)'
  },
  logLine: {
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    background: 'rgba(30, 41, 59, 0.6)',
    lineHeight: '1.6',
    fontWeight: '500',
    transition: 'background 0.2s ease',
    border: '1px solid rgba(148, 163, 184, 0.1)'
  },
  chatBox: {
    marginTop: '16px',
    maxHeight: '360px',
    overflowY: 'auto',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '16px',
    padding: '16px',
    background: 'rgba(15, 23, 42, 0.6)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)'
  },
  chatEmpty: {
    fontSize: '14px',
    color: '#64748b',
    textAlign: 'center',
    padding: '32px',
    fontStyle: 'italic',
    fontWeight: '500'
  },
  chatBubbleMe: {
    alignSelf: 'flex-end',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #ec4899 100%)',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: '20px 20px 6px 20px',
    maxWidth: '75%',
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
    marginBottom: '10px',
    fontWeight: '500'
  },
  chatBubblePeer: {
    alignSelf: 'flex-start',
    background: 'rgba(30, 41, 59, 0.8)',
    color: '#f1f5f9',
    padding: '12px 16px',
    borderRadius: '20px 20px 20px 6px',
    maxWidth: '75%',
    fontSize: '14px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    marginBottom: '10px',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    fontWeight: '500'
>>>>>>> 44486ae (Full Deployment)
  },
  chatMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
<<<<<<< HEAD
    marginBottom: '2px',
    opacity: 0.8
=======
    marginBottom: '6px',
    opacity: 0.85,
    fontWeight: '600',
    letterSpacing: '0.3px'
>>>>>>> 44486ae (Full Deployment)
  },
  chatText: {
    fontSize: '13px',
    wordBreak: 'break-word'
  },
  chatInput: {
    width: '100%',
<<<<<<< HEAD
    padding: '8px 10px',
    borderRadius: '4px',
    border: '1px solid #ced4da',
    resize: 'vertical',
    fontSize: '14px',
    boxSizing: 'border-box'
=======
    padding: '14px 18px',
    borderRadius: '14px',
    border: '2px solid rgba(148, 163, 184, 0.2)',
    resize: 'vertical',
    fontSize: '15px',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
    background: 'rgba(15, 23, 42, 0.6)',
    color: '#f1f5f9',
    fontWeight: '500',
    lineHeight: '1.5'
  },
  fileList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '320px',
    overflowY: 'auto',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '16px',
    padding: '16px',
    background: 'rgba(15, 23, 42, 0.6)',
    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)'
  },
  fileItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: '14px',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
  },
  fileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1
  },
  fileName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#f1f5f9',
    letterSpacing: '-0.2px',
    marginBottom: '4px'
  },
  fileSize: {
    fontSize: '13px',
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: '2px'
  },
  fileMeta: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500'
>>>>>>> 44486ae (Full Deployment)
  }
};

export default Dashboard;

