import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useCoins } from '../context/CoinsContextProvider';
import { useSocket } from '../context/SocketContext';

interface DownloadedNotifyProps {
  jobId: string;
  onLoadingChange?: (isLoading: boolean) => void; // Callback to notify outer component
  purchasehandler?:()=>void
}


const DownloadedNotify: React.FC<DownloadedNotifyProps> = ({ jobId, onLoadingChange,purchasehandler }) => {

  
  const { user } = useAuth();
  const {coins,setCoins} = useCoins();
  const [imageDownloadUrl, setImageDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const linkref = React.useRef<HTMLAnchorElement>(null);
  const socket = useSocket();
  
useEffect(()=>{
if(linkref.current && imageDownloadUrl) {
              linkref.current?.click();

}
},[imageDownloadUrl])




  useEffect(() => {
    if (!user?._id) {
      setError('User not authenticated. Please log in.');
      setIsLoading(false);
      onLoadingChange?.(false); 
      return;
    }

        if (!socket) {
  setError('Socket not initialized. Please try again later.');
  setIsLoading(false);
  onLoadingChange?.(false);
  return;
}

    if(onLoadingChange) {
      onLoadingChange(true); // Notify outer component that loading has started
    }


    socket.emit('join', user._id);


    socket.on('connect', () => {
      console.log('Connected to Socket.IO server Iam the notify system');
      setError(null);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket.IO connection error from notify system:', err.message);
      setError(`Failed to connect to server from the notify system: ${err.message}`);
      setIsLoading(false);
      onLoadingChange?.(false); 
    });

    socket.on('downloadedImage', (data: { jobId: string, userId: string, imageUrl: string }) => {
      if (data.jobId === jobId) {
        if (data.userId !== user._id) {
          setError('User ID mismatch.');
        } else {
          try{
                purchasehandler?.()

          }catch(error) {
            console.error('purchasehandler threw an error:', error);
            setError('An error occurred while [purchasing the image]. Please try again later.');
          }
          setImageDownloadUrl(data.imageUrl);
          setIsLoading(false);
          onLoadingChange?.(false); 
          toast.success('Image download complete!, your file has been added to the gallery');
toast.info(`100 coins deducted. You now have ${coins - 100} coins.`);
          setCoins(coins - 100); // Deduct coins after successful download
        }
      }
    });

    socket.on('downloadFailed', (data: { jobId: string, userId: string, error: string }) => {
     if (data.jobId === jobId) {
        if (data.userId !== user._id) {
          setError('User ID mismatch.');
        }
        else {
        setImageDownloadUrl(null);
          setIsLoading(false);
          onLoadingChange?.(false); 
          toast.error('an Error occurred while downloading the image.'); // Show error toast
          toast.warn(`failed to download the Image`);  // Show success toast
      }
      }
    });

    return () => {
      socket.off('downloadedImage');
      socket.off('downloadFailed');
      socket.off('connect');
      socket.off('connect_error');
    };
  }, [jobId, user?._id,socket]);

  return (
    <div>
      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      {isLoading && <p>Loading image...</p>}
      {imageDownloadUrl && (
        <div>
          <h2>Download Complete</h2>
          <a ref={linkref} href={imageDownloadUrl} download>If the download didn't start automatically. Click to Download</a>
        </div>
      )}
      <ToastContainer autoClose={5000}/> {/* Render Toast notifications */}
    </div>
  );
};

export default DownloadedNotify;
