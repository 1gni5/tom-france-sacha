import menuBackground from "./assets/menuBackground.jpg";
import chestButton from "./assets/chestButton.png";
import bookButton from "./assets/bookButton.png";

import { Link } from 'react-router-dom';
import { LevelCarousel } from "./LevelCarousel";

import { useState, useEffect } from "react";

export function updateApplication() {
  if (navigator.onLine) location.reload();
}

export const MenuPage = () => {
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [totalWords, setTotalWords] = useState(0);

  // Load progress and word count from database
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const categories = await getCategories();
        const words = await getWords();

        // Calculate progress percentage
        const completedCategories = categories.filter(cat => cat.isCompleted).length;
        const totalCategories = categories.length;
        const percentage = totalCategories > 0 ? Math.round((completedCategories / totalCategories) * 100) : 0;

        setProgressPercentage(percentage);
        setTotalWords(words.length);
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    };

    loadProgress();
  }, []);

  const handlePlayLevel = (levelId: number) => {
    console.log(`Playing level ${levelId}`);

    updateApplication();
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${menuBackground})` }}
    >
      <div className="top-4 left-0 right-0 flex items-center justify-between p-4">
        {/* Left button with image */}
        <Link to="/treasure">
          <img src={chestButton} alt="Chest Icon" className="h-12 w-auto" />
        </Link>

        {/* Center progress bar */}
        <div
          className="flex items-center gap-3 p-4 rounded-4xl"
          style={{
            backgroundColor: "#ADDBCE",
          }}
        >
          <div
            className="relative h-4 w-128"
            style={{ backgroundColor: "#EDEDED", borderRadius: "94px" }}
          >
            {/* Progress dots positioned across entire bar */}
            {[...Array(10)].map((_, index) => (
              <div
                key={index}
                className="absolute top-1/2 transform -translate-y-1/2 w-1 h-1 rounded-full"
                style={{
                  backgroundColor: "#EDEDED",
                  left: `${(index + 1) * 10 - 5}%`,
                  zIndex: 2,
                }}
              />
            ))}

            <div
              className="h-full relative"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: "#03302D",
                borderRadius: "94px",
                transition: "width 0.3s ease-out",
                zIndex: 1,
              }}
            />
          </div>
          <span className="text-sm font-medium">{progressPercentage}%</span>
        </div>

        {/* Right button with image */}
        <button>
          <img src={bookButton} alt="Dictionary Icon" className="h-12 w-auto" />
        </button>
      </div>

      {/* Title of the page*/}
      <h1 className="text-4xl font-bold text-center mt-8 mb-4 mochiy-pop-one-regular">
        Carnet de l'explorateur <span style={{ color: "#2252F1" }}>Sacha</span>
      </h1>

      {/* Main content carousel */}
      <LevelCarousel onPlay={handlePlayLevel} />

      {/* Stick on bottom left corner text with style */}
      <div className="fixed bottom-4 left-4">
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-2xl align-bottom"
          style={{ backgroundColor: "#ADDBCE" }}
        >
          <span className="text-4xl font-bold" style={{ color: "#03302D" }}>
            {totalWords}
          </span>
          <div className="flex flex-col  ">
            <span
              className="text-lg leading-none font-bold"
              style={{ color: "#03302D" }}
            >
              mots
            </span>
            <span
              className="text-lg leading-none font-bold"
              style={{ color: "#03302D" }}
            >
              collectés
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
