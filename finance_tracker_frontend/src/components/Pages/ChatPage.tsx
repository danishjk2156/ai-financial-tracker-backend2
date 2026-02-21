import React, { useState, useEffect, useRef } from 'react';
import { SendIcon, SparklesIcon } from '../Layout/Icons';
import type { ChatMessage } from '../Types';
import ConsentModal from '../Common/ConsentModal';
import { chat, voiceToText } from '../../api/endpoints';

interface ChatPageProps {
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const CONSENT_STORAGE_KEY = 'paisawise_ai_consent';

const ChatPage: React.FC<ChatPageProps> = ({ chatMessages, setChatMessages }) => {
  const [chatInput, setChatInput] = useState<string>('');
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const [isSending, setIsSending] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Check consent status on mount - show modal if not accepted
  useEffect(() => {
    const consentStatus = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (consentStatus === 'accepted') {
      // Consent already accepted, don't show modal
      // Consent already accepted, don't show modal
      setShowConsentModal(false);
    } else {
      // No consent or previously denied - show modal
      setShowConsentModal(true);
    }
  }, []);

  const handleAcceptConsent = () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted');
    setShowConsentModal(false);
  };

  const handleDenyConsent = () => {
    // Remove consent from storage so it asks again next time
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    setShowConsentModal(false);
  };

  const quickQuestions = [
    "How to save ₹100 daily?",
    "Can I afford this purchase?",
    "Am I overspending?",
    "Is my budget safe?",
    "Emergency fund tips?",
    "How to cut expenses?"
  ];

  const sendMessage = async () => {
    if (chatInput.trim() && !isSending) {
      if (showConsentModal) return;

      const userMessage: ChatMessage = { sender: 'user', text: chatInput };
      setChatMessages(prev => [...prev, userMessage]);
      setChatInput('');
      setIsSending(true);

      try {
        const res = await chat(chatInput);
        const aiMessage: ChatMessage = { sender: 'ai', text: res.reply };
        setChatMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error("Chat error:", error);
        setChatMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I'm having trouble connecting to the server." }]);
      } finally {
        setIsSending(false);
      }
    }
  };

  const startRecording = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          const res = await voiceToText(blob);
          if (res.text) {
            setChatInput(res.text);
            // Optionally auto-send:
            // sendMessage(); 
            // But for safer UX, let user review text first.
          }
        } catch (err) {
          console.error("Voice to text error:", err);
          setChatMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I couldn't hear that clearly." }]);
        } finally {
          setIsRecording(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
      setChatMessages(prev => [...prev, { sender: 'ai', text: "Please allow microphone access to use voice." }]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };


  const handleQuickQuestion = (question: string) => {
    setChatInput(question);
    setTimeout(() => sendMessage(), 100);
  };

  return (
    <div style={styles.profileContainer}>
      {showConsentModal && (
        <ConsentModal
          onAccept={handleAcceptConsent}
          onDeny={handleDenyConsent}
        />
      )}
      <div style={styles.chatContainer}>
        <div style={styles.chatHeader}>
          <div style={styles.chatHeaderFlex}>
            <div style={styles.chatAvatar}>
              <SparklesIcon />
            </div>
            <div>
              <h3 style={styles.chatTitle}>AI Money Coach</h3>
              <p style={styles.chatSubtitle}>Ask me anything about your finances</p>
            </div>
          </div>
        </div>

        <div style={styles.quickQuestions}>
          <p style={styles.quickQuestionsLabel}>Quick questions:</p>
          <div style={styles.quickQuestionsFlex}>
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleQuickQuestion(q)}
                style={styles.quickQuestionButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.borderColor = '#9ca3af';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.chatMessages}>
          {chatMessages.map((msg, i) => (
            <div key={i} style={msg.sender === 'user' ? styles.messageRight : styles.messageLeft}>
              <div style={msg.sender === 'user' ? styles.messageUser : styles.messageAi}>
                <p style={{ whiteSpace: 'pre-line', fontSize: '14px' }}>{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.chatInput}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              style={{ ...styles.input, flex: 1 }}
              placeholder={showConsentModal ? "Please respond to the consent request first..." : isRecording ? "Listening..." : "Ask me anything..."}
              disabled={showConsentModal || isRecording}
            />
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                ...styles.micButton,
                ...(isRecording ? styles.micButtonRecording : {}),
                opacity: showConsentModal ? 0.5 : 1,
                cursor: showConsentModal ? 'not-allowed' : 'pointer'
              }}
              disabled={showConsentModal}
              title={isRecording ? "Stop Recording" : "Start Voice Input"}
            >
              <span style={{ fontSize: '18px' }}>{isRecording ? '🟥' : '🎙️'}</span>
            </button>
            <button
              onClick={sendMessage}
              style={{ ...styles.sendButton, opacity: showConsentModal ? 0.5 : 1, cursor: showConsentModal ? 'not-allowed' : 'pointer' }}
              disabled={showConsentModal}
            >
              <SendIcon />
            </button>
          </div>
          <p style={styles.chatHint}>Press Enter to send • Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  profileContainer: {
    maxWidth: '768px',
    margin: '0 auto',
  },
  chatContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '600px',
  },
  chatHeader: {
    backgroundColor: '#16a34a',
    color: 'white',
    padding: '24px',
  },
  chatHeaderFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  chatAvatar: {
    width: '48px',
    height: '48px',
    backgroundColor: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#16a34a',
  },
  chatTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  chatSubtitle: {
    fontSize: '14px',
    color: '#bbf7d0',
  },
  quickQuestions: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    maxHeight: '120px',
    overflowY: 'auto',
  },
  quickQuestionsLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '12px',
  },
  quickQuestionsFlex: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    alignItems: 'flex-start',
  },
  quickQuestionButton: {
    flexShrink: 0,
    fontSize: '13px',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    padding: '10px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
    color: '#374151',
    fontWeight: 500,
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  messageLeft: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  messageRight: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  messageAi: {
    maxWidth: '80%',
    borderRadius: '16px',
    padding: '12px 16px',
    backgroundColor: '#f3f4f6',
    color: '#111827',
  },
  messageUser: {
    maxWidth: '80%',
    borderRadius: '16px',
    padding: '12px 16px',
    backgroundColor: '#16a34a',
    color: 'white',
  },
  chatInput: {
    padding: '16px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: 'white',
  },
  inputGroup: {
    display: 'flex',
    gap: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s',
    outline: 'none',
  },
  sendButton: {
    backgroundColor: '#16a34a',
    color: 'white',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  chatHint: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '8px',
  },
  micButton: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    border: '1px solid #d1d5db',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  micButtonRecording: {
    background: '#fee2e2',
    borderColor: '#ef4444',
    color: '#dc2626',
    animation: 'pulse 1.5s infinite',
  },
};

export default ChatPage;