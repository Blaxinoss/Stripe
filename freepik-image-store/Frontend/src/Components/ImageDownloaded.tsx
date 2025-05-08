import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Image {
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
        setImages(data.filter((img) => img.userId === user._id));
      } catch (err) {
        console.error('Error fetching images:', err);
        setError('Failed to load images. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [user?._id]);

  const handleDownload = (downloadUrl: string) => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = downloadUrl.split('/').pop() || 'image';
    link.click();
  };
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
            key={image.jobId}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              textAlign: 'center',
            }}
          >
            <p
              style={{ width: '100%', height: '150px', objectFit: 'cover',fontSize: '3px' }}
              onError={() => setError(`Failed to load image ${image.jobId}`)}
            >
              {image.downloadUrl}
            </p>
            <div style={{ padding: '10px' }}>
                <button
                onClick={() => handleDownload(image.downloadUrl)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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