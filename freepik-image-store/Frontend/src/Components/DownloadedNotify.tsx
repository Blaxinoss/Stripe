import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useCoins } from '../context/CoinsContextProvider';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';

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
  const { showToast } = useToast();
  

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
  showToast({ message: 'Failed to download image file.', type: 'error', delay: 5000 });
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
        showToast({ message: 'Image download complete!, your file has been added to the gallery', type: 'success', delay: 5000 });

  showToast({ message: `100 coins deducted. You now have ${coins -100} coins.`, type: 'info', delay: 5000 });


        }
      }
    });

    socket.on('downloadFailed', (data: { jobId: string, userId: string, error: string }) => {
      console.log('downloadFailed event received:');
     if (data.jobId === jobId) {
        if (data.userId !== user._id) {
          setError('User ID mismatch.');
        }
        else {
          setError(`Download failed: ${data.error}`);
        setImageDownloadUrl(null);
          setIsLoading(false);
          onLoadingChange?.(false); 
          showToast({ message: `An error occurred while downloading the image. ${data.error}`, type: 'error', delay: 5000 });
showToast({ message: 'Failed to download the image', type: 'warn', delay: 5000 });

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

    </div>
  );
};

export default DownloadedNotify;
