import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LevelCard } from "./LevelCard";
import { getCategories, type Category } from "./lib/db";

interface Level {
  id: number;
  title: string;
  backgroundImage: string;
  route?: string; // Optional route for special levels
}

interface LevelCarouselProps {
  onPlay: (levelId: number) => void;
}

export const LevelCarousel = ({ onPlay }: LevelCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [levels, setLevels] = useState<Level[]>([]);
  const navigate = useNavigate();

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await getCategories();        // Convert categories to levels
        const levelsFromDB: Level[] = await Promise.all(
          categories.map(async (category: Category, index: number) => {
            // category.picture is now a base64 string
            const backgroundUrl = category.picture;

            return {
              id: category.id!,
              title: `Niveau ${index + 1} - ${category.title}`,
              backgroundImage: backgroundUrl,
              route: "/bubble-minigame", // All levels go to bubble minigame
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
    const currentLevel = levels[currentIndex];
    if (currentLevel.route) {
      // Navigate to the specified route with category ID as state
      navigate(currentLevel.route, { state: { categoryId: currentLevel.id } });
    } else {
      // Use the original onPlay function for other levels
      onPlay(currentLevel.id);
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-screen h-80 overflow-hidden">
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
      )}
    </div>
  );
};
