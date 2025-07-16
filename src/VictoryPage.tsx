import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { getCachedFile } from '@/lib/cache';
import victoryVideo from './assets/victory.mp4';

export const VictoryPage: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPlayButton, setShowPlayButton] = useState<boolean>(true);
  const [fileBlobUrl, setFileBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let blobUrl: string | undefined;
    const loadFile = async () => {
      try {
        blobUrl = await getCachedFile(victoryVideo);
        setFileBlobUrl(blobUrl);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadFile();

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, []);

  const handleVideoEnd = () => {
    // Navigate back to menu when video ends
    navigate('/');
  };

  const handlePlayClick = () => {
    const video = videoRef.current;
    if (video) {
      video.play().then(() => {
        setShowPlayButton(false);
      }).catch((error: Error) => {
        console.error('Error playing video:', error);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading video...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden">
      {/* Full-screen video */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        onEnded={handleVideoEnd}
      >
        <source src={fileBlobUrl!} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Play button modal */}
      {showPlayButton && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div
            className="backdrop-blur-sm rounded-2xl p-8 shadow-2xl text-center border-8 border-white"
            style={{ backgroundColor: '#D7F0C6' }}
          >
            <button
              onClick={handlePlayClick}
              className="text-white font-bold w-24 h-24 rounded-full text-4xl transition-colors flex items-center justify-center"
            >
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
};