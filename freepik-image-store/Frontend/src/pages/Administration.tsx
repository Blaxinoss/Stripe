import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

type Props = {}

type User = {
  _id: string;
  username: string;
  coins: number;
};

export default function Administration({}: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState(0);
  const { user, token } = useAuth();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/users`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setUsers(res.data.users);
    } catch (error) {
      setMessage('Failed to fetch users.');
      setMessageType('error');
    }
  };

  const handleAddCoins = async () => {
    if (!selectedUserId || amount <= 0) {
      setMessage('Please select a user and enter a valid amount.');
      setMessageType('error');
      return;
    }
    
    setShowConfirm(false);
    
    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/coins/increase_coins/${selectedUserId}`,
        { amount },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      setMessage(res.data.message);
      setMessageType('success');
      
      // Update the local user data
      setUsers(prev => prev.map(u => 
        u._id === selectedUserId 
          ? { ...u, coins: u.coins + amount }
          : u
      ));
      
      // Reset form
      setAmount(0);
      
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Error adding coins.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCoins = users.reduce((sum, user) => sum + user.coins, 0);
  const averageCoins = users.length > 0 ? Math.round(totalCoins / users.length) : 0;

  useEffect(() => {
    fetchUsers();
  }, [user]);

  useEffect(() => {
    const selected = users.find(u => u._id === selectedUserId);
    setSelectedUser(selected || null);
  }, [selectedUserId, users]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-2xl">
            <span className="text-3xl">⚙️</span>
          </div>
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 mb-4 tracking-tight">
            Command Center
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Advanced user management and coin distribution system
          </p>
          
          {/* Admin Badge */}
          <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full backdrop-blur-sm">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            <span className="text-yellow-300 font-semibold text-sm">Administrator Access</span>
            <span className="text-lg">👑</span>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-6 hover:border-indigo-400/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Total Users</span>
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-3xl font-bold text-indigo-400">{users.length}</div>
            <div className="text-xs text-slate-500 mt-1">Registered accounts</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 hover:border-purple-400/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Total Coins</span>
              <span className="text-2xl">🪙</span>
            </div>
            <div className="text-3xl font-bold text-purple-400">{totalCoins.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">In circulation</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 hover:border-blue-400/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Average Coins</span>
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-blue-400">{averageCoins}</div>
            <div className="text-xs text-slate-500 mt-1">Per user</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - User Selection */}
          <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-indigo-500/30 transition-all duration-500">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-2xl">👤</span>
              User Management
            </h2>

            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/50 to-purple-600/50 rounded-2xl blur opacity-75"></div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="relative w-full bg-slate-900/90 border border-indigo-500/50 rounded-2xl px-6 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* User Selection */}
            <div className="mb-6">
              <label className="block text-slate-300 font-semibold mb-3">
                Select Target User:
              </label>
              <div className="relative">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-600 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-800">-- Choose a user --</option>
                  {filteredUsers.map((user) => (
                    <option key={user._id} value={user._id} className="bg-slate-800">
                      {user.username} ({user.coins} coins)
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Selected User Info */}
            {selectedUser && (
              <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-2xl p-4 mb-6">
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  <span className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-sm">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </span>
                  {selectedUser.username}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Current Balance:</span>
                    <div className="text-indigo-300 font-bold flex items-center gap-1">
                      <span>🪙</span>
                      {selectedUser.coins.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">User ID:</span>
                    <div className="text-slate-300 font-mono text-xs break-all">
                      {selectedUser._id}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-slate-300 font-semibold mb-3">
                Coins to Distribute:
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={1}
                  max={10000}
                  className="w-full bg-slate-900/90 border border-slate-600 rounded-2xl px-6 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                  placeholder="Enter coin amount (1-10,000)"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <span className="text-yellow-400 text-lg">🪙</span>
                </div>
              </div>
              {amount > 0 && selectedUser && (
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-2">
                  <span>💰</span>
                  New balance will be: <span className="text-green-400 font-bold">{(selectedUser.coins + amount).toLocaleString()}</span>
                </p>
              )}
            </div>
          </div>

          {/* Right Panel - Action Center */}
          <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-purple-500/30 transition-all duration-500">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-2xl">🚀</span>
              Action Center
            </h2>

            {/* Preview Card */}
            {selectedUser && amount > 0 && (
              <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-2xl p-6 mb-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  Transaction Preview
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target User:</span>
                    <span className="text-white font-semibold">{selectedUser.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Balance:</span>
                    <span className="text-indigo-300">{selectedUser.coins.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount to Add:</span>
                    <span className="text-green-400 font-bold">+{amount.toLocaleString()}</span>
                  </div>
                  <hr className="border-slate-600" />
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-semibold">New Balance:</span>
                    <span className="text-green-300 font-bold text-lg">{(selectedUser.coins + amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={() => setShowConfirm(true)}
              disabled={!selectedUserId || amount <= 0 || loading}
              className="w-full mb-6 relative group bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-500 hover:via-purple-500 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center justify-center gap-3 text-lg">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Transaction...
                  </>
                ) : (
                  <>
                    <span className="text-2xl">💰</span>
                    Distribute Coins
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
            </button>

            {/* Status Messages */}
            {message && (
              <div className={`p-4 rounded-2xl backdrop-blur-sm border ${
                messageType === 'success' 
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' 
                  : 'bg-red-500/20 border-red-500/50 text-red-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    messageType === 'success' ? 'bg-emerald-500' : 'bg-red-500'
                  }`}>
                    {messageType === 'success' ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {messageType === 'success' ? 'Success!' : 'Error Occurred'}
                    </p>
                    <p className="text-sm opacity-90">{message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span>⚡</span>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAmount(100)}
                  className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-xl transition-all duration-300 text-sm font-medium"
                >
                  +100 Coins
                </button>
                <button
                  onClick={() => setAmount(500)}
                  className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-xl transition-all duration-300 text-sm font-medium"
                >
                  +500 Coins
                </button>
                <button
                  onClick={() => setAmount(1000)}
                  className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-xl transition-all duration-300 text-sm font-medium"
                >
                  +1,000 Coins
                </button>
                <button
                  onClick={() => setAmount(5000)}
                  className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-xl transition-all duration-300 text-sm font-medium"
                >
                  +5,000 Coins
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="mt-12">
          <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-2xl">📊</span>
              User Overview ({users.length})
            </h2>
            
            <div className="overflow-hidden rounded-2xl border border-slate-600">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Balance</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-600">
                    {filteredUsers.map((user, _) => (
                      <tr key={user._id} className="hover:bg-slate-700/30 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-white">{user.username}</div>
                              <div className="text-xs text-slate-400 font-mono">{user._id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400">🪙</span>
                            <span className="text-white font-bold">{user.coins.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.coins > 1000 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : user.coins > 100
                              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {user.coins > 1000 ? 'Wealthy' : user.coins > 100 ? 'Moderate' : 'Low Balance'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedUserId(user._id)}
                            className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors duration-200"
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
            
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl max-w-md w-full backdrop-blur-xl">
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Confirm Transaction
                  </h2>
                  <p className="text-slate-400 text-sm">This action cannot be undone</p>
                </div>

                <div className="bg-slate-800/50 border border-indigo-500/30 rounded-2xl p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">User:</span>
                      <span className="text-white font-semibold">{selectedUser.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Add Amount:</span>
                      <span className="text-green-400 font-bold">+{amount.toLocaleString()} coins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">New Balance:</span>
                      <span className="text-green-300 font-bold">{(selectedUser.coins + amount).toLocaleString()} coins</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-2xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCoins}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-500 hover:via-purple-500 hover:to-blue-500 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span>✅</span>
                      Confirm
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}