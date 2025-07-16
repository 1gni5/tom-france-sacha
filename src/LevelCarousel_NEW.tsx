import { useState, useEffect } from "react";
import { LevelCard } from "./LevelCard";
import { getCategories, type Category } from "./lib/db";

interface Level {
  id: number;
  title: string;
  backgroundImage: string;
}

interface LevelCarouselProps {
  onPlay: (levelId: number) => void;
}

export const LevelCarousel = ({ onPlay }: LevelCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [levels, setLevels] = useState<Level[]>([]);

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await getCategories();

        // Convert categories to levels
        const levelsFromDB: Level[] = await Promise.all(
          categories.map(async (category: Category) => {
            // Convert File to URL for display
            const backgroundUrl = URL.createObjectURL(category.picture);

            return {
              id: category.id!,
              title: category.title,
              backgroundImage: backgroundUrl,
            };
          })
        );

        setLevels(levelsFromDB);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

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
    if (levels.length > 0) {
      onPlay(levels[currentIndex].id);
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-screen h-64 overflow-hidden">
      {levels.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-white text-xl">Aucun niveau disponible. Ajoutez des niveaux via le menu des paramètres.</p>
        </div>
      ) : (
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
      )}
    </div>
  );
};
