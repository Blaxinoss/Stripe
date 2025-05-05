import axios from 'axios';
import React, { useEffect, useState } from 'react';

// تعريف نوع البيانات للـ Image
interface Image {
    _id: string;
    downloadUrl: string;
    downloadCount: number;
    maxDownloads: number;
}

interface UserProfileProps {
    userId: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
    const [images, setImages] = useState<Image[]>([]);

    // جلب الصور من الباك-إند
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await axios.get<Image[]>(`http://localhost:5000/api/users/user-images/${userId}`);
                setImages(response.data);
            } catch (error) {
                console.error('Error fetching images:', error);
            }
        };
        fetchImages();
    }, [userId]);

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-center mb-6">Your Purchased Images</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {images.length > 0 ? (
                    images.map((image) => (
                        <div key={image._id} className="flex flex-col items-center">
                            <img
                                src={image.downloadUrl}
                                alt="Purchased"
                                className="w-[200px] h-[200px] object-cover rounded-lg shadow-md"
                            />
                            <p className="mt-2 text-gray-700">
                                Downloads Remaining: {image.maxDownloads - image.downloadCount}
                            </p>
                            {image.downloadCount < image.maxDownloads ? (
                                <a
                                    href={image.downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                                >
                                    Download
                                </a>
                            ) : (
                                <p className="mt-2 text-red-500">Download Limit Reached</p>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 col-span-full">No images purchased yet.</p>
                )}
            </div>
        </div>
    );
};

export default UserProfile;