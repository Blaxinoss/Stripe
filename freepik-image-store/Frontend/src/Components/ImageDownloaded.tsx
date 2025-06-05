import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import io, { Socket } from "socket.io-client";
import axios from "axios";

interface Image {
  pageUrl: string;
  _id: string;
  userId: string;
  downloadUrl: string;
  jobId: string;
  downloadCount: number;
}

const ImageDownloaded: React.FC = () => {
  const { user, token } = useAuth();
  const [images, setImages] = useState<Image[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [jobId, setJobId] = useState<string | null>(null);
  const [imageAskingForDownload, setImageAskingForDownload] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null); // لتخزين مثيل Socket.IO
  const resolveRef = useRef<((url: string) => void) | null>(null); // لتخزين دالة resolve للـ Promise
  const rejectRef = useRef<((reason: any) => void) | null>(null); // لتخزين دالة reject للـ Promise

  // دالة لجلب الصور
  const fetchImages = async () => {
    if (!token) {
      setError("No authentication token found. Please log in.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/images/user-images`,
        {
          headers: { Authorization: `${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch images");
      const data: Image[] = await response.json();
      setImages(data);
      setError(null);
    } catch (err) {
      setError("Failed to load images. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // دالة لتجديد رابط التحميل
  const regenerateDownloadLink = async (image: Image) => {
    if (!token) throw new Error("No authentication token found.");
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/freepik/regenerate-link`,
      { userId: user?._id, downloadLink: image.pageUrl },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );
    if (response.status !== 200) throw new Error("Failed to regenerate link");
    return response.data.jobId;
  };

  // دالة لتحديث عدد التحميلات
  const updateDownloadCount = async (imageId: string) => {
    if (!token) throw new Error("No authentication token found.");
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/images/user-images/${imageId}/downloadcounteradd`,
      {
        method: "PUT",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to update download count");
    return response.json();
  };

  // دالة لانتظار حدث regenerateLink باستخدام الـ socket الموجود
  const waitForRegenerateLink = (jobId: string) =>
    new Promise<string>((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error("Socket.IO is not connected."));
        return;
      }

      resolveRef.current = resolve;
      rejectRef.current = reject;

      // إعداد timeout لمنع الانتظار إلى الأبد
      setTimeout(() => {
        reject(new Error("Timeout waiting for link regeneration"));
      }, 30000);
    });

  // إعداد Socket.IO
  useEffect(() => {
    if (!user?._id || !token) {
      setError("User not authenticated. Please log in.");
      setIsLoading(false);
      return;
    }

    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.emit("join", user._id);

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
      setError(null);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err.message);
      setError(`Failed to connect to server: ${err.message}`);
      setIsLoading(false);
    });

    socket.on("regenerateLink", async (data: { jobId: string; userId: string; imageUrl: string }) => {
      if (data.jobId === jobId && imageAskingForDownload) {
        if (data.userId !== user._id) {
          if (rejectRef.current) {
            rejectRef.current(new Error("User ID mismatch."));
          }
          setError("User ID mismatch.");
          return;
        }
        try {
          await axios.put(
            `${import.meta.env.VITE_BACKEND_URL}/api/images/user-images/${imageAskingForDownload}/update-download-url`,
            { newDownloadUrl: data.imageUrl },
            {
              headers: {
                Authorization: `${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          setImages((prev) =>
            prev.map((img) =>
              img._id === imageAskingForDownload ? { ...img, downloadUrl: data.imageUrl } : img
            )
          );
          if (resolveRef.current) {
            resolveRef.current(data.imageUrl);
          }
        } catch (error) {
          console.error("Failed to update download URL in database", error);
          setError("Failed to update download URL in database");
          if (rejectRef.current) {
            rejectRef.current(error);
          }
        }
      }
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("regenerateLink");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id, token, jobId, imageAskingForDownload]);

  // جلب الصور عند التحميل الأولي
  useEffect(() => {
    if (user?._id) {
      fetchImages();
    }
  }, [user?._id, token]);

  // دالة التحميل
  const handleDownload = async (image: Image) => {
    if (!token) {
      setError("No authentication token found. Please log in.");
      return;
    }

    setImageAskingForDownload(image._id);
    try {
      const urlCheckResponse = await fetch(image.downloadUrl, { method: "HEAD" });

      if (!urlCheckResponse.ok) {
        const jobId = await regenerateDownloadLink(image);
        setJobId(jobId);
        const newUrl = await waitForRegenerateLink(jobId);
        setImages((prev) =>
          prev.map((img) =>
            img._id === image._id ? { ...img, downloadUrl: newUrl } : img
          )
        );
      }

      if (image.downloadCount >= 3) {
        setError("You have reached the maximum download limit for this image.");
        return;
      }

      const { downloadCount } = await updateDownloadCount(image._id);
      const link = document.createElement("a");
      link.href = image.downloadUrl;
      link.download = image.downloadUrl.split("/").pop() || "image";
      link.click();
      setImages((prevImages) =>
        prevImages.map((img) =>
          img._id === image._id ? { ...img, downloadCount } : img
        )
      );
    } catch (err) {
      console.error("Error in handleDownload:", err);
      setError("Failed to download the image. Please try again.");
    }
  };

  // دالة لاستخراج تاريخ الانتهاء
  const getExpiryDate = (urlObj: URL): string | null => {
    const token = urlObj.searchParams.get("token");
    const match = token?.match(/exp=(\d+)/);
    const exp = match ? parseInt(match[1]) : null;

    if (!exp) return null;

    const date = new Date(exp * 1000);
    return date.toLocaleString("en-US", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        Your Image Gallery
      </h1>
      {error && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <p style={{ color: "red" }}>Error: {error}</p>
          <button
            onClick={fetchImages}
            style={{
              padding: "10px",
              backgroundColor: "#007bff",
              color: "white",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}
      {isLoading && <p style={{ textAlign: "center" }}>Loading images...</p>}
      {images.length === 0 && !isLoading && !error && (
        <p style={{ textAlign: "center" }}>
          No images found. Start downloading some!
        </p>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        {images.map((image) => (
          <div
            key={image._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              padding: "10px",
            }}
          >
            {image.downloadUrl && (
              <p>
                {new URL(image.downloadUrl).searchParams.get("filename")} -{" "}
                {getExpiryDate(new URL(image.downloadUrl)) || "No expiry date available"}
              </p>
            )}
            <img
              src={image.downloadUrl}
              alt={`Image ${image.jobId}`}
              loading="lazy"
              style={{
                width: "100%",
                height: "150px",
                objectFit: "cover",
                borderRadius: "20px",
                marginBottom: "5px",
                marginTop: "5px",
              }}
              onError={() => setError(`Failed to load image ${image.jobId}`)}
            />
            <div style={{ padding: "10px" }}>
              <button
                disabled={image.downloadCount >= 3}
                onClick={() => handleDownload(image)}
                style={{
                  backgroundColor: image.downloadCount >= 3 ? "#ccc" : "#3b82f6",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "5px",
                  cursor: image.downloadCount >= 3 ? "not-allowed" : "pointer",
                  border: "none",
                }}
              >
                Download ({image.downloadCount}/3)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageDownloaded;