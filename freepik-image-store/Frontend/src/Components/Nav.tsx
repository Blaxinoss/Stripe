import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
    const { isLoggedIn, isHost, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 z-50 w-full bg-gradient-to-r from-gray-900 to-black shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-2xl font-bold text-amber-400 hover:text-amber-300 transition-colors duration-200">
                        FreePik Photos Downloader
                    </Link>

                    <div className="flex items-center space-x-6">
                        {/* Links for logged-in user */}
                        {isLoggedIn() && (
                            <>
                                <Link
                                    to="/browse"
                                    className="text-gray-200 hover:text-amber-400 font-medium transition-colors duration-200"
                                >
                                    Browse
                                </Link>
                                <Link
                                    to="/cart"
                                    className="text-gray-200 hover:text-amber-400 font-medium transition-colors duration-200"
                                >
                                    Cart
                                </Link>
                                <Link
                                    to="/profile"
                                    className="text-gray-200 hover:text-amber-400 font-medium transition-colors duration-200"
                                >
                                    Profile
                                </Link>
                                <Link
                                    to="/images"
                                    className="text-gray-200 hover:text-amber-400 font-medium transition-colors duration-200"
                                >
                                    Images
                                </Link>
                                {isHost() && (
                                    <Link
                                        to="/administration"
                                        className="text-gray-200 hover:text-amber-400 font-medium transition-colors duration-200"
                                    >
                                        Administration
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-200 hover:text-amber-400 font-medium transition-colors duration-200 bg-transparent border border-amber-400 hover:bg-amber-400 hover:text-gray-900 px-4 py-1 rounded-md"
                                >
                                    Logout
                                </button>
                            </>
                        )}

                        {/* Links for non-logged-in user */}
                        {!isLoggedIn() && (
                            <>
                                <Link
                                    to="/signup"
                                    className="text-gray-200 hover:text-amber-400 font-medium transition-colors duration-200"
                                >
                                    Sign Up
                                </Link>
                                <Link
                                    to="/login"
                                    className="text-gray-200 hover:text-amber-400 font-medium bg-amber-400 hover:bg-amber-300 text-gray-900 px-4 py-1 rounded-md transition-colors duration-200"
                                >
                                    Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;