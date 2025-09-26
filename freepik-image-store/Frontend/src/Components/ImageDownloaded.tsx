import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

interface Image {
  pageUrl: string;
  _id: string;
  userId: string;
  downloadUrl: string;
  jobId: string;
  downloadCount: number;
}

const ImageDownloaded: React.FC = () => {
  const { user, token, setUser } = useAuth();
  const socket = useSocket();

  const [images, setImages] = useState<Image[]>([]);
  const [error, setError] = useState<string | null>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [jobId, setJobId] = useState<string | null>(null);
  const [imageIdForDownload, setImageIdForDownload] = useState<string | null>(null);
  const [downloadingImage, setDownloadingImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const resolveRef = useRef<(url: string) => void | null>(null);
  const rejectRef = useRef<(reason?: any) => void | null>(null);

  const fetchImages = async () => {
    if (!token) return setError("No authentication token found. Please log in.");

    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/images/user-images`, {
        headers: { Authorization: token },
      });
      if (!res.ok) throw new Error();
      const data: Image[] = await res.json();
      setImages(data);
      setError(null);
    } catch {
      setError("Failed to load images. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateDownloadLink = async (image: Image) => {
    if (!token || !user?._id) throw new Error("Missing credentials");

    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/freepik/regenerate-link`,
      { userId: user._id, downloadLink: image.pageUrl },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (res.status !== 200) throw new Error("Failed to regenerate link");
    return res.data.jobId;
  };

  const updateDownloadCount = async (imageId: string) => {
    if (!token) throw new Error("No token");

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/images/user-images/${imageId}/downloadcounteradd`,
      {
        method: "PUT",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) throw new Error();
    return res.json();
  };

  const waitForRegenerateLink = () =>
    new Promise<string>((resolve, reject) => {
      if (!socket) return reject("Socket not connected");

      resolveRef.current = resolve;
      rejectRef.current = reject;

      setTimeout(() => reject("Timeout waiting for regeneration"), 30000);
    });

  useEffect(() => {
    if (!user?._id || !token || !socket) return;

    socket.emit("join", user._id);

    socket.on("connect", () => setError(null));
    socket.on("connect_error", (err) => setError(`Connection error: ${err.message}`));

    socket.on("regenerateLink", async (data: { jobId: string; userId: string; imageUrl: string }) => {
      if (data.jobId === jobId && imageIdForDownload && data.userId === user._id) {
        try {
          await axios.put(
            `${import.meta.env.VITE_BACKEND_URL}/api/images/user-images/${imageIdForDownload}/update-download-url`,
            { newDownloadUrl: data.imageUrl },
            {
              headers: {
                Authorization: token,
                "Content-Type": "application/json",
              },
            }
          );

          setImages((prev) =>
            prev.map((img) =>
              img._id === imageIdForDownload ? { ...img, downloadUrl: data.imageUrl } : img
            )
          );

          resolveRef.current?.(data.imageUrl);
          setUser(
            (prev) => {
              if (!prev) return prev;
              return { ...prev, downloadsCount: (prev.downloadsCount || 0) + 1 }
            })
        } catch (err) {
          rejectRef.current?.(err);
          setError("Failed to update download URL");
        }
      }
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("regenerateLink");
    };
  }, [user?._id, token, jobId, imageIdForDownload, socket]);

  useEffect(() => {
    if (user?._id) fetchImages();
  }, [user?._id, token]);

  const handleDownload = async (image: Image) => {
    if (!token) return setError("No token");

    setImageIdForDownload(image._id);
    setDownloadingImage(image._id);

    if (image.downloadCount >= 3) {
      setDownloadingImage(null);
      return setError("Max download limit reached.");
    }

    try {
      const headRes = await fetch(image.downloadUrl, { method: "HEAD" });
      let url = image.downloadUrl;
      if (!headRes.ok) {
        const job = await regenerateDownloadLink(image);
        setJobId(job);
        url = await waitForRegenerateLink()
      }

      const { downloadCount } = await updateDownloadCount(image._id);
      const a = document.createElement("a");
      a.href = url;
      a.download = url.split("/").pop() || "image";
      a.click();
      fetchImages();

      setImages((prev) =>
        prev.map((img) => (img._id === image._id ? { ...img, downloadCount } : img))
      );

    } catch (err) {
      setError("Download failed. Please try again.");
    } finally {
      setDownloadingImage(null);
    }
  };

  const getExpiryDate = (url: URL) => {
    const token = url.searchParams.get("token");
    const match = token?.match(/exp=(\d+)/);
    const exp = match ? parseInt(match[1]) : null;
    return exp ? new Date(exp * 1000).toLocaleString() : null;
  };

  const getFileName = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get("filename") || "Unknown Image";
    } catch {
      return "Unknown Image";
    }
  };

  return (
    <div className=" min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto pt-15 py-12">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-4 tracking-tight">
            Your Visual Collection
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Manage and download your acquired images
          </p>

          {/* Stats Cards */}
          <div className="flex justify-center gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl px-6 py-4">
              <div className="text-2xl font-bold text-purple-400">{images.length}</div>
              <div className="text-sm text-slate-400">Total Images</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-2xl px-6 py-4">
              <div className="text-2xl font-bold text-blue-400">
                {images.reduce((sum, img) => sum + img.downloadCount, 0)}
              </div>
              <div className="text-sm text-slate-400">Total Downloads</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-pink-500/30 rounded-2xl px-6 py-4">
              <div className="text-2xl font-bold text-pink-400">
                {images.filter(img => img.downloadCount < 3).length}
              </div>
              <div className="text-sm text-slate-400">Available</div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-1 inline-flex">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Grid
                </span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  List
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Error Display */}
        {/* {error && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-red-200 font-bold mb-1">Hey</h3>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
                <button
                  onClick={fetchImages}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )} */}

        {/* Enhanced Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-pink-500/20 border-b-pink-500 rounded-full animate-spin animate-reverse"></div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Loading Your Gallery</h3>
              <p className="text-slate-400">Fetching your amazing collection...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && images.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">No Images Yet</h3>
            <p className="text-xl text-slate-400 mb-8">Start building your collection by downloading some amazing images!</p>
            <button
              onClick={() => window.location.href = '/browse'}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Images
              </span>
            </button>
          </div>
        )}

        {/* Image Gallery */}
        {!isLoading && images.length > 0 && (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" 
            : "space-y-6"
          }>
            {images.map((img, index) => (
              <div
                key={img._id}
                className={`group relative backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden hover:border-purple-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/50' 
                    : 'bg-gradient-to-r from-slate-800/50 to-slate-900/50 flex items-center p-6'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Grid View Layout */}
                {viewMode === 'grid' && (
                  <>
                    {/* Image Container */}
                    <div className="relative overflow-hidden">
                    
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Status Badge */}
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                        img.downloadCount >= 3 
                          ? 'bg-red-500/90 text-white' 
                          : 'bg-emerald-500/90 text-white'
                      }`}>
                        {img.downloadCount >= 3 ? '🚫 Exhausted' : '✨ Available'}
                      </div>

                      {/* Download Count */}
                      <div className="absolute top-4 left-4 px-3 py-1 bg-slate-900/80 backdrop-blur-sm rounded-full text-xs text-white font-bold">
                        {img.downloadCount}/3 downloads
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 " >
                      <div className="mb-4">
                        <h3 className="text-white font-bold text-lg mb-2 leading-tight">
                          {getFileName(img.downloadUrl)}
                        </h3>
                        {img.downloadUrl && (
                          <p className="text-sm text-slate-400">
                            Expires: {getExpiryDate(new URL(img.downloadUrl)) || "No expiry"}
                          </p>
                        )}
                      </div>
                      
                      {/* Download Button */}
                      <button
                        onClick={() => handleDownload(img)}
                        disabled={img.downloadCount >= 3 || downloadingImage === img._id}
                        className={`w-full py-3 px-6 font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed ${
                          img.downloadCount >= 3
                            ? 'bg-red-600/50 text-red-200 border border-red-500/30'
                            : downloadingImage === img._id
                            ? 'bg-yellow-600/50 text-yellow-200 border border-yellow-500/30'
                            : 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white shadow-lg'
                        }`}
                      >
                        <span className="flex items-center justify-center gap-2">
                          {downloadingImage === img._id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-yellow-200 border-t-transparent rounded-full animate-spin"></div>
                              Processing...
                            </>
                          ) : img.downloadCount >= 3 ? (
                            <>
                              <span>🚫</span>
                              Limit Reached
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                              </svg>
                              Download ({img.downloadCount}/3)
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                  </>
                )}

                {/* List View Layout */}
                {viewMode === 'list' && (
                  <div className="flex items-center w-full gap-6">
                    {/* Image Thumbnail */}
                  

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-1">
                        {getFileName(img.downloadUrl)}
                      </h3>
                      {img.downloadUrl && (
                        <p className="text-sm text-slate-400 mb-2">
                          Expires: {getExpiryDate(new URL(img.downloadUrl)) || "No expiry"}
                        </p>
                      )}
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          img.downloadCount >= 3 ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {img.downloadCount}/3 downloads
                        </div>
                      </div>
                    </div>

                    {/* Download Button */}
                    <button
                      onClick={() => handleDownload(img)}
                      disabled={img.downloadCount >= 3 || downloadingImage === img._id}
                      className={`px-6 py-3 font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
                        img.downloadCount >= 3
                          ? 'bg-red-600/50 text-red-200 border border-red-500/30'
                          : downloadingImage === img._id
                          ? 'bg-yellow-600/50 text-yellow-200 border border-yellow-500/30'
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {downloadingImage === img._id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-yellow-200 border-t-transparent rounded-full animate-spin"></div>
                            Processing
                          </>
                        ) : img.downloadCount >= 3 ? (
                          <>
                            <span>🚫</span>
                            Exhausted
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                            Download
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                )}

                {/* Subtle Border Glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm"></div>
              </div>
            ))}
          </div>
        )}
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
        
        .animate-reverse {
          animation-direction: reverse;
        }
      `}</style>
    </div>
  );
};

export default ImageDownloaded;