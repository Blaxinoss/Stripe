// src/pages/ProfileRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserProfile from './UserProfile';

const ProfilerUser = () => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    return <UserProfile userId={user._id} />;
};

export default ProfilerUser;
