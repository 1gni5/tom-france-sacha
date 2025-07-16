import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import minigameBackground from './assets/minigameBackground.jpg';
import { getWords, type Word } from './lib/db';

interface Bubble {
  id: string;
  x: number;
  y: number;
  isOpen: boolean;
  text: string;
  image: string; // Will be a base64 string from DB
  sound: string; // Will be a base64 string from DB
  color: string;
  size: number;
  speed: number;
  baseX: number;
}

const COLORS = [
  "#60a5fa",
  "#4ade80",
  "#a855f7",
  "#ec4899",
  "#facc15",
  "#f87171",
  "#fb923c",
  "#2dd4bf",
];

export const BubbleMiniGamePage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const lastSpawnTime = useRef<number>(0);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());
  const navigate = useNavigate();
  const location = useLocation();
  const [wordData, setWordData] = useState<Word[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load words from database and prepare assets
  // Timer state - 1.30 minutes = 90 seconds
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameEnded, setGameEnded] = useState(false);

  // Play sound function
  const playSound = (soundUrl: string) => {
    const audio = audioCache.current.get(soundUrl);
    if (audio) {
      // Reset the audio to start and play
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error('Error playing sound:', error);
      });
    }
  };

  // Load and cache images and audio
  useEffect(() => {
    const loadAssets = async () => {
      try {
        // Get categoryId from navigation state
        const categoryId = location.state?.categoryId || null;

        // Fetch words from database for the specific category
        const words = await getWords(categoryId);

        // Filter out words without id (shouldn't happen but for type safety)
        const validWords = words.filter((word): word is Word & { id: number } =>
          typeof word.id === 'number'
        );

        setWordData(validWords);

        // Convert Files to base64 and load assets
        const imagePromises = words.map(async (word) => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            const reader = new FileReader();
            reader.onload = () => {
              img.src = reader.result as string;
              img.onload = () => {
                imageCache.current.set(word.image.name, img);
                resolve();
              };
              img.onerror = () => {
                console.error(`Failed to load image: ${word.image.name}`);
                resolve();
              };
            };
            reader.readAsDataURL(word.image);
          });
        });

        const audioPromises = words.map(async (word) => {
          return new Promise<void>((resolve) => {
            const audio = new Audio();
            const reader = new FileReader();
            reader.onload = () => {
              audio.src = reader.result as string;
              audio.oncanplaythrough = () => {
                audioCache.current.set(word.audio.name, audio);
                resolve();
              };
              audio.onerror = () => {
                console.error(`Failed to load audio: ${word.audio.name}`);
                resolve();
              };
              audio.preload = 'auto';
            };
            reader.readAsDataURL(word.audio);
          });
        });

        await Promise.all([...imagePromises, ...audioPromises]);

        // Set data as loaded only after all assets are ready
        setIsDataLoaded(true);
      } catch (error) {
        console.error('Error loading assets from database:', error);
      }
    };

    loadAssets();
  }, [location.state?.categoryId]);


  // Timer countdown effect
  useEffect(() => {
    if (gameEnded) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameEnded(true);
          // Navigate to victory page when timer ends
          navigate('/victory');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameEnded, navigate]);

  // Create a new bubble
  const createBubble = useCallback((): Bubble => {
    if (!isDataLoaded || wordData.length === 0) {
      return {
        id: `bubble-${Date.now()}-${Math.random()}`,
        x: Math.random() * (window.innerWidth - 100),
        y: window.innerHeight + 50,
        baseX: Math.random() * (window.innerWidth - 100),
        isOpen: false,
        text: "Default",
        image: "",
        sound: "",
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 100 + Math.random() * 60,
        speed: 0.1 + Math.random(),
      };
    }

    const content = wordData[Math.floor(Math.random() * wordData.length)];
    const x = Math.random() * (window.innerWidth - 100);
    return {
      id: `bubble-${Date.now()}-${Math.random()}`,
      x,
      y: window.innerHeight + 50,
      baseX: x,
      isOpen: false,
      text: content.text,
      image: content.image.name,
      sound: content.audio.name,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 100 + Math.random() * 60,
      speed: 0.1 + Math.random(),
    };
  }, [isDataLoaded, wordData]);

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    setBubbles(prev => prev.map(bubble => {
      const distance = Math.sqrt(
        Math.pow(clickX - bubble.x, 2) + Math.pow(clickY - bubble.y, 2)
      );

      if (distance <= bubble.size && !bubble.isOpen) {
        playSound(bubble.sound);
        return { ...bubble, isOpen: true };
      }
      return bubble;
    }));
  };

  // Draw a bubble on canvas
  const drawBubble = (ctx: CanvasRenderingContext2D, bubble: Bubble) => {
    if (!bubble.isOpen) {
      const radius = bubble.size;
      const gradient = ctx.createRadialGradient(
        bubble.x - radius * 0.3, bubble.y - radius * 0.3, 0,
        bubble.x, bubble.y, radius
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      gradient.addColorStop(0.2, bubble.color + 'CC');
      gradient.addColorStop(0.8, bubble.color);
      gradient.addColorStop(1, bubble.color + '88');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.ellipse(
        bubble.x - radius * 0.3,
        bubble.y - radius * 0.3,
        radius * 0.3,
        radius * 0.5,
        -Math.PI / 4,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(bubble.x - radius * 0.4, bubble.y - radius * 0.4, radius * 0.15, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const radius = bubble.size;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(bubble.x + 3, bubble.y + 5, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = bubble.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, radius - 3, 0, Math.PI * 2);
      ctx.stroke();

      const imageSize = radius * 0.8;
      const imageY = bubble.y - radius * 0.3;

      ctx.fillStyle = bubble.color + '20';
      ctx.beginPath();
      ctx.arc(bubble.x, imageY, imageSize / 2 + 8, 0, Math.PI * 2);
      ctx.fill();

      const img = imageCache.current.get(bubble.image);
      if (img) {
        const imgRadius = imageSize / 2;
        const imgAspectRatio = img.width / img.height;
        let srcWidth, srcHeight, srcX, srcY;

        if (imgAspectRatio > 1) {
          srcHeight = img.height;
          srcWidth = img.height;
          srcX = (img.width - srcWidth) / 2;
          srcY = 0;
        } else {
          srcWidth = img.width;
          srcHeight = img.width;
          srcX = 0;
          srcY = (img.height - srcHeight) / 2;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(bubble.x, imageY, imgRadius, 0, Math.PI * 2);
        ctx.clip();

        ctx.drawImage(
          img,
          srcX, srcY, srcWidth, srcHeight,
          bubble.x - imgRadius,
          imageY - imgRadius,
          imageSize,
          imageSize
        );

        ctx.restore();

        ctx.strokeStyle = bubble.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bubble.x, imageY, imgRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = '#1f2937';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bubble.text, bubble.x, bubble.y + radius * 0.4);

      const glowGradient = ctx.createRadialGradient(
        bubble.x, bubble.y, 0,
        bubble.x, bubble.y, radius
      );
      glowGradient.addColorStop(0, bubble.color + '15');
      glowGradient.addColorStop(0.7, bubble.color + '08');
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = (currentTime: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Only create bubbles if data is loaded
      if (isDataLoaded && currentTime - lastSpawnTime.current > 2000 && bubbles.length < 5) {
        setBubbles(prev => [...prev, createBubble()]);
        lastSpawnTime.current = currentTime;
      }

      setBubbles(prev => prev
        .map(bubble => ({
          ...bubble,
          y: bubble.y - bubble.speed,
          x: bubble.baseX + Math.sin(currentTime * 0.001 + bubble.id.length) * 20,
        }))
        .filter(bubble => bubble.y > -200)
      );

      bubbles.forEach(bubble => drawBubble(ctx, bubble));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [bubbles, wordData, isDataLoaded, createBubble]);

  return (
    <div
      style={{ backgroundImage: `url(${minigameBackground})` }}
      className="h-screen w-screen bg-cover bg-center relative overflow-hidden"
    >
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => navigate('/')}
          className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg hover:bg-white/100 transition-colors"
        >
          <span className="text-sm text-gray-800 font-medium">← Retour</span>
        </button>
      </div>

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg max-w-xs">
          {!isDataLoaded ? (
            <span className="text-sm text-gray-800">Chargement des mots...</span>
          ) : (
            <span className="text-sm text-gray-800">Clique sur les bulles pour découvrir les mots !</span>
          )}
        </div>
      </div>
      {/* Timer */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
          <span className="text-sm text-gray-800 font-medium">
            ⏰ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Canvas */}

      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="absolute top-0 left-0 cursor-pointer"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
