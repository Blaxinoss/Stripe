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


// Search for images
const searchImages = async () => {
        if (!searchLink.trim() ) {
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
//End of search for images


//Start of download image
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
            const {jobId} = response.data;
            console.log('we got the Job ID:', jobId);
    if (jobId){
            setJobId(jobId);
          } 
    } catch (err) {
            console.error('Download error:', (err as Error).message);
            throw new Error('Failed to download image.');
        }
};
//End of Download Logic



// Start the handlePurchase function

    const handlePurchase = async (imageId: number, amount: number) => {
        if (!token) {
            setError('You must be logged in to make a purchase.');
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
          await downloadImage(imageId);

            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/payment/pay`,
                { imageId, amount },
                {
                    headers: {
                        Authorization: `${token}`,
                    },
                }
            );
            // Initiate download after successful purchase
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
        if (showConfirm) {
            const image = images.find((img) => img.id === showConfirm.id);
            if (image) {
                handlePurchase(showConfirm.id, showConfirm.amount);
            }
            closeConfirmDialog();
        }
    };

    return (
        <>  {jobId && (
              <DownloadedNotify jobId={jobId} onLoadingChange={handleLoadingChange} />
            
          )}      

        <div className="mx-auto max-w-5xl mt-12 p-8 rounded-3xl border border-gray-100 shadow-2xl bg-black/50">
          {/* Search Input */}
          <div className="flex flex-col gap-4 mb-8 sm:flex-row">
            <input
              className="flex-1 bg-black rounded-md p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              type="text"
              disabled={loading}
              value={searchLink}
              onChange={(e) => setSearchLink(e.target.value)}
              placeholder="Enter search term"
            />
            <button
              onClick={searchImages}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white font-semibold rounded-md transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
    
          {/* Feedback */}
          {error && (
            <p className="mb-6 text-sm text-red-600 font-medium bg-red-50 p-3 rounded-xl text-center">
              {error}
            </p>
          )}
          {message && (
            <p className="mb-6 text-sm text-green-600 font-medium bg-green-50 p-3 rounded-xl text-center">
              {message}
            </p>
          )}
          {loading && (
            <p className="mb-6 text-sm text-teal-600 font-medium flex items-center justify-center animate-pulse">
              <svg
                className="w-5 h-5 mr-2 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Processing...
            </p>
          )}
    
         
    
          {/* Image Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <img
                    src={img.thumbnail}
                    alt={img.title}
                    className="w-full h-48 object-cover rounded-md mb-3"
                    loading="lazy"
                  />
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {img.title}
                  </h3>
                  <p
                    className={`text-sm font-medium ${
                      img.isFree ? 'text-green-600' : 'text-orange-500'
                    }`}
                  >
                    {img.isFree ? 'Free' : 'Paid'}
                  </p>
                  <button
                    onClick={() => openConfirmDialog(img.id, 100, img.title)}
                    disabled={isLoadingInner}
                    className="w-full mt-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                  >
                    {isLoadingInner ? 'Processing...' : 'Buy for 100 Coins'}
                  </button>
                </div>
              ))}
            </div>
          )}
    
          {/* Confirmation Modal */}
          {showConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Confirm Purchase
                </h2>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to purchase{' '}
                  <span className="font-semibold">"{showConfirm.title}"</span> for{' '}
                  <span className="font-semibold text-green-600">
                    {showConfirm.amount} coins
                  </span>
                  ? The image will download automatically after purchase.
                </p>
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={closeConfirmDialog}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmPurchase}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold rounded-lg shadow transition-all duration-300"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        </>

      );
};

export default Search;