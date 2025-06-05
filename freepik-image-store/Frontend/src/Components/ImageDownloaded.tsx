import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Image {
  _id: string;
  userId: string;
  downloadUrl: string;
  jobId: string;
  downloadCount: number;
}

const ImageDownloaded: React.FC = () => {
  const { user , token} = useAuth();
  const [images, setImages] = useState<Image[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  

  useEffect(() => {
    if (!user?._id) {
      setError('User not authenticated. Please log in.');
      setIsLoading(false);
      return;
    }


    const fetchImages = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/images/user-images`, {
          headers: {
            Authorization: `${token}`,
                  },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }

        const data: Image[] = await response.json();
        setImages(data);
        console.log('Fetched images:', data);
      } catch (err) {
        console.error('Error fetching images:', err);
        setError('Failed to load images. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchImages();
  }, [user?._id]);

  const handleDownload = async(image: Image) => {
    const urlCheckResponse = await fetch(image.downloadUrl, { method: 'HEAD' });

    if (!urlCheckResponse.ok) {
      setError('The download URL is no longer valid. Please try again later.');
      return;
    }

    if(image.downloadCount >=3) {
      setError('You have reached the maximum download limit for this image.');
      return;
    } 
    else{
      try{
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/images/user-images/${image._id}/downloadcounteradd`,
        {
          method: 'PUT',
          headers: {
            Authorization: `${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update download count');
      }else{
        const {downloadCount} = await response.json();
        const link = document.createElement('a');
        link.href = image.downloadUrl;
        link.download = image.downloadUrl.split('/').pop() || 'image';
        link.click();
        setImages((prevImages) =>
          prevImages.map((img ) =>
            img._id === image._id ? { ...img, downloadCount} : img
          )
        );
      }

    } catch (err) {
      console.error('Error updating download count:', err);
      setError('Failed to download the image. Please try again.');
    }
  };
  }



  

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Your Image Gallery</h1>
      {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>Error: {error}</p>}
      {isLoading && <p style={{ textAlign: 'center' }}>Loading images...</p>}
      {images.length === 0 && !isLoading && !error && (
        <p style={{ textAlign: 'center' }}>No images found. Start downloading some!</p>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px',
        }}
      >
        {images.map((image) => (
          <div
            key={image._id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              padding: '10px',
            }}
          >
            <p className="p-2 font-bold text-sm">
              {
                (() => {
                return  new URL(image.downloadUrl).pathname
                })()
              }
            </p>
            <img
              src={image.downloadUrl}
              alt={`Image ${image.jobId}`}
              style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '20px', marginBottom: '5px', marginTop: '5px' }}
              onError={() => setError(`Failed to load image ${image.jobId}`)}
            />
            <div style={{ padding: '10px' }}>
                <button disabled={image.downloadCount >= 3}
                onClick={() => handleDownload(image)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                Download {image.downloadCount}
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageDownloaded;