import minigameBackground from './assets/minigameBackground.jpg';
import chestImage from './assets/chestButton.png';
import songIcon from './assets/songIcon.svg';
import comptineIcon from './assets/comptineIcon.svg';
import storyIcon from './assets/storyIcon.svg';
import backButton from './assets/leftButton.png';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
interface TreasureCardProps {
    icon: string;
    title: string;
    audioSrc?: string;
    isEnabled?: boolean;
    onClick?: () => void;
}

const TreasureCard: React.FC<TreasureCardProps> = ({
    icon,
    title,
    audioSrc,
    isEnabled = true,
    onClick
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleClick = () => {
        if (!isEnabled) return;

        if (audioSrc && audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }

        if (onClick) {
            onClick();
        }
    };

    const handleAudioEnd = () => {
        setIsPlaying(false);
    };

    const cardClasses = `
    ${isEnabled
            ? 'border-[#8FCBBC] bg-white cursor-pointer hover:shadow-lg transition-shadow'
            : 'border-[#676767] bg-gray-300 cursor-not-allowed'
        }
    p-4 border-4 rounded-xl flex flex-col items-center justify-center gap-4
  `;

    const textClasses = `
    ${isEnabled ? 'text-black' : 'text-[#676767]'}
    text-lg font-poppins font-semibold
  `;

    return (
        <div className={cardClasses} onClick={handleClick}>
            <img
                src={icon}
                alt={title}
                className={`w-24 h-24 ${isEnabled ? '' : 'opacity-50'}`}
            />
            <p className={textClasses}>
                {title}
                {isPlaying && ' 🎵'}
            </p>
            {audioSrc && (
                <audio
                    ref={audioRef}
                    onEnded={handleAudioEnd}
                    preload="metadata"
                >
                    <source src={audioSrc} type="audio/mpeg" />
                </audio>
            )}
        </div>
    );
};
interface TreasureData {
    icon: string;
    title: string;
    audioSrc?: string;
    isEnabled: boolean;
}

export const Treasure = () => {
        const navigate = useNavigate();

    const enabledTreasures: TreasureData[] = [
        {
            icon: songIcon,
            title: "Chantier chouchou",
            audioSrc: "/treasures/chantier-chouchou.mp3",
            isEnabled: true
        },
        {
            icon: storyIcon,
            title: "Te regarder grandir",
            audioSrc: "/treasures/te-regarder-grandir.mp3",
            isEnabled: true
        },
        {
            icon: comptineIcon,
            title: "Mon petit sacha",
            audioSrc: "/treasures/mon-petit-sacha.mp3",
            isEnabled: true
        }
    ];

    const disabledTreasures: TreasureData[] = Array.from({ length: 9 }).map((_, index) => ({
        icon: chestImage,
        title: `Niveau ${index + 4}`,
        audioSrc: undefined,
        isEnabled: false
    }));

    const allTreasures: TreasureData[] = [...enabledTreasures, ...disabledTreasures];


    return (<div
        style={{ backgroundImage: `url(${minigameBackground})` }}
        className="h-screen w-screen bg-cover bg-center relative overflow-hidden flex flex-col py-8 px-16 gap-14"
    >
        <div className='flex items-center'>
            <button className='' onClick={() => navigate('/')}>
                <img src={backButton} alt="Back" className='size-16' />
            </button>
            <h1 className='text-4xl font-bold m-4 font-mochiy-pop-one text-[#03302D] w-full text-center'>
                Mes trésors
            </h1>
        </div>
        <div className="grid grid-cols-4 gap-4 p-4">
            {allTreasures.map((treasure, index) => (
                <TreasureCard
                    key={index}
                    icon={treasure.icon}
                    title={treasure.title}
                    audioSrc={treasure.audioSrc}
                    isEnabled={treasure.isEnabled}
                    onClick={() => console.log(`Clicked ${treasure.title}`)}
                />
            ))}
        </div>
    </div>)
}
