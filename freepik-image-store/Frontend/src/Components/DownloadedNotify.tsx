import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useCoins } from '../context/CoinsContextProvider';

interface DownloadedNotifyProps {
  jobId: string;
  onLoadingChange?: (isLoading: boolean) => void; // Callback to notify outer component
}

const DownloadedNotify: React.FC<DownloadedNotifyProps> = ({ jobId, onLoadingChange }) => {
  const { user } = useAuth();
  const {coins} = useCoins();
  const [imageDownloadUrl, setImageDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user?._id) {
      setError('User not authenticated. Please log in.');
      setIsLoading(false);
      onLoadingChange?.(false); 
      return;
    }
    if(onLoadingChange) {
      onLoadingChange(true); // Notify outer component that loading has started
    }
    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.emit('join', user._id);

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      setError(null);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err.message);
      setError(`Failed to connect to server: ${err.message}`);
      setIsLoading(false);
      onLoadingChange?.(false); 
    });

    socket.on('downloadedImage', (data: { jobId: string, userId: string, imageUrl: string }) => {
      if (data.jobId === jobId) {
        if (data.userId !== user._id) {
          setError('User ID mismatch.');
        } else {
          setImageDownloadUrl(data.imageUrl);
          setIsLoading(false);
          onLoadingChange?.(false); 
          toast.success('Image download complete!, your file has been added to the gallery');
          toast.warn(`You now have ${coins} coins.`);  // Show success toast
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [jobId, user?._id]);

  return (
    <div>
      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      {isLoading && <p>Loading image...</p>}
      {imageDownloadUrl && (
        <div>
          <h2>Download Complete</h2>
          <img
            src={imageDownloadUrl}
            alt="Downloaded"
            style={{ maxWidth: '100%', maxHeight: '500px', marginTop: '10px' }}
          />
          <a href={imageDownloadUrl} download>Click to Download</a>
        </div>
      )}
      <ToastContainer autoClose={5000}/> {/* Render Toast notifications */}
    </div>
  );
};

export default DownloadedNotify;
