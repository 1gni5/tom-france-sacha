import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import minigameBackground from './assets/minigameBackground.jpg';
import crocodile from './assets/animals/crocodile.jpg';
import hippopotame from './assets/animals/hippopotame.jpg';
import singe from './assets/animals/singe.jpg';
import leopard from './assets/animals/leopard.jpg';
import perroquet from './assets/animals/perroquet.jpg';
import serpent from './assets/animals/serpent.jpg';

// Import sound files
import crocodileSound from './assets/sounds/crocodile.mp3';
import hippopotameSound from './assets/sounds/hippopotame.mp3';
import singeSound from './assets/sounds/singe.mp3';
import leopardSound from './assets/sounds/leopard.mp3';
import perroquetSound from './assets/sounds/perroquet.mp3';
import serpentSound from './assets/sounds/serpent.mp3';

interface Bubble {
  id: string;
  x: number;
  y: number;
  isOpen: boolean;
  text: string;
  image: string;
  sound: string;
  color: string;
  size: number;
  speed: number;
  baseX: number; // Store original X for drift calculation
}

const COLORS = [
  "#60a5fa", // blue-400
  "#4ade80", // green-400
  "#a855f7", // purple-400
  "#ec4899", // pink-400
  "#facc15", // yellow-400
  "#f87171", // red-400
  "#fb923c", // orange-400
  "#2dd4bf", // teal-400
];

const BUBBLE_CONTENTS = [
  { text: "Crocodile", image: crocodile, sound: crocodileSound },
  { text: "Hippopotame", image: hippopotame, sound: hippopotameSound },
  { text: "Singe", image: singe, sound: singeSound },
  { text: "Léopard", image: leopard, sound: leopardSound },
  { text: "Perroquet", image: perroquet, sound: perroquetSound },
  { text: "Serpent", image: serpent, sound: serpentSound },
];

export const BubbleMiniGamePage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const lastSpawnTime = useRef<number>(0);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());
  const navigate = useNavigate();

  // Timer state - 1.30 minutes = 90 seconds
  const [timeLeft, setTimeLeft] = useState(5);
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
      // Load images
      const imagePromises = BUBBLE_CONTENTS.map(content => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            imageCache.current.set(content.image, img);
            resolve();
          };
          img.onerror = () => {
            console.error(`Failed to load image: ${content.image}`);
            resolve();
          };
          img.src = content.image;
        });
      });

      // Load audio files
      const audioPromises = BUBBLE_CONTENTS.map(content => {
        return new Promise<void>((resolve) => {
          const audio = new Audio();
          audio.oncanplaythrough = () => {
            audioCache.current.set(content.sound, audio);
            resolve();
          };
          audio.onerror = () => {
            console.error(`Failed to load audio: ${content.sound}`);
            resolve();
          };
          audio.src = content.sound;
          audio.preload = 'auto';
        });
      });

      await Promise.all([...imagePromises, ...audioPromises]);
    };

    loadAssets();
  }, []);

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
  const createBubble = (): Bubble => {
    const content = BUBBLE_CONTENTS[Math.floor(Math.random() * BUBBLE_CONTENTS.length)];
    const x = Math.random() * (window.innerWidth - 100);
    return {
      id: `bubble-${Date.now()}-${Math.random()}`,
      x,
      y: window.innerHeight + 50,
      baseX: x,
      isOpen: false,
      text: content.text,
      image: content.image,
      sound: content.sound,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 100 + Math.random() * 60, // Much larger: 100-160px instead of 60-100px
      speed: 0.1 + Math.random(),
    };
  };

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Check if click is on any bubble
    setBubbles(prev => prev.map(bubble => {
      const distance = Math.sqrt(
        Math.pow(clickX - bubble.x, 2) + Math.pow(clickY - bubble.y, 2)
      );

      if (distance <= bubble.size && !bubble.isOpen) {
        // Play the sound for this bubble
        playSound(bubble.sound);
        return { ...bubble, isOpen: true };
      }
      return bubble;
    }));
  };

  // Draw a bubble on canvas
  const drawBubble = (ctx: CanvasRenderingContext2D, bubble: Bubble) => {
    if (!bubble.isOpen) {
      // Draw closed bubble - modern glass-like sphere
      const radius = bubble.size;

      // Main bubble gradient
      const gradient = ctx.createRadialGradient(
        bubble.x - radius * 0.3, bubble.y - radius * 0.3, 0,
        bubble.x, bubble.y, radius
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      gradient.addColorStop(0.2, bubble.color + 'CC'); // Add transparency
      gradient.addColorStop(0.8, bubble.color);
      gradient.addColorStop(1, bubble.color + '88'); // Darker edge

      // Draw main bubble
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Add outer ring/border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Large highlight (main reflection)
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

      // Small bright highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(bubble.x - radius * 0.4, bubble.y - radius * 0.4, radius * 0.15, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // Draw opened bubble - large circular card design
      const radius = bubble.size; // Same size as closed bubble

      // Draw card shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(bubble.x + 3, bubble.y + 5, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw main card background (circle)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw colored border
      ctx.strokeStyle = bubble.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw inner highlight border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, radius - 3, 0, Math.PI * 2);
      ctx.stroke();

      // Draw image with background circle
      const imageSize = radius * 0.8; // Increased image size relative to bubble
      const imageY = bubble.y - radius * 0.3;

      // Image background circle
      ctx.fillStyle = bubble.color + '20'; // Very transparent
      ctx.beginPath();
      ctx.arc(bubble.x, imageY, imageSize/2 + 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw the actual image
      const img = imageCache.current.get(bubble.image);
      if (img) {
        const imgRadius = imageSize / 2;

        // Calculate scaling to maintain aspect ratio and fill the circle
        const imgAspectRatio = img.width / img.height;
        let srcWidth, srcHeight, srcX, srcY;

        if (imgAspectRatio > 1) {
          // Image is wider than tall - crop the width
          srcHeight = img.height;
          srcWidth = img.height; // Make it square by using height as width
          srcX = (img.width - srcWidth) / 2; // Center horizontally
          srcY = 0;
        } else {
          // Image is taller than wide or square - crop the height
          srcWidth = img.width;
          srcHeight = img.width; // Make it square by using width as height
          srcX = 0;
          srcY = (img.height - srcHeight) / 2; // Center vertically
        }

        // Create circular clipping path for the image
        ctx.save();
        ctx.beginPath();
        ctx.arc(bubble.x, imageY, imgRadius, 0, Math.PI * 2);
        ctx.clip();

        // Draw the cropped image to fit the circle
        ctx.drawImage(
          img,
          srcX, srcY, srcWidth, srcHeight, // Source rectangle (cropped)
          bubble.x - imgRadius,
          imageY - imgRadius,
          imageSize,
          imageSize // Destination rectangle
        );

        ctx.restore();

        // Add a subtle border around the image
        ctx.strokeStyle = bubble.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bubble.x, imageY, imgRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw text with better typography
      ctx.font = 'bold 18px Arial'; // Larger text
      ctx.fillStyle = '#1f2937'; // dark gray
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bubble.text, bubble.x, bubble.y + radius * 0.4);

      // Add subtle inner glow
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

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = (currentTime: number) => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn new bubbles
      if (currentTime - lastSpawnTime.current > 2000 && bubbles.length < 5) {
        setBubbles(prev => [...prev, createBubble()]);
        lastSpawnTime.current = currentTime;
      }

      // Update and draw bubbles
      setBubbles(prev => prev
        .map(bubble => ({
          ...bubble,
          y: bubble.y - bubble.speed,
          x: bubble.baseX + Math.sin(currentTime * 0.001 + bubble.id.length) * 20,
        }))
        .filter(bubble => bubble.y > -200)
      );

      // Draw all bubbles
      bubbles.forEach(bubble => drawBubble(ctx, bubble));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [bubbles]);

  return (
    <div
      style={{ backgroundImage: `url(${minigameBackground})` }}
      className="h-screen w-screen bg-cover bg-center relative overflow-hidden"
    >
      {/* Back button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => navigate('/')}
          className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg hover:bg-white/100 transition-colors"
        >
          <span className="text-sm text-gray-800 font-medium">← Retour</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg max-w-xs">
          <span className="text-sm text-gray-800">Clique sur les bulles pour découvrir les mots !</span>
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
