import leftButton from "./assets/leftButton.png";
import rightButton from "./assets/rightButton.png";

interface LevelCardProps {
  title: string;
  backgroundImage: string;
  onPrevious?: () => void;
  onNext?: () => void;
  onPlay: () => void;
  isActive?: boolean;
}

export const LevelCard = ({
  title,
  backgroundImage,
  onPrevious,
  onNext,
  onPlay,
  isActive = true,
}: LevelCardProps) => {
  return (
    <div className="relative flex items-center gap-4 border-4 rounded-3xl border-white h-full">
      <img
        src={backgroundImage}
        alt="Jungle Background"
        className="w-full h-full rounded-3xl object-cover"
      />

      <div
        className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-2xl border-white border-8 rotate-3"
        style={{
          backgroundColor: "#DCE0FF",
        }}
      >
        <span className="text-lg font-bold whitespace-nowrap">{title}</span>
      </div>

      {isActive && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
          {onPrevious && (
            <button onClick={onPrevious} className="w-8">
              <img src={leftButton} alt="Left Button" />
            </button>
          )}

          <div
            className="text-lg font-bold border-white border-8 rounded-2xl px-8 py-2 text-white text-shadow-2xs cursor-pointer"
            style={{ backgroundColor: "#FFBA0A" }}
            onClick={onPlay}
          >
            jouer
          </div>

          {onNext && (
            <button onClick={onNext} className="w-8">
              <img src={rightButton} alt="Right Button" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
