import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
    requireHost?: boolean; // لو الروت محتاج يكون host/admin
}

const ProtectedRoute = ({ children, requireHost = false }: ProtectedRouteProps) => {
    const { isLoggedIn, isHost } = useAuth();

    // لو اليوزر مش عامل لوجين، رجّعه للـ login
    if (!isLoggedIn()) {
        return <Navigate to="/login" />;
    }

    // لو الروت محتاج host واليوزر مش host، رجّعه للـ unauthorized
    if (requireHost && !isHost()) {
        return <Navigate to="/" />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;