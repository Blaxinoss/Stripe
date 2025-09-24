import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCoins } from '../context/CoinsContextProvider';
import { useState, useEffect } from 'react';

const ProfilerUser = () => {
  const { user } = useAuth();
  const { coins } = useCoins();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  const profileStats = [
    { 
      label: 'Email Address', 
      value: user.email, 
      icon: '📧', 
      color: 'from-slate-400 to-slate-300',
      bgColor: 'bg-slate-700/30 border-slate-600/50'
    },
    { 
      label: 'Username', 
      value: user.username, 
      icon: '👤', 
      color: 'from-slate-400 to-slate-300',
      bgColor: 'bg-slate-700/30 border-slate-600/50'
    },
    { 
      label: 'Role', 
      value: user.role.charAt(0).toUpperCase() + user.role.slice(1), 
      icon: user.role === 'admin' ? '👑' : '🎯', 
      color: user.role === 'admin' ? 'from-amber-400 to-amber-300' : 'from-slate-400 to-slate-300',
      bgColor: user.role === 'admin' ? 'bg-amber-500/20 border-amber-500/30' : 'bg-slate-700/30 border-slate-600/50'
    },
    { 
      label: 'Downloads', 
      value: user.downloadsCount || 0, 
      icon: '📥', 
      color: 'from-slate-400 to-slate-300',
      bgColor: 'bg-slate-700/30 border-slate-600/50'
    }
  ];

  const coinsInfo = {
    label: 'Coin Balance',
    value: coins,
    icon: '🪙',
    color: 'from-amber-400 to-amber-300',
    bgColor: 'bg-slate-700/30 border-amber-500/30'
  };

  const getStatusBadge = () => {
    if (user.role === 'admin') return { text: 'Administrator', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' };
    if (coins > 1000) return { text: 'Premium User', color: 'bg-purple-500/20 text-purple-300 border-purple-500/50' };
    if (coins > 100) return { text: 'Active User', color: 'bg-blue-500/20 text-blue-300 border-blue-500/50' };
    return { text: 'New User', color: 'bg-green-500/20 text-green-300 border-green-500/50' };
  };

  const status = getStatusBadge();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-12">
        <div 
          className={`w-full max-w-4xl transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          {/* Main Profile Container */}
          <div className="bg-slate-800/30 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
            {/* Header Section */}
            <div className="relative p-8 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 border-b border-white/10">
              {/* Animated header background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 animate-pulse"></div>
              
              <div className="relative z-10 text-center">
                {/* User Avatar */}
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-2xl">
                    {user.username!.charAt(0).toUpperCase()}
                  </div>
                  {/* Animated ring */}
                  <div className="absolute inset-0 w-24 h-24 border-4 border-purple-400/50 rounded-full animate-spin opacity-60"></div>
                  <div className="absolute inset-0 w-24 h-24 border-4 border-pink-400/30 rounded-full animate-ping"></div>
                  
                  {/* Status indicator */}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-800 flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* User Info */}
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2">
                  {user.username}
                </h1>
                <p className="text-xl text-slate-300 mb-4">{user.email}</p>
                
                {/* Status Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm ${status.color} border`}>
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                  <span className="font-semibold text-sm">{status.text}</span>
                  {user.role === 'admin' && <span>👑</span>}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">📊</span>
                Account Overview
              </h2>

              {/* Coins Card - Special Highlight */}
              <div 
                className={`mb-6 p-6 ${coinsInfo.bgColor} border backdrop-blur-sm rounded-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer`}
                onMouseEnter={() => setHoveredCard('coins')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${coinsInfo.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg transform transition-transform duration-300 ${hoveredCard === 'coins' ? 'rotate-12 scale-110' : ''}`}>
                      {coinsInfo.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl">{coinsInfo.label}</h3>
                      <p className="text-slate-400 text-sm">Your current balance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-yellow-400 flex items-center gap-2">
                      <span className="animate-bounce">🪙</span>
                      {coinsInfo.value.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Available coins</p>
                  </div>
                </div>
                
                {/* Progress bar for coins */}
                <div className="mt-4 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min((coins / 1000) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {coins < 1000 ? `${1000 - coins} coins until Premium status` : 'Premium status achieved! 🎉'}
                </p>
              </div>

              {/* Profile Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profileStats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={`p-6 ${stat.bgColor} border backdrop-blur-sm rounded-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-xl cursor-pointer`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                    onMouseEnter={() => setHoveredCard(stat.label)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center text-xl shadow-lg transform transition-transform duration-300 ${hoveredCard === stat.label ? 'rotate-12 scale-110' : ''}`}>
                          {stat.icon}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{stat.label}</h3>
                          <p className="text-slate-400 text-sm">Account info</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">
                          {typeof stat.value === 'string' && stat.value.length > 20 
                            ? `${stat.value.substring(0, 20)}...` 
                            : stat.value}
                        </div>
                        {stat.label === 'Downloads' && (
                          <p className="text-xs text-slate-500 mt-1">Total downloads</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Activity Indicators */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-700/30 backdrop-blur-sm border border-slate-600 rounded-2xl text-center">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-white font-bold text-lg">{Math.floor((user.downloadsCount || 0) / 10) * 10}+</div>
                  <div className="text-slate-400 text-xs">Activity Level</div>
                </div>
                
                <div className="p-4 bg-slate-700/30 backdrop-blur-sm border border-slate-600 rounded-2xl text-center">
                  <div className="text-2xl mb-2">⭐</div>
                  <div className="text-white font-bold text-lg">
                    {coins > 1000 ? 'Premium' : coins > 100 ? 'Active' : 'Starter'}
                  </div>
                  <div className="text-slate-400 text-xs">Tier Status</div>
                </div>
                
                <div className="p-4 bg-slate-700/30 backdrop-blur-sm border border-slate-600 rounded-2xl text-center">
                  <div className="text-2xl mb-2">🚀</div>
                  <div className="text-white font-bold text-lg">Online</div>
                  <div className="text-slate-400 text-xs">Current Status</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span>⚡</span>
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button 
                    onClick={() => window.location.href = '/browse'}
                    className="p-4 bg-gradient-to-r from-purple-600/50 to-pink-600/50 hover:from-purple-500/50 hover:to-pink-500/50 border border-purple-500/30 rounded-2xl text-white font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="text-2xl mb-2">🔍</div>
                    Browse Images
                  </button>
                  
                  <button 
                    onClick={() => window.location.href = '/images'}
                    className="p-4 bg-gradient-to-r from-blue-600/50 to-indigo-600/50 hover:from-blue-500/50 hover:to-indigo-500/50 border border-blue-500/30 rounded-2xl text-white font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="text-2xl mb-2">🖼️</div>
                    My Images
                  </button>
                  
                  <button 
                    onClick={() => window.location.href = '/cart'}
                    className="p-4 bg-gradient-to-r from-green-600/50 to-emerald-600/50 hover:from-green-500/50 hover:to-emerald-500/50 border border-green-500/30 rounded-2xl text-white font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="text-2xl mb-2">🛒</div>
                    View Cart
                  </button>
                  
                  {user.role === 'admin' && (
                    <button 
                      onClick={() => window.location.href = '/administration'}
                      className="p-4 bg-gradient-to-r from-yellow-600/50 to-orange-600/50 hover:from-yellow-500/50 hover:to-orange-500/50 border border-yellow-500/30 rounded-2xl text-white font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="text-2xl mb-2">👑</div>
                      Admin Panel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Member since {new Date().getFullYear()} • Last active: Just now
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ProfilerUser;