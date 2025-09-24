import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const NavBar = () => {
    const { isLoggedIn, isHost, logout, user } = useAuth();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            {/* Futuristic NavBar */}
            <nav className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${
                scrolled 
                    ? 'backdrop-blur-xl bg-slate-900/80 border-b border-purple-500/30 shadow-2xl' 
                    : 'backdrop-blur-lg bg-slate-900/60 border-b border-white/10'
            }`}>
                {/* Animated top border */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse"></div>
                
                <div className="max-w-7xl lg:max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20 ">
                        {/* Enhanced Logo */}
                        <Link 
                            to="/" 
                            className="group flex items-center space-x-3 text-2xl font-black transition-all duration-300 hover:scale-105"
                        >
                            <div className="relative">
                                {/* Logo Icon with Glow */}
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                                    <span className="text-xl">🎨</span>
                                </div>
                                {/* Animated ring */}
                                <div className="absolute inset-0 w-10 h-10 border-2 border-purple-500/50 rounded-xl animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div className="hidden sm:block">
                                <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 group-hover:from-purple-300 group-hover:via-pink-300 group-hover:to-blue-300 transition-all duration-300">
                                Freepik Downloader
                                </div>
                             
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-8 p-0">
                            {/* User Info Display */}
                            {isLoggedIn() && user && (
                                <div className="flex items-center space-x-3 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold text-white">
                                            {user.username?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-slate-300">{user.username || 'User'}</span>
                                        <div className="flex items-center space-x-1 text-yellow-400">
                                            <span className="text-xs">🪙</span>
                                            <span className="text-sm font-bold">{user.coins || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Links for logged-in users */}
                            {isLoggedIn() && (
                                <>
                                    <NavLink to="/browse" icon="🔍">Browse</NavLink>
                                    <NavLink to="/cart" icon="🛒">Cart</NavLink>
                                    <NavLink to="/profile" icon="👤">Profile</NavLink>
                                    <NavLink to="/images" icon="🖼️">Images</NavLink>
                                    {isHost() && (
                                        <NavLink to="/administration" icon="⚙️" isSpecial={true}>
                                            Administration
                                        </NavLink>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="group relative px-6 py-2 bg-gradient-to-r from-red-600/80 to-pink-600/80 hover:from-red-500 hover:to-pink-500 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-red-500/30 hover:border-red-400/50"
                                    >
                                        <span className="flex items-center space-x-2">
                                            <span>🚪</span>
                                            <span>Logout</span>
                                        </span>
                                    </button>
                                </>
                            )}

                            {/* Navigation Links for non-logged-in users */}
                            {!isLoggedIn() && (
                                <>
                                    <Link
                                        to="/signup"
                                        className="text-slate-300 hover:text-white font-medium transition-all duration-300 px-4 py-2 rounded-2xl hover:bg-white/10 backdrop-blur-sm"
                                    >
                                        Sign Up
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="relative group px-6 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <span className="relative flex items-center space-x-2">
                                            <span>✨</span>
                                            <span>Login</span>
                                        </span>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="lg:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="relative w-10 h-10 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 flex items-center justify-center"
                            >
                                <div className={`w-6 h-6 flex flex-col justify-center items-center transform transition-all duration-300 ${mobileMenuOpen ? 'rotate-45' : ''}`}>
                                    <span className={`block h-0.5 w-6 bg-gradient-to-r from-purple-400 to-pink-400 transform transition-all duration-300 ${mobileMenuOpen ? 'rotate-90 translate-y-0' : '-translate-y-1.5'}`}></span>
                                    <span className={`block h-0.5 w-6 bg-gradient-to-r from-pink-400 to-blue-400 transform transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                                    <span className={`block h-0.5 w-6 bg-gradient-to-r from-blue-400 to-purple-400 transform transition-all duration-300 ${mobileMenuOpen ? '-rotate-90 -translate-y-0' : 'translate-y-1.5'}`}></span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`lg:hidden transition-all duration-500 overflow-hidden ${
                    mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                    <div className="px-4 py-6 bg-slate-900/95 backdrop-blur-xl border-t border-purple-500/30">
                        <div className="space-y-4">
                            {/* Mobile User Info */}
                            {isLoggedIn() && user && (
                                <div className="flex items-center space-x-3 px-4 py-3 bg-slate-800/50 rounded-2xl border border-white/10 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                        <span className="text-lg font-bold text-white">
                                            {user.username?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-white font-semibold">{user.username || 'User'}</div>
                                        <div className="flex items-center space-x-1 text-yellow-400 text-sm">
                                            <span>🪙</span>
                                            <span className="font-bold">{user.coins || 0} coins</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Mobile Navigation Links */}
                            {isLoggedIn() && (
                                <>
                                    <MobileNavLink to="/browse" icon="🔍" onClick={() => setMobileMenuOpen(false)}>
                                        Browse
                                    </MobileNavLink>
                                    <MobileNavLink to="/cart" icon="🛒" onClick={() => setMobileMenuOpen(false)}>
                                        Cart
                                    </MobileNavLink>
                                    <MobileNavLink to="/profile" icon="👤" onClick={() => setMobileMenuOpen(false)}>
                                        Profile
                                    </MobileNavLink>
                                    <MobileNavLink to="/images" icon="🖼️" onClick={() => setMobileMenuOpen(false)}>
                                        Images
                                    </MobileNavLink>
                                    {isHost() && (
                                        <MobileNavLink to="/administration" icon="⚙️" onClick={() => setMobileMenuOpen(false)} isSpecial={true}>
                                            Administration
                                        </MobileNavLink>
                                    )}
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 bg-gradient-to-r from-red-600/50 to-pink-600/50 hover:from-red-500/50 hover:to-pink-500/50 text-white font-semibold rounded-2xl transition-all duration-300 border border-red-500/30"
                                    >
                                        <span className="flex items-center space-x-3">
                                            <span>🚪</span>
                                            <span>Logout</span>
                                        </span>
                                    </button>
                                </>
                            )}

                            {!isLoggedIn() && (
                                <>
                                    <MobileNavLink to="/signup" icon="✨" onClick={() => setMobileMenuOpen(false)}>
                                        Sign Up
                                    </MobileNavLink>
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block w-full text-center px-4 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold rounded-2xl transition-all duration-300"
                                    >
                                        <span className="flex items-center justify-center space-x-2">
                                            <span>✨</span>
                                            <span>Login</span>
                                        </span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Spacer to prevent content from hiding behind fixed navbar */}
            <div className="h-20"></div>
        </>
    );
};

// Enhanced NavLink Component
const NavLink = ({ to, children, icon, isSpecial = false }: { to: string; children: React.ReactNode; icon: string; isSpecial?: boolean }) => (
    <Link
        to={to}
        className={`group relative flex items-center space-x-2 px-4 py-2 font-medium rounded-2xl transition-all duration-300 hover:scale-105 ${
            isSpecial 
                ? 'text-yellow-400 hover:text-yellow-300 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 hover:border-yellow-400/50' 
                : 'text-slate-300 hover:text-white hover:bg-white/10'
        } backdrop-blur-sm`}
    >
        <span className="text-sm">{icon}</span>
        <span>{children}</span>
        {isSpecial && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        )}
    </Link>
);

// Mobile NavLink Component
const MobileNavLink = ({ to, children, icon, onClick, isSpecial = false }: { 
    to: string; 
    children: React.ReactNode; 
    icon: string; 
    onClick: () => void;
    isSpecial?: boolean;
}) => (
    <Link
        to={to}
        onClick={onClick}
        className={`block px-4 py-3 font-semibold rounded-2xl transition-all duration-300 ${
            isSpecial 
                ? 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/30' 
                : 'text-slate-300 hover:text-white hover:bg-white/10'
        } backdrop-blur-sm`}
    >
        <span className="flex items-center space-x-3">
            <span>{icon}</span>
            <span>{children}</span>
            {isSpecial && <span className="text-xs">👑</span>}
        </span>
    </Link>
);

export default NavBar;