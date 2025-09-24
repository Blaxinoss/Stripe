import axios from 'axios';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DownloadedNotify from './DownloadedNotify';

interface ImageData {
    id: number;
    isFree: boolean;
    original: string;
    thumbnail: string;
    title: string;
}

const Search = () => {
    const { user, token } = useAuth();
    const [downloadLink, setDownloadLink] = useState('')
    const [searchLink, setSearchLink] = useState('');
    const [images, setImages] = useState<ImageData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState<{ id: number; amount: number; title: string } | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const [isLoadingInner, setIsLoadingInner] = useState<boolean>(false);

    const handleLoadingChange = (loading: boolean) => {
        setIsLoadingInner(loading);
    };

    // Search for images (logic unchanged)
    const searchImages = async () => {
        if (!searchLink.trim()) {
            setError('Please enter a valid search Link.');
            return;
        }
        setLoading(true);
        setError(null);
        setMessage(null);
        setImages([]);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/search`,
                {
                    params: { searchLink: searchLink },
                    headers: {
                        Authorization: `${token}`,
                    },
                }
            );
            setDownloadLink(response.data[0].original)
            setImages(Array.isArray(response.data) ? response.data : []);
            setMessage(
                response.data.length
                    ? 'Images fetched successfully!'
                    : 'No images found.'
            );
        } catch (err: any) {
            console.error('Search error:', err);
            setError(
                err.response?.data?.message || 'Failed to fetch images. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    // Download image (logic unchanged)
    const downloadImage = async (imageId: number) => {
        try {
            console.log(user)
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/freepik/download/${imageId}`,
                { downloadLink: downloadLink, userId: user?._id },
                {
                    headers: {
                        Authorization: `${token}`,
                    },
                }
            );
            const { jobId } = response.data;
            console.log('we got the Job ID:', jobId);
            if (jobId) {
                setJobId(jobId);
            }
        } catch (err) {
            console.error('Download error:', (err as Error).message);
            throw new Error('Failed to download image.');
        }
    };

    // Handle purchase (logic unchanged)
    const handlePurchase = async (amount: number) => {
        if (!token) {
            setError('You must be logged in to make a purchase.');
            return;
        }
        console.log('handlePurchase called with amount:', amount);
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/payment/pay`,
                { amount },
                {
                    headers: {
                        Authorization: `${token}`,
                    },
                    timeout: 50000,
                }
            );
            setMessage(response.data.message || 'Purchase and download completed successfully!');
        } catch (err: any) {
            console.error('Purchase or download error:', err);
            setError(
                err.response?.data?.message || err.message || 'Purchase or download failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const openConfirmDialog = (id: number, amount: number, title: string) => {
        setShowConfirm({ id, amount, title });
    };

    const closeConfirmDialog = () => {
        setShowConfirm(null);
    };

    const confirmPurchase = () => {
        if (!token || !showConfirm) return;

        if (showConfirm) {
            if ((user?.coins ?? 0) < showConfirm.amount) {
                setError('You do not have enough coins to make this purchase.');
                return;
            }
            const image = images.find((img) => img.id === showConfirm.id);
            if (image) {
                downloadImage(showConfirm.id)
            }
            closeConfirmDialog();
        }
    };

    return (
        <>
            {jobId && (
                <DownloadedNotify
                    jobId={jobId}
                    onLoadingChange={handleLoadingChange}
                    purchasehandler={() => handlePurchase(100)}
                />
            )}

            {/* Animated Background */}
            <div className="min-h-[100vh] m-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
                {/* Floating Orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-6 py-12">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-4 tracking-tight">
                            Discover Visual Magic
                        </h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                            Search, explore, and acquire stunning visuals with our revolutionary image discovery platform
                        </p>
                    </div>

                    {/* Main Search Container */}
                    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl mb-12">
                        {/* Search Bar */}
                        <div className="flex flex-col lg:flex-row gap-6 mb-8">
                            <div className="relative flex-1">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 to-blue-600/50 rounded-2xl blur opacity-75"></div>
                                <input
                                    className="relative w-full bg-slate-900/90 border border-purple-500/50 rounded-2xl px-6 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-lg backdrop-blur-sm"
                                    type="text"
                                    disabled={loading}
                                    value={searchLink}
                                    onChange={(e) => setSearchLink(e.target.value)}
                                    placeholder="Enter your search query..."
                                />
                            </div>
                            <button
                                onClick={searchImages}
                                disabled={loading}
                                className="relative group px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:transform-none overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative flex items-center justify-center gap-2">
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Searching Magic...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            Discover Images
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>

                        {/* Enhanced Status Messages */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <p className="text-red-200 font-medium">{error}</p>
                                </div>
                            </div>
                        )}

                        {message && (
                            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-emerald-200 font-medium">{message}</p>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-2xl backdrop-blur-sm">
                                <div className="flex items-center justify-center gap-4">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                                        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                    <p className="text-blue-200 font-medium">Searching the visual universe...</p>
                                </div>
                            </div>
                        )}

                        {/* Revolutionary Image Grid */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {images.map((img, index) => (
                                    <div
                                        key={img.id}
                                        className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden hover:border-purple-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl"
                                        style={{
                                            animationDelay: `${index * 100}ms`,
                                            animation: 'fadeInUp 0.6s ease-out forwards'
                                        }}
                                    >
                                        {/* Image Container */}
                                        <div className="relative overflow-hidden">
                                            <img
                                                src={img.thumbnail}
                                                alt={img.title}
                                                className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                                                loading="lazy"
                                                onContextMenu={(e) => e.preventDefault()}
                                                draggable={false}
                                            />
                                            {/* Overlay Gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            
                                            {/* Premium Free/Paid Badge */}
                                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                                                img.isFree 
                                                    ? 'bg-emerald-500/90 text-white shadow-lg' 
                                                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                                            } backdrop-blur-sm border border-white/20`}>
                                                {img.isFree ? '✨ FREE' : '💎 PREMIUM'}
                                            </div>

                                            {/* Hover Overlay with Quick Actions */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                                    <div className="flex gap-3">
                                                        <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>
                                                        <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Enhanced Content Section */}
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="text-white font-bold text-lg leading-tight group-hover:text-purple-300 transition-colors duration-300 flex-1 mr-2">
                                                    {img.title}
                                                </h3>
                                                <div className="flex-shrink-0">
                                                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                                                </div>
                                            </div>
                                            
                                            {/* Enhanced Purchase Button */}
                                            <button
                                                onClick={() => openConfirmDialog(img.id, 100, img.title)}
                                                disabled={isLoadingInner}
                                                className="w-full mt-4 relative group/btn bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:transform-none overflow-hidden border border-white/10"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                                <span className="relative flex items-center justify-center gap-2">
                                                    {isLoadingInner ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            <span className="text-sm">Processing...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg">🪙</span>
                                                                <span className="font-bold">100</span>
                                                            </div>
                                                            <span className="text-sm">Acquire Now</span>
                                                            <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                            </svg>
                                                        </>
                                                    )}
                                                </span>
                                            </button>

                                            {/* Additional Metadata */}
                                            <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                    </svg>
                                                    Just added
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    4.9
                                                </span>
                                            </div>
                                        </div>

                                        {/* Subtle Border Animation */}
                                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm"></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Ultra-Enhanced Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="relative">
                        {/* Animated Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                        
                        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 backdrop-blur-xl">
                            <div className="p-8">
                                {/* Enhanced Header */}
                                <div className="text-center mb-6">
                                    <div className="relative mb-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                            <span className="text-2xl">🛒</span>
                                        </div>
                                        <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto blur-md opacity-60 animate-ping"></div>
                                    </div>
                                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                                        Confirm Your Purchase
                                    </h2>
                                    <p className="text-slate-400 text-sm">Complete your magical acquisition</p>
                                </div>

                                {/* Enhanced Content */}
                                <div className="text-center mb-8">
                                    <p className="text-slate-300 mb-4">
                                        You're about to acquire
                                    </p>
                                    <div className="bg-slate-800/50 border border-purple-500/30 rounded-2xl p-6 mb-4 relative overflow-hidden">
                                        {/* Subtle background animation */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 animate-pulse"></div>
                                        
                                        <h3 className="relative text-white font-bold text-lg mb-3 leading-tight">"{showConfirm.title}"</h3>
                                        <div className="relative flex items-center justify-center gap-3">
                                            <div className="flex items-center gap-2 text-yellow-400 font-bold text-xl">
                                                <span className="text-2xl animate-bounce">🪙</span>
                                                <span>{showConfirm.amount}</span>
                                            </div>
                                            <span className="text-slate-400">coins</span>
                                        </div>
                                    </div>
                                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-3 mb-4">
                                        <p className="text-blue-200 text-sm flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                            </svg>
                                            Auto-download after purchase
                                        </p>
                                    </div>
                                    <p className="text-slate-500 text-xs">
                                        High-quality image will be processed and delivered instantly
                                    </p>
                                </div>

                                {/* Enhanced Action Buttons */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={closeConfirmDialog}
                                        className="flex-1 px-6 py-3 bg-slate-700/80 hover:bg-slate-600 text-white font-semibold rounded-2xl transition-all duration-300 border border-slate-600 hover:border-slate-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmPurchase}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                        <span className="relative flex items-center justify-center gap-2">
                                            <span>✨</span>
                                            <span>Confirm Purchase</span>
                                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom CSS for animations */}
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
                
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
                
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
        </>
    );
};

export default Search;