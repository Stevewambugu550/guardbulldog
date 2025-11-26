import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { UsersIcon, DocumentTextIcon, ShieldCheckIcon, TrashIcon, PlusIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'user', password: '' });
  const [messageContent, setMessageContent] = useState({ subject: '', content: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const getToken = () => localStorage.getItem('token');
  const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, reportsRes, messagesRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/users`, { headers: headers() }),
        fetch(`${API_URL}/api/admin/reports`, { headers: headers() }),
        fetch(`${API_URL}/api/messages/admin/all`, { headers: headers() })
      ]);
      if (usersRes.ok) setUsers((await usersRes.json()).users || []);
      if (reportsRes.ok) setReports((await reportsRes.json()).reports || []);
      if (messagesRes.ok) setMessages((await messagesRes.json()).messages || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, { method: 'POST', headers: headers(), body: JSON.stringify(newUser) });
      if (res.ok) { toast.success('User added!'); setShowAddUser(false); setNewUser({ firstName: '', lastName: '', email: '', phone: '', role: 'user', password: '' }); fetchData(); }
      else { const d = await res.json(); toast.error(d.message || 'Failed'); }
    } catch (err) { toast.error('Error adding user'); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}`, { method: 'DELETE', headers: headers() });
      if (res.ok) { toast.success('User deleted!'); setUsers(users.filter(u => u.id !== userId)); }
      else toast.error('Failed to delete');
    } catch (err) { toast.error('Error'); }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      await fetch(`${API_URL}/api/admin/users/${userId}/role`, { method: 'PUT', headers: headers(), body: JSON.stringify({ role }) });
      toast.success('Role updated!'); setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
    } catch (err) { toast.error('Error'); }
  };

  const handleUpdateStatus = async (reportId, status) => {
    try {
      await fetch(`${API_URL}/api/reports/${reportId}/status`, { method: 'PUT', headers: headers(), body: JSON.stringify({ status }) });
      toast.success('Status updated!'); setReports(reports.map(r => r.id === reportId ? { ...r, status } : r));
    } catch (err) { toast.error('Error'); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const res = await fetch(`${API_URL}/api/messages/admin/send`, { method: 'POST', headers: headers(), body: JSON.stringify({ user_id: selectedUser.id, ...messageContent }) });
      if (res.ok) { toast.success('Message sent!'); setShowMessage(false); setMessageContent({ subject: '', content: '' }); fetchData(); }
    } catch (err) { toast.error('Failed to send'); }
  };

  const filteredReports = reports.filter(r => (filterStatus === 'all' || r.status === filterStatus) && (!searchTerm || r.emailSubject?.toLowerCase().includes(searchTerm.toLowerCase()) || r.senderEmail?.toLowerCase().includes(searchTerm.toLowerCase())));
  const filteredUsers = users.filter(u => !searchTerm || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase()));
  const stats = { users: users.length, reports: reports.length, pending: reports.filter(r => r.status === 'pending').length, resolved: reports.filter(r => r.status === 'resolved').length, messages: messages.length };

  if (loading) return <div className="flex items-center justify-center h-64"><ArrowPathIcon className="h-12 w-12 text-purple-600 animate-spin" /><span className="ml-3">Loading...</span></div>;

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white flex justify-between items-center">
        <div><h1 className="text-2xl font-bold flex items-center"><ShieldCheckIcon className="h-8 w-8 mr-3" />Admin Control Panel</h1><p className="text-purple-100">Manage users, reports & communications</p></div>
        <button onClick={fetchData} className="p-3 bg-white/20 rounded-xl hover:bg-white/30"><ArrowPathIcon className="h-6 w-6" /></button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow p-1 flex gap-1">
        {['overview', 'users', 'reports', 'messages'].map(t => (
          <button key={t} onClick={() => { setActiveTab(t); setSearchTerm(''); }} className={`flex-1 py-3 px-4 rounded-lg font-medium capitalize ${activeTab === t ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            {t === 'overview' ? '📊' : t === 'users' ? '👥' : t === 'reports' ? '📋' : '💬'} {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500"><UsersIcon className="h-8 w-8 text-blue-500" /><p className="text-3xl font-bold mt-2">{stats.users}</p><p className="text-gray-500 text-sm">Total Users</p></div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-orange-500"><DocumentTextIcon className="h-8 w-8 text-orange-500" /><p className="text-3xl font-bold mt-2">{stats.reports}</p><p className="text-gray-500 text-sm">Total Reports</p></div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-yellow-500"><ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" /><p className="text-3xl font-bold mt-2">{stats.pending}</p><p className="text-gray-500 text-sm">Pending</p></div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500"><CheckCircleIcon className="h-8 w-8 text-green-500" /><p className="text-3xl font-bold mt-2">{stats.resolved}</p><p className="text-gray-500 text-sm">Resolved</p></div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-purple-500"><ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-500" /><p className="text-3xl font-bold mt-2">{stats.messages}</p><p className="text-gray-500 text-sm">Messages</p></div>
        </div>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <input type="text" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg" />
            <button onClick={() => setShowAddUser(true)} className="px-6 py-2 bg-purple-600 text-white rounded-lg flex items-center hover:bg-purple-700"><PlusIcon className="h-5 w-5 mr-2" />Add User</button>
          </div>
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Name</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Email</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Phone</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Role</th><th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">Actions</th></tr></thead>
              <tbody>{filteredUsers.length === 0 ? <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No users found</td></tr> : filteredUsers.map((u, i) => (
                <tr key={u.id || i} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4"><div className="flex items-center"><div className="h-10 w-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold mr-3">{u.firstName?.[0]}{u.lastName?.[0]}</div><span className="font-medium">{u.firstName} {u.lastName}</span></div></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.phone || '-'}</td>
                  <td className="px-6 py-4"><select value={u.role || 'user'} onChange={e => handleUpdateRole(u.id, e.target.value)} className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}><option value="user">User</option><option value="admin">Admin</option><option value="super_admin">Super Admin</option></select></td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => { setSelectedUser(u); setShowMessage(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Send message"><ChatBubbleLeftRightIcon className="h-5 w-5" /></button>
                    <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete user"><TrashIcon className="h-5 w-5" /></button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <input type="text" placeholder="Search reports..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 border rounded-lg"><option value="all">All Status</option><option value="pending">Pending</option><option value="investigating">Investigating</option><option value="confirmed">Confirmed</option><option value="resolved">Resolved</option></select>
          </div>
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-semibold">Subject</th><th className="px-6 py-3 text-left text-xs font-semibold">Sender</th><th className="px-6 py-3 text-left text-xs font-semibold">Type</th><th className="px-6 py-3 text-left text-xs font-semibold">Status</th><th className="px-6 py-3 text-left text-xs font-semibold">Date</th></tr></thead>
              <tbody>{filteredReports.length === 0 ? <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No reports yet. Users will submit phishing reports here.</td></tr> : filteredReports.map((r, i) => (
                <tr key={r.id || i} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium max-w-xs truncate">{r.emailSubject || r.email_subject || 'No Subject'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.senderEmail || r.sender_email || '-'}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{r.reportType || r.report_type || 'phishing'}</span></td>
                  <td className="px-6 py-4"><select value={r.status} onChange={e => handleUpdateStatus(r.id, e.target.value)} className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : r.status === 'resolved' ? 'bg-green-100 text-green-800' : r.status === 'confirmed' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}><option value="pending">Pending</option><option value="investigating">Investigating</option><option value="confirmed">Confirmed</option><option value="resolved">Resolved</option></select></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.createdAt || r.created_at ? new Date(r.createdAt || r.created_at).toLocaleDateString() : '-'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* Messages */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center"><ChatBubbleLeftRightIcon className="h-6 w-6 mr-2 text-purple-600" />User Communications</h2>
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500"><ChatBubbleLeftRightIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" /><p className="text-lg">No messages yet</p><p className="text-sm">Send a message to users from the Users tab</p></div>
          ) : (
            <div className="space-y-3">{messages.map((m, i) => (
              <div key={m.id || i} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start"><div><p className="font-medium">{m.subject || 'No Subject'}</p><p className="text-sm text-gray-600">{m.content}</p></div><span className="text-xs text-gray-400">{m.created_at ? new Date(m.created_at).toLocaleDateString() : ''}</span></div>
                <div className="mt-2 text-xs text-gray-500">From: {m.sender_first_name} {m.sender_last_name} → To: {m.receiver_first_name} {m.receiver_last_name}</div>
              </div>
            ))}</div>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 flex items-center"><PlusIcon className="h-6 w-6 mr-2 text-purple-600" />Add New User</h2>
            <form onSubmit={handleAddUser} className="space-y-3">
              <div className="grid grid-cols-2 gap-3"><input type="text" required placeholder="First Name" value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} className="px-4 py-2 border rounded-lg" /><input type="text" required placeholder="Last Name" value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} className="px-4 py-2 border rounded-lg" /></div>
              <input type="email" required placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              <input type="tel" placeholder="Phone (optional)" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full px-4 py-2 border rounded-lg"><option value="user">User</option><option value="admin">Admin</option></select>
              <input type="password" required placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowAddUser(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Add User</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showMessage && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 flex items-center"><PaperAirplaneIcon className="h-6 w-6 mr-2 text-blue-600" />Message {selectedUser.firstName}</h2>
            <form onSubmit={handleSendMessage} className="space-y-3">
              <input type="text" required placeholder="Subject" value={messageContent.subject} onChange={e => setMessageContent({...messageContent, subject: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              <textarea required placeholder="Your message..." rows={4} value={messageContent.content} onChange={e => setMessageContent({...messageContent, content: e.target.value})} className="w-full px-4 py-2 border rounded-lg resize-none" />
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => { setShowMessage(false); setSelectedUser(null); }} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Send</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
