import { useEffect } from 'react';
import axios from 'axios';

export const useJobPolling = (jobId: string | null, title: string, setStatus: React.Dispatch<React.SetStateAction<string>>) => {
  useEffect(() => {
    if (!jobId) return;

    setStatus('Pending'); // بداية الـ job: قيد المعالجة

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/freepik/job-status/${jobId}`);
        const { status, result, error } = response.data;

        if (status === 'completed' && result?.downloadUrl) {
          clearInterval(interval);
          setStatus('Completed'); // الـ job اكتمل
          console.log('Download URL:', result.downloadUrl);

          const url = new URL(result.downloadUrl);
          const filename = url.searchParams.get('filename') || `${title}.jpg`;

          const link = document.createElement('a');
          link.href = result.downloadUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

        } else if (status === 'failed') {
          clearInterval(interval);
          setStatus('Failed'); // الـ job فشل
          console.error('Job failed:', error);
          alert('Download failed. Please try again.');
        }
      } catch (err: any) {
        console.error('Error polling job status:', err.message);
        setStatus('Error'); // حصل خطأ أثناء استعلام الحالة
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId, title, setStatus]);
};
