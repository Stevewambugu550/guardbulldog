import React, { useState, useEffect, useRef } from 'react';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    fetchMessages();
    fetchAdmins();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/api/messages/user`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_URL}/api/messages/admins`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins || []);
        if (data.admins?.length > 0) setSelectedAdmin(data.admins[0]);
      }
    } catch (err) {
      console.error('Error fetching admins:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedAdmin) return;

    try {
      const res = await fetch(`${API_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          receiver_id: selectedAdmin.id,
          subject: subject || 'User Message',
          content: newMessage
        })
      });

      if (res.ok) {
        toast.success('Message sent!');
        setNewMessage('');
        setSubject('');
        fetchMessages();
      } else {
        toast.error('Failed to send message');
      }
    } catch (err) {
      toast.error('Error sending message');
    }
  };

  const filteredMessages = selectedAdmin 
    ? messages.filter(m => m.sender_id === selectedAdmin.id || m.receiver_id === selectedAdmin.id)
    : messages;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold flex items-center">
          <ChatBubbleLeftRightIcon className="h-8 w-8 mr-3" />
          Messages
        </h1>
        <p className="text-blue-100 mt-1">Communicate with the security team</p>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Admin List */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-700">Security Team</h3>
          </div>
          <div className="divide-y">
            {admins.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                <UserCircleIcon className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                No admins available
              </div>
            ) : (
              admins.map((admin, i) => (
                <button
                  key={admin.id || i}
                  onClick={() => setSelectedAdmin(admin)}
                  className={`w-full p-4 text-left hover:bg-blue-50 transition flex items-center ${
                    selectedAdmin?.id === admin.id ? 'bg-blue-100' : ''
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mr-3 flex-shrink-0">
                    {admin.firstName?.[0]}{admin.lastName?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{admin.firstName} {admin.lastName}</p>
                    <p className="text-xs text-gray-500">Security Admin</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow overflow-hidden flex flex-col" style={{ minHeight: '500px' }}>
          {!selectedAdmin ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Select an admin to chat</p>
                <p className="text-sm">Click on any admin from the list</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center font-bold mr-3">
                  {selectedAdmin.firstName?.[0]}{selectedAdmin.lastName?.[0]}
                </div>
                <div>
                  <p className="text-white font-semibold">{selectedAdmin.firstName} {selectedAdmin.lastName}</p>
                  <p className="text-blue-200 text-sm">Security Administrator</p>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3" style={{ maxHeight: '350px' }}>
                {filteredMessages.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-3" />
                    <p className="font-medium">No messages yet</p>
                    <p className="text-sm">Send a message to start the conversation</p>
                  </div>
                ) : (
                  <>
                    {filteredMessages.map((msg, i) => (
                      <div key={msg.id || i} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          msg.sender_id === user?.id 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white border shadow-sm'
                        }`}>
                          {msg.subject && (
                            <p className={`font-semibold text-sm mb-1 ${msg.sender_id === user?.id ? 'text-blue-100' : 'text-gray-600'}`}>
                              {msg.subject}
                            </p>
                          )}
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-2 ${msg.sender_id === user?.id ? 'text-blue-200' : 'text-gray-400'}`}>
                            {msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-white">
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Subject (optional)"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  />
                  <div className="flex gap-3">
                    <textarea
                      placeholder="Type your message here..."
                      rows={2}
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none"
                      required
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center self-end disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
