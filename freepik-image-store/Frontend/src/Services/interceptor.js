import axios from 'axios';

const publicRoutes = [
    '/api/users/create_user',
    '/api/users/login',
    '/api/users/signup',// Add other public routes (e.g., signup, reset password)
];

axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        // Only add Authorization header for non-public routes
        if (token && !publicRoutes.some((route) => config.url.includes(route))) {
            console.log(token)
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

