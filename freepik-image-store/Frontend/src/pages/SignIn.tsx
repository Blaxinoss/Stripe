import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

type FormData = {
    email: string;
    password: string;
    username: string;
};

const SignIn = () => {
    const navigate = useNavigate();
    const [isError, setIsError] = useState('')
    const [message, setMessage] = useState('')

    const Schema = z.object({
        username: z.string().min(5, "Username must be at least 5 chars"),
        email: z.string().email("Invalid email format"),
        password: z.string().min(8, "Password must be at least 8 characters"),
    })

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(Schema)
    });

    const onSubmit = async (data: FormData) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/create_user`, data);
            const { success, message } = response.data;

            if (!success) {
                setIsError(message);
                setMessage("");
                navigate('/login');
            } else {
                setMessage(message);
                setIsError("");
                reset();
            }

        } catch (err) {
            if (axios.isAxiosError(err) && err.response && err.response.data) {
                setIsError(`An error occurred with the server, ${err.response.data.error}`);
            } else {
                setIsError('An unknown error occurred.');
            }
            setMessage("");
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-cyan-900"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
            </div>

            {/* SignIn Container */}
            <div className="relative z-10 w-full max-w-md mx-4">
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                
                {/* Main Card */}
                <div className="relative bg-black/70 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                            SIGN UP
                        </h1>
                        <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-pink-500 mx-auto rounded-full"></div>
                        <p className="text-gray-400 mt-4 text-lg">Create your account and join the revolution</p>
                    </div>

                    {/* Error/Success Messages */}
                    <div className="space-y-3 mb-8">
                        {errors.email && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.email.message}
                                </div>
                            </div>
                        )}
                        {errors.username && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.username.message}
                                </div>
                            </div>
                        )}
                        {errors.password && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.password.message}
                                </div>
                            </div>
                        )}
                        {message && (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    {message}
                                </div>
                            </div>
                        )}
                        {isError && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {isError}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Email Field */}
                        <div className="group relative">
                            <label 
                                htmlFor="email" 
                                className="block text-sm font-bold text-gray-300 mb-3 group-focus-within:text-cyan-400 transition-colors duration-300"
                            >
                                EMAIL ADDRESS
                            </label>
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-cyan-600 rounded-xl blur opacity-0 group-focus-within:opacity-75 transition duration-500"></div>
                                <input
                                    {...register("email")}
                                    id="email"
                                    type="email"
                                    className="relative w-full px-6 py-4 bg-gray-900/80 border border-gray-700 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:bg-gray-900 transition-all duration-300 backdrop-blur-sm"
                                    placeholder="Enter your email"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                    <svg className="w-6 h-6 text-gray-500 group-focus-within:text-cyan-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Username Field */}
                        <div className="group relative">
                            <label 
                                htmlFor="username" 
                                className="block text-sm font-bold text-gray-300 mb-3 group-focus-within:text-purple-400 transition-colors duration-300"
                            >
                                USERNAME
                            </label>
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 group-focus-within:opacity-75 transition duration-500"></div>
                                <input
                                    {...register("username")}
                                    id="username"
                                    type="text"
                                    className="relative w-full px-6 py-4 bg-gray-900/80 border border-gray-700 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:bg-gray-900 transition-all duration-300 backdrop-blur-sm"
                                    placeholder="Choose a username"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                    <svg className="w-6 h-6 text-gray-500 group-focus-within:text-purple-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="group relative">
                            <label 
                                htmlFor="password" 
                                className="block text-sm font-bold text-gray-300 mb-3 group-focus-within:text-pink-400 transition-colors duration-300"
                            >
                                PASSWORD
                            </label>
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-orange-600 rounded-xl blur opacity-0 group-focus-within:opacity-75 transition duration-500"></div>
                                <input
                                    {...register("password")}
                                    id="password"
                                    type="password"
                                    className="relative w-full px-6 py-4 bg-gray-900/80 border border-gray-700 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:bg-gray-900 transition-all duration-300 backdrop-blur-sm"
                                    placeholder="Create a strong password"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                    <svg className="w-6 h-6 text-gray-500 group-focus-within:text-pink-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Login Link */}
                        <div className="text-center py-4">
                            <p className="text-gray-400 text-lg">
                                Already have an account?{" "}
                                <Link 
                                    to="/login" 
                                    className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-orange-500 hover:to-yellow-400 transition-all duration-300"
                                >
                                    LOG IN
                                </Link>
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col gap-4">
                            {/* Sign Up Button */}
                            <button
                                type="submit"
                                className="group relative w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 text-white font-black px-8 py-5 rounded-xl text-lg hover:scale-105 transition-all duration-300 ease-out shadow-2xl hover:shadow-cyan-500/50 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <span className="relative z-10">SIGN UP</span>
                                <svg className="relative z-10 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </button>

                            {/* Clear Button */}
                            <button
                                type="button"
                                onClick={() => {
                                    reset()
                                    setMessage('')
                                    setIsError('')
                                }}
                                className="group w-full inline-flex items-center justify-center gap-3 bg-transparent border-2 border-gray-600 text-gray-400 font-bold px-8 py-4 rounded-xl text-lg hover:border-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 ease-out"
                            >
                                <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>CLEAR</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignIn;