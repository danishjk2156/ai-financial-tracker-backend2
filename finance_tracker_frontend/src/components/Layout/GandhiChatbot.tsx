import React, { useState, useRef } from 'react';
import { chat, voiceToText } from '../../api/endpoints';
import type { ChatMessage } from '../Types';

const GandhiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "Namaste! 🙏\n\nI'm your Gandhi-inspired money guide.\nAsk me anything about savings, expenses, or smart financial decisions.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [logoError, setLogoError] = useState(false);

  // Put your provided Gandhi image at: finance_tracker_frontend/public/gandhi.png
  const logoSrc = '/gandhi.png';

  const toggleOpen = () => setIsOpen(prev => !prev);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const newUserMessage: ChatMessage = { sender: 'user', text: trimmed };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsSending(true);

    try {
      const res = await chat(trimmed);
      const reply: ChatMessage = { sender: 'ai', text: res.reply };
      setMessages(prev => [...prev, reply]);
    } catch (e) {
      const errorMessage: ChatMessage = {
        sender: 'ai',
        text: 'Sorry, I could not connect to the Gandhi chatbot right now. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
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
          setInput(res.text || '');
        } catch {
          setMessages(prev => [
            ...prev,
            {
              sender: 'ai',
              text: 'I could not understand the audio. Please try again or type your question.',
            },
          ]);
        } finally {
          setIsRecording(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Microphone access is blocked. Please allow microphone permission and try again.',
        },
      ]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={toggleOpen}
        style={styles.fab}
      >
        <div style={styles.fabIcon}>
          {!logoError ? (
            <img
              src={logoSrc}
              alt="Gandhi"
              style={styles.logoImg}
              onError={() => setLogoError(true)}
            />
          ) : (
            <span>🕉️</span>
          )}
        </div>
        <div style={styles.fabText}>
          <div style={styles.fabTitle}>Gandhi Chat</div>
          <div style={styles.fabSubtitle}>Ask about your money</div>
        </div>
      </button>
    );
  }

  return (
    <div style={styles.wrapper}>
      <style>{`
        @keyframes gandhiPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220,38,38,0.6); }
          70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(220,38,38,0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220,38,38,0); }
        }
      `}</style>
      <div style={styles.chatWindow}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>
              {!logoError ? (
                <img
                  src={logoSrc}
                  alt="Gandhi"
                  style={styles.logoImg}
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span>🕉️</span>
              )}
            </div>
            <div>
              <div style={styles.headerTitle}>Gandhi Chatbot</div>
              <div style={styles.headerSubtitle}>Namaste! How can I guide you today?</div>
            </div>
          </div>
          <button type="button" onClick={toggleOpen} style={styles.closeButton}>
            ✕
          </button>
        </div>

        <div style={styles.messages}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={m.sender === 'user' ? styles.messageRowUser : styles.messageRowAi}
            >
              <div style={m.sender === 'user' ? styles.bubbleUser : styles.bubbleAi}>
                <pre style={styles.messageText}>{m.text}</pre>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.inputBar}>
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            style={{
              ...styles.micButton,
              ...(isRecording ? styles.micButtonRecording : {}),
            }}
            title={isRecording ? 'Stop recording' : 'Start voice input'}
          >
            <span style={styles.micIconText}>{isRecording ? '🎙️' : '🎤'}</span>
          </button>
          <input
            style={styles.input}
            placeholder="Type or use the mic…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={isSending}
            style={styles.sendButton}
          >
            {isSending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    position: 'fixed',
    right: 20,
    bottom: 20,
    zIndex: 50,
  },
  chatWindow: {
    width: 360,
    maxHeight: 520,
    background: '#ffffff',
    borderRadius: 16,
    boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: 'white',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.15))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.55)',
    boxShadow: '0 6px 14px rgba(0,0,0,0.18)',
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 9999,
    transform: 'scale(1.18)',
    filter: 'contrast(1.05) saturate(1.05)',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 700,
  },
  headerSubtitle: {
    fontSize: 11,
    opacity: 0.9,
  },
  closeButton: {
    border: 'none',
    background: 'transparent',
    color: 'white',
    fontSize: 16,
    cursor: 'pointer',
  },
  messages: {
    padding: 12,
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#fff7ed',
  },
  messageRowUser: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  messageRowAi: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  bubbleUser: {
    maxWidth: '80%',
    background: '#f97316',
    color: 'white',
    borderRadius: 16,
    padding: '8px 12px',
    fontSize: 13,
    whiteSpace: 'pre-wrap',
  },
  bubbleAi: {
    maxWidth: '80%',
    background: '#ffffff',
    color: '#1f2933',
    borderRadius: 16,
    padding: '8px 12px',
    fontSize: 13,
    whiteSpace: 'pre-wrap',
    border: '1px solid #fed7aa',
  },
  messageText: {
    margin: 0,
    fontFamily: 'inherit',
    whiteSpace: 'pre-wrap',
  },
  inputBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderTop: '1px solid #fee2e2',
    backgroundColor: '#fff7ed',
  },
  input: {
    flex: 1,
    borderRadius: 9999,
    border: '1px solid #fecaca',
    padding: '8px 12px',
    fontSize: 13,
    outline: 'none',
  },
  sendButton: {
    borderRadius: 9999,
    border: 'none',
    background: '#ea580c',
    color: 'white',
    padding: '8px 12px',
    fontSize: 13,
    cursor: 'pointer',
  },
  micButton: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    border: 'none',
    background: '#f97316',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
  },
  micButtonRecording: {
    background: '#dc2626',
    boxShadow: '0 0 0 0 rgba(220,38,38,0.7)',
    animation: 'gandhiPulse 1.2s infinite',
  },
  micIconText: {
    fontSize: 16,
    lineHeight: 1,
  },
  fab: {
    position: 'fixed',
    right: 20,
    bottom: 20,
    zIndex: 40,
    borderRadius: 9999,
    border: 'none',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: 'white',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 18px 30px rgba(0,0,0,0.3)',
    cursor: 'pointer',
  },
  fabIcon: {
    width: 28,
    height: 28,
    borderRadius: 9999,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.15))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.55)',
    boxShadow: '0 6px 14px rgba(0,0,0,0.18)',
  },
  fabText: {
    display: 'flex',
    flexDirection: 'column',
  },
  fabTitle: {
    fontSize: 13,
    fontWeight: 700,
  },
  fabSubtitle: {
    fontSize: 11,
    opacity: 0.9,
  },
};

export default GandhiChatbot;


