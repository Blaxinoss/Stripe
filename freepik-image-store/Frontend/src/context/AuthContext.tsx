// src/context/AuthContext.tsx
import axios from 'axios';
import moment from 'moment';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useCoins } from './CoinsContextProvider';

interface User {
    _id: string;
    email: string;
    role: string;
    coins: number;
    downloadsCount?: number;
    username?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoggedIn: () => boolean;
    isHost: () => boolean;
    setAuthData: (user: User, token: string, expiresIn: string) => void;
    logout: () => void;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); // عشان ما تعرضش الـ UI قبل ما تتحقق
    const { setCoins } = useCoins();


    //to fix the reload 
    useEffect(() => {
        const verifyToken = async () => {
            const storedToken = localStorage.getItem('token');
            const storedExpires = localStorage.getItem('expires');

            if (storedToken && storedExpires) {
                const expires = moment(JSON.parse(storedExpires));
                if (moment().utc().isBefore(expires.utc())) {
                    try {
                        // تحقق من التوكين في السيرفر
                        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/me`, {
                            headers: {
                                Authorization: `${storedToken}`
                            }
                        });
                        setUser(response.data.user);
                        setToken(storedToken);
                    } catch (error) {
                        console.error('Invalid token:', error);
                        logout();
                    }
                } else {
                    logout();
                }
            }
            setLoading(false);
        };

        verifyToken();
    }, []);


    useEffect(() => {
      if (user?.coins != null) {
        setCoins(user.coins);
      }
    }, [user]);

    const setAuthData = (user: User, token: string, expiresIn: string) => {
        try {
            if (!expiresIn) {
                throw new Error('Expiration time not provided');
            }
            const expires = moment().add(parseInt(expiresIn), 'day');
            setUser(user);
            setToken(token);
            console.log('User:', user);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            localStorage.setItem('expires', JSON.stringify(expires.valueOf()));
        } catch (error) {
            console.error('Error setting auth data:', error);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('expires');
    };

    // const getExpiration = () => {
    //     const expiration = localStorage.getItem('expires');
    //     if (!expiration) {
    //         return null;
    //     }
    //     try {
    //         const expireAt = JSON.parse(expiration);
    //         if (typeof expireAt !== 'number') {
    //             throw new Error('Invalid expiration format');
    //         }
    //         return moment(expireAt);
    //     } catch (error) {
    //         console.error('Error parsing expiration:', error);
    //         return null;
    //     }
    // };

    const isLoggedIn = () => {
        return !!user && !!token; // بنعتمد على الـ state بدل localStorage
    };

    const isHost = () => {
        return isLoggedIn() && user?.role === 'admin';
    };

    if (loading) {
        return <div>Loading...</div>; // أو أي loading spinner
    }

    return (
        <AuthContext.Provider value={{ user, token, isLoggedIn, isHost, setAuthData, logout,setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};