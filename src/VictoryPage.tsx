import { useNavigate } from 'react-router-dom';
import victoryVideo from './assets/victory.mp4';

export const VictoryPage = () => {
  const navigate = useNavigate();

  const handleVideoEnd = () => {
    // Navigate back to menu when video ends
    navigate('/');
  };

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden">
      {/* Full-screen video */}
      <video
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        onEnded={handleVideoEnd}
      >
        <source src={victoryVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};
