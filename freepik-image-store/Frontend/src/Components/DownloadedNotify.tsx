import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useCoins } from '../context/CoinsContextProvider';
import { useSocket } from '../context/SocketContext';

interface DownloadedNotifyProps {
  jobId: string;
  onLoadingChange?: (isLoading: boolean) => void; // Callback to notify outer component
  purchasehandler?:()=>void
}



const DownloadedNotify: React.FC<DownloadedNotifyProps> = ({ jobId, onLoadingChange,purchasehandler }) => {

  
  const { user ,setUser} = useAuth();
  const {coins,setCoins} = useCoins();
  const [imageDownloadUrl, setImageDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const socket = useSocket();
  

const blobDownload = async (url: string, filename = 'download.jpg') => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl); // Clean up
  } catch (err) {
    console.error('Error downloading image:', err);
    toast.error('Failed to download image file.');
  }
};


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
                setCoins((prev)=>prev-100);
               setUser(
                (prev) =>{
                  if(!prev) return prev;
                  return {...prev, downloadsCount: (prev.downloadsCount || 0) + 1}
               })
                
          }catch(error) {
            console.error('purchasehandler threw an error:', error);
            setError('An error occurred while [purchasing the image]. Please try again later.');
          }
          setImageDownloadUrl(data.imageUrl);
          setIsLoading(false);
          onLoadingChange?.(false); 

        blobDownload(data.imageUrl, 'image.jpg');
          toast.success('Image download complete!, your file has been added to the gallery');
toast.info(`100 coins deducted. You now have ${coins - 100} coins.`);
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
          <a  href={imageDownloadUrl} download>If the download didn't start automatically. Click to Download</a>
        </div>
      )}
      <ToastContainer autoClose={5000}/> {/* Render Toast notifications */}
    </div>
  );
};

export default DownloadedNotify;
