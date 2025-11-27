import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

const API_URL = process.env.REACT_APP_API_URL || '';

const ChatWindow = ({ closeChat }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to GUARDBULLDOG Support! 🛡️ How can I help you with phishing protection today?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Try Netlify function first, then fallback to local API
      const chatEndpoint = API_URL ? `${API_URL}/api/chat` : '/.netlify/functions/chat';
      const response = await axios.post(chatEndpoint, {
        message: input,
        history: messages,
      });

      const aiResponse = response.data.reply;

      if (aiResponse === 'AGENT_ESCALATION') {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'It looks like you need more help. I am connecting you to a live agent. Please email security@bowie.edu for immediate assistance.' },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: aiResponse },
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Provide helpful fallback responses
      const fallbackResponses = [
        "I can help you with phishing-related questions! Common signs of phishing include:\n• Urgent requests for personal information\n• Suspicious sender email addresses\n• Misspelled words or poor grammar\n• Links that don't match the displayed text",
        "To report a phishing email, go to 'Report Phishing' in the dashboard and provide details about the suspicious email including the sender's address and any suspicious links.",
        "If you suspect you've been phished, immediately change your password, enable two-factor authentication, and report the incident to IT Security at security@bowie.edu"
      ];
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: randomResponse },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-80 h-96 bg-white rounded-lg shadow-xl mb-4 flex flex-col">
      <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
        <h3 className="font-bold text-lg">Support Chat</h3>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
              Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-2 border-t border-gray-200 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="ml-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          disabled={isLoading}>
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
