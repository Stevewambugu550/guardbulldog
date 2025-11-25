import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  UsersIcon, DocumentTextIcon, ShieldCheckIcon, TrashIcon, PlusIcon,
  CheckCircleIcon, XCircleIcon, EyeIcon, MagnifyingGlassIcon,
  ExclamationTriangleIcon, ArrowPathIcon, ChartBarIcon
} from '@heroicons/react/24/outline';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'user', department: '', password: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const usersRes = await fetch(`${API_URL}/api/admin/users`, { headers });
      if (usersRes.ok) setUsers((await usersRes.json()).users || []);
      const reportsRes = await fetch(`${API_URL}/api/admin/reports`, { headers });
      if (reportsRes.ok) setReports((await reportsRes.json()).reports || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/users`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newUser)
      });
      if (res.ok) { toast.success('User added!'); setShowAddUser(false); fetchData(); }
      else toast.error('Failed to add user');
    } catch (err) { toast.error('Error'); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/users/${userId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { toast.success('Deleted!'); setUsers(users.filter(u => u.id !== userId)); }
    } catch (err) { toast.error('Error'); }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });
      toast.success('Updated!'); setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) { toast.error('Error'); }
  };

  const handleUpdateStatus = async (reportId, status) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/reports/${reportId}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      toast.success('Updated!'); setReports(reports.map(r => r.id === reportId ? { ...r, status } : r));
    } catch (err) { toast.error('Error'); }
  };

  const filteredReports = reports.filter(r => (filterStatus === 'all' || r.status === filterStatus) && (!searchTerm || r.emailSubject?.toLowerCase().includes(searchTerm.toLowerCase())));
  const filteredUsers = users.filter(u => !searchTerm || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase()));
  const stats = { totalUsers: users.length, totalReports: reports.length, pending: reports.filter(r => r.status === 'pending').length, resolved: reports.filter(r => r.status === 'resolved').length };

  if (loading) return <div className="flex items-center justify-center h-64"><ArrowPathIcon className="h-12 w-12 text-blue-600 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold flex items-center"><ShieldCheckIcon className="h-8 w-8 mr-3" />Admin Control Panel</h1>
        <p className="text-purple-100 mt-1">Manage users, reports, and system</p>
      </div>

      <div className="bg-white rounded-xl shadow p-1 flex space-x-1">
        {['overview', 'users', 'reports'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 px-4 rounded-lg font-medium ${activeTab === tab ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            {tab === 'overview' ? '📊 Overview' : tab === 'users' ? '👥 Users' : '📋 Reports'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500"><UsersIcon className="h-8 w-8 text-blue-500" /><p className="text-3xl font-bold">{stats.totalUsers}</p><p className="text-sm text-gray-500">Users</p></div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-orange-500"><DocumentTextIcon className="h-8 w-8 text-orange-500" /><p className="text-3xl font-bold">{stats.totalReports}</p><p className="text-sm text-gray-500">Reports</p></div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-yellow-500"><ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" /><p className="text-3xl font-bold">{stats.pending}</p><p className="text-sm text-gray-500">Pending</p></div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500"><CheckCircleIcon className="h-8 w-8 text-green-500" /><p className="text-3xl font-bold">{stats.resolved}</p><p className="text-sm text-gray-500">Resolved</p></div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <input type="text" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 px-4 py-2 border rounded-lg" />
            <button onClick={() => setShowAddUser(true)} className="px-6 py-2 bg-purple-600 text-white rounded-lg flex items-center"><PlusIcon className="h-5 w-5 mr-2" />Add User</button>
          </div>
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">User</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Email</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Phone</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Role</th><th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">Actions</th></tr></thead>
              <tbody>{filteredUsers.map((u, i) => (
                <tr key={u.id || i} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 flex items-center"><div className="h-10 w-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold mr-3">{u.firstName?.[0]}{u.lastName?.[0]}</div>{u.firstName} {u.lastName}</td>
                  <td className="px-6 py-4 text-sm">{u.email}</td>
                  <td className="px-6 py-4 text-sm">{u.phone || '-'}</td>
                  <td className="px-6 py-4"><select value={u.role || 'user'} onChange={e => handleUpdateRole(u.id, e.target.value)} className="px-2 py-1 rounded-full text-xs bg-blue-100"><option value="user">User</option><option value="admin">Admin</option></select></td>
                  <td className="px-6 py-4 text-right"><button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><TrashIcon className="h-5 w-5" /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 px-4 py-2 border rounded-lg" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 border rounded-lg"><option value="all">All</option><option value="pending">Pending</option><option value="resolved">Resolved</option><option value="confirmed">Confirmed</option></select>
          </div>
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-semibold">Subject</th><th className="px-6 py-3 text-left text-xs font-semibold">Sender</th><th className="px-6 py-3 text-left text-xs font-semibold">Type</th><th className="px-6 py-3 text-left text-xs font-semibold">Status</th><th className="px-6 py-3 text-left text-xs font-semibold">Date</th></tr></thead>
              <tbody>{filteredReports.map((r, i) => (
                <tr key={r.id || i} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{r.emailSubject || 'No Subject'}</td>
                  <td className="px-6 py-4 text-sm">{r.senderEmail}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{r.reportType}</span></td>
                  <td className="px-6 py-4"><select value={r.status} onChange={e => handleUpdateStatus(r.id, e.target.value)} className={`px-2 py-1 rounded-full text-xs ${r.status === 'pending' ? 'bg-yellow-100' : r.status === 'resolved' ? 'bg-green-100' : 'bg-red-100'}`}><option value="pending">Pending</option><option value="investigating">Investigating</option><option value="confirmed">Confirmed</option><option value="resolved">Resolved</option></select></td>
                  <td className="px-6 py-4 text-sm">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}</tbody>
            </table>
            {filteredReports.length === 0 && <div className="p-8 text-center text-gray-500">No reports</div>}
          </div>
        </div>
      )}

      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold mb-6">Add New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required placeholder="First Name" value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} className="px-4 py-2 border rounded-lg" />
                <input type="text" required placeholder="Last Name" value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} className="px-4 py-2 border rounded-lg" />
              </div>
              <input type="email" required placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              <input type="tel" placeholder="Phone Number" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full px-4 py-2 border rounded-lg"><option value="user">User</option><option value="admin">Admin</option></select>
              <input type="password" required placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowAddUser(false)} className="flex-1 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-purple-600 text-white rounded-lg">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
