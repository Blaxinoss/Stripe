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
  const { user, token ,setUser} = useAuth();
  const socket = useSocket();


  const [images, setImages] = useState<Image[]>([]);
  const [error, setError] = useState<string | null>('');  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [jobId, setJobId] = useState<string | null>(null);
  const [imageIdForDownload, setImageIdForDownload] = useState<string | null>(null);

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
                (prev) =>{
                  if(!prev) return prev;
                  return {...prev, downloadsCount: (prev.downloadsCount || 0) + 1}
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
      if (image.downloadCount >= 3) return setError("Max download limit reached.");

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
    }
  };

  const getExpiryDate = (url: URL) => {
    const token = url.searchParams.get("token");
    const match = token?.match(/exp=(\d+)/);
    const exp = match ? parseInt(match[1]) : null;
    return exp ? new Date(exp * 1000).toLocaleString() : null;
  };

  return (
    <div className="p-5 ">
      <h1 className="text-center mb-5 text-xl font-semibold">Your Image Gallery</h1>

      {error && (
        <div className="text-center mb-5">
          <p className="text-orange-500">Error: {error}</p>
          <button
            onClick={fetchImages}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading && <p className="text-center">Loading images...</p>}

      {!isLoading && images.length === 0 && !error && (
        <p className="text-center">No images found. Start downloading some!</p>
      )}

<div className="grid grid-cols-2 gap-5">
  {images.map((img) => (
    <div
      key={img._id}
      className="border rounded-lg shadow p-2 flex flex-col items-center"
    >
      {img.downloadUrl && (
        <p className="truncate">
          {new URL(img.downloadUrl).searchParams.get("filename")} -{" "}
          {getExpiryDate(new URL(img.downloadUrl)) || "No expiry"}
        </p>
      )}
      
      
  <img
    src={img.downloadUrl}
    alt="Download Link Expired Click Download to Regenerate"
    loading="lazy"
    style={{
      width: "100%",
      color:'red',
      height: "250px",
      objectFit: "cover",
      borderRadius: "20px",
      marginBottom: "5px",
      textAlign: "center",
    }}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
    onError={() => setError(`Image ${new URL(img.downloadUrl).searchParams.get("filename")} has expired or is not available`)}
  />

 

      <div style={{ padding: "10px" }}>
        <button
          disabled={img.downloadCount >= 3}
          onClick={() => handleDownload(img)}
          style={{
            backgroundColor: img.downloadCount >= 3 ? "#ccc" : "#3b82f6",
            color: "white",
            padding: "8px 16px",
            borderRadius: "5px",
            cursor: img.downloadCount >= 3 ? "not-allowed" : "pointer",
            border: "none",
          }}
        >
          Download ({img.downloadCount}/3)
        </button>
      </div>
    </div>
  ))}
</div>
    </div>
  );
};

export default ImageDownloaded; 