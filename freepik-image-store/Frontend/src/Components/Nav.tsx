// src/components/NavBar.tsx (أو أي اسم للـ navigation component)
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
        <nav className="fixed top-0 left-0 p-3 flex justify-around items-center bg-black w-full text-white">
            <Link to='/' className="text-3xl font-extrabold text-amber-500">FreePik Photos Downloader</Link>

            {/* Links لليوزر اللي عامل لوجين */}
            {isLoggedIn() && (
                <>
                    <Link to="/browse" className="text-white hover:text-amber-500">
                        Browse
                    </Link>
                    <Link to="/cart" className="text-white hover:text-amber-500">
                        Cart
                    </Link>
                    <Link to="/profile" className="text-white hover:text-amber-500">
                        Profile
                    </Link>
                    {isHost() && (
                        <Link to="/administration" className="text-white hover:text-amber-500">
                            Administration
                        </Link>
                    )}

                    <button
                        onClick={handleLogout}
                        className="text-white hover:text-amber-500"
                    >
                        Logout
                    </button>
                </>
            )}

            {/* Links لليوزر اللي مش عامل لوجين */}
            {!isLoggedIn() && (
                <>
                    <Link to="/signup" className="text-white hover:text-amber-500">
                        Sign up
                    </Link>
                    <Link to="/login" className="text-white hover:text-amber-500">
                        Login
                    </Link>
                </>
            )}
        </nav>
    );
};

export default NavBar;