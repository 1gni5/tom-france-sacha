import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LevelCard } from "./LevelCard";
import jungleBackground from "./assets/jungleBackground.png";
import transportBackground from "./assets/transportBackground.jpg";
import meteoBackground from "./assets/meteoBackground.jpg";

interface Level {
  id: number;
  title: string;
  backgroundImage: string;
  route?: string; // Optional route for special levels
}

// Sample levels data
const levels: Level[] = [
  {
    id: 1,
    title: "Niveau 1 : les animaux",
    backgroundImage: jungleBackground,
    route: "/bubble-minigame",
  },
  {
    id: 2,
    title: "Niveau 2 : les transports",
    backgroundImage: transportBackground,
  },
  {
    id: 3,
    title: "Niveau 3 : la météo",
    backgroundImage: meteoBackground,
  },
];

interface LevelCarouselProps {
  onPlay: (levelId: number) => void;
}

export const LevelCarousel = ({ onPlay }: LevelCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? levels.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === levels.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePlay = () => {
    const currentLevel = levels[currentIndex];
    if (currentLevel.route) {
      // Navigate to the specified route
      navigate(currentLevel.route);
    } else {
      // Use the original onPlay function for other levels
      onPlay(currentLevel.id);
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-screen h-80 overflow-hidden">
      <div
        className="flex items-center h-full transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(calc(50vw - 200px - ${currentIndex * 400}px))`,
        }}
      >
        {levels.map((level, index) => (
          <div
            key={level.id}
            className="flex-shrink-0 w-96 mx-2"
            style={{
              opacity: index === currentIndex ? 1 : 0.7,
              transform: index === currentIndex ? "scale(1)" : "scale(0.9)",
              transition:
                "opacity 0.7s ease-in-out, transform 0.7s ease-in-out",
            }}
          >
            <LevelCard
              title={level.title}
              backgroundImage={level.backgroundImage}
              onPrevious={index === 0 ? undefined : goToPrevious}
              onNext={index === levels.length - 1 ? undefined : goToNext}
              onPlay={handlePlay}
              isActive={index === currentIndex}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
