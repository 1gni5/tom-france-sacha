import { useState } from "react";
import { LevelCard } from "./LevelCard";
import jungleBackground from "./assets/jungleBackground.png";

interface Level {
  id: number;
  title: string;
  backgroundImage: string;
}

// Sample levels data
const levels: Level[] = [
  {
    id: 1,
    title: "Niveau 1 : les animaux",
    backgroundImage: jungleBackground,
  },
  {
    id: 2,
    title: "Niveau 2 : les transports",
    backgroundImage: jungleBackground,
  },
  {
    id: 3,
    title: "Niveau 3 : les couleurs",
    backgroundImage: jungleBackground,
  },
  {
    id: 4,
    title: "Niveau 4 : la nourriture",
    backgroundImage: jungleBackground,
  },
  {
    id: 5,
    title: "Niveau 5 : les vêtements",
    backgroundImage: jungleBackground,
  },
];

interface LevelCarouselProps {
  onPlay: (levelId: number) => void;
}

export const LevelCarousel = ({ onPlay }: LevelCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

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
    onPlay(levels[currentIndex].id);
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-screen h-64 overflow-hidden">
      <div
        className="flex items-center h-full transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(calc(50vw - 200px - ${currentIndex * 400}px))`,
        }}
      >
        {levels.map((level, index) => (
          <div
            key={level.id}
            className="flex-shrink-0 w-96 h-64 mx-2"
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
              onPrevious={goToPrevious}
              onNext={goToNext}
              onPlay={handlePlay}
              isActive={index === currentIndex}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
