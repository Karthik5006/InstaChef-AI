import React, { useState } from 'react';

function ChatInterface({ onSend, isLoading, error }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'agent', text: 'Hi! What would you like to cook today? E.g. "I want to cook Dum Biryani for 4 people"' }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', text: input }]);
    onSend(input);
    setInput('');
  };

  return (
    <div className="glass-card">
      <h3>Ask the Agent</h3>
      <div className="chat-log">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.role === 'user' ? 'chat-user' : 'chat-agent'}`}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="chat-bubble chat-agent">
            <span className="loader"></span> Working on it...
          </div>
        )}
        {error && (
          <div className="chat-bubble chat-agent" style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239,68,68,0.5)' }}>
            ⚠️ Error: {error}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <input 
          type="text" 
          className="input-text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="E.g., I want to make Butter Chicken..."
          disabled={isLoading}
        />
        <button type="submit" className="btn" disabled={isLoading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatInterface;
