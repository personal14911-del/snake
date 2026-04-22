import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '../lib/utils';
import { Trophy, RefreshCw, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_SPEED = 150;

type Point = { x: number; y: number };

function generateFood(snake: Point[]): Point {
  let newFood;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // Ensure food doesn't spawn on the snake
    if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      break;
    }
  }
  return newFood;
}

export function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 }); // Initial food
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const directionRef = useRef(direction);
  const snakeRef = useRef(snake);
  const speedRef = useRef(INITIAL_SPEED);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(() => {
    setFood(generateFood(INITIAL_SNAKE));
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'].includes(e.key)) {
      e.preventDefault();
    }

    if (isGameOver) {
      if (e.key === 'Enter' || e.key === ' ') resetGame();
      return;
    }

    if (e.key === ' ' || e.key === 'Escape') {
      setIsPaused(p => !p);
      return;
    }

    if (!hasStarted && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
      setHasStarted(true);
    }

    const currentDir = directionRef.current;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        if (currentDir.y !== 1) setDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
      case 's':
        if (currentDir.y !== -1) setDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
      case 'a':
        if (currentDir.x !== 1) setDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
      case 'd':
        if (currentDir.x !== -1) setDirection({ x: 1, y: 0 });
        break;
    }
  }, [isGameOver, hasStarted]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const moveSnake = useCallback(() => {
    if (isPaused || isGameOver || !hasStarted) return;

    setSnake((prevSnake) => {
      const newPath = [...prevSnake];
      const head = { ...newPath[0] };

      head.x += directionRef.current.x;
      head.y += directionRef.current.y;

      // Handle Wall Collision (Crash)
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        handleGameOver();
        return prevSnake;
      }

      // Handle Self Collision
      if (newPath.some(segment => segment.x === head.x && segment.y === head.y)) {
        handleGameOver();
        return prevSnake;
      }

      newPath.unshift(head);

      // Handle Food Collision
      setFood((currentFood) => {
        if (head.x === currentFood.x && head.y === currentFood.y) {
          setScore(s => {
            const newScore = s + 10;
            // Increase speed slightly up to a limit
            speedRef.current = Math.max(50, INITIAL_SPEED - newScore / 2);
            return newScore;
          });
          return generateFood(newPath); // Return new food
        }
        // If not eaten, pop tail
        newPath.pop();
        return currentFood; // Keep old food
      });

      return newPath;
    });
  }, [isPaused, isGameOver, hasStarted]);

  const handleGameOver = () => {
    setIsGameOver(true);
    setScore((s) => {
      setHighScore((prev) => {
        const newRecord = Math.max(prev, s);
        localStorage.setItem('snakeHighScore', newRecord.toString());
        return newRecord;
      });
      return s;
    });
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setHasStarted(false);
    speedRef.current = INITIAL_SPEED;
    setFood(generateFood(INITIAL_SNAKE));
  };

  useEffect(() => {
    let timeoutId: number;
    const gameLoop = () => {
      moveSnake();
      timeoutId = window.setTimeout(gameLoop, speedRef.current);
    };
    timeoutId = window.setTimeout(gameLoop, speedRef.current);
    
    return () => clearTimeout(timeoutId);
  }, [moveSnake]);

  // Handle D-pad clicks for mobile
  const handleDirClick = (dir: Point) => {
    const currentDir = directionRef.current;
    if (dir.x !== 0 && currentDir.x === -dir.x) return; // Prevent reversing X
    if (dir.y !== 0 && currentDir.y === -dir.y) return; // Prevent reversing Y
    setDirection(dir);
    if (!hasStarted) setHasStarted(true);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto h-full">
      
      {/* Score Header */}
      <div className="w-full flex items-center justify-between px-6 py-4 glass rounded-2xl">
        <div className="flex items-center space-x-8">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-tighter text-zinc-500">Current Score</p>
            <p className="text-2xl font-mono font-bold text-white">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-tighter text-zinc-500">High Score</p>
            <p className="text-2xl font-mono font-bold text-pink-500">{highScore}</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsPaused(!isPaused)} 
          disabled={!hasStarted || isGameOver}
          className={cn(
            "p-3 rounded-full border transition-all",
            hasStarted && !isGameOver ? "border-zinc-700 text-zinc-400 hover:text-white glass" : "opacity-50 cursor-not-allowed border-zinc-800 text-zinc-600"
          )}
        >
          {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
        </button>
      </div>

      {/* Game Board */}
      <div className="relative p-2 rounded-xl bg-black border-4 border-zinc-800 flex justify-center items-center overflow-hidden flex-1 w-full max-h-[600px] aspect-square">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3f3f46 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute inset-0 border border-cyan-500/20 pointer-events-none"></div>

        <div 
          className="grid z-10 w-full h-full"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isSnake = snake.some(s => s.x === x && s.y === y);
            const isHead = snake[0].x === x && snake[0].y === y;
            const isFood = food.x === x && food.y === y;

            return (
              <div 
                key={i} 
                className={cn(
                  "w-full h-full border border-transparent",
                  isHead && "bg-cyan-400 neon-border-cyan rounded-sm z-10",
                  isSnake && !isHead && "bg-cyan-500 neon-border-cyan rounded-sm",
                  isFood && "neon-bg-pink rounded-full p-[2px]"
                )}
              />
            );
          })}
        </div>

        {/* Overlays */}
        <AnimatePresence>
          {!hasStarted && !isGameOver && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl"
            >
              <div className="text-cyan-400 text-xl font-mono mb-4 animate-pulse">PRESS ANY ARROW TO START</div>
              <div className="flex gap-2 text-zinc-400 text-sm font-mono">
                <span className="border border-zinc-700 px-2 py-1 rounded">W</span>
                <span className="border border-zinc-700 px-2 py-1 rounded">A</span>
                <span className="border border-zinc-700 px-2 py-1 rounded">S</span>
                <span className="border border-zinc-700 px-2 py-1 rounded">D</span>
              </div>
            </motion.div>
          )}

          {isPaused && hasStarted && !isGameOver && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-xl"
            >
              <div className="text-cyan-400 text-3xl font-bold font-mono tracking-widest drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">PAUSED</div>
            </motion.div>
          )}

          {isGameOver && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md flex flex-col items-center justify-center rounded-xl p-6 text-center border-2 border-fuchsia-500/50 shadow-[inset_0_0_50px_rgba(217,70,239,0.2)]"
            >
              <h2 className="text-4xl font-black text-fuchsia-400 mb-2 drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]">SYSTEM FAILURE</h2>
              <p className="text-zinc-300 font-mono mb-6">Final Score: <span className="text-cyan-400 font-bold text-xl">{score}</span></p>
              
              <button 
                onClick={resetGame}
                className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-transform hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
              >
                <RefreshCw className="w-5 h-5" /> REBOOT MODULE
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Mobile D-Pad Control - Only visible on small screens */}
      <div className="grid grid-cols-3 gap-2 mt-4 md:hidden w-48">
        <div />
        <button className="bg-zinc-800 p-4 rounded-lg active:bg-cyan-600 border border-zinc-700" onClick={() => handleDirClick({x: 0, y: -1})} aria-label="Up">↑</button>
        <div />
        <button className="bg-zinc-800 p-4 rounded-lg active:bg-cyan-600 border border-zinc-700" onClick={() => handleDirClick({x: -1, y: 0})} aria-label="Left">←</button>
        <button className="bg-zinc-800 p-4 rounded-lg active:bg-cyan-600 border border-zinc-700" onClick={() => handleDirClick({x: 0, y: 1})} aria-label="Down">↓</button>
        <button className="bg-zinc-800 p-4 rounded-lg active:bg-cyan-600 border border-zinc-700" onClick={() => handleDirClick({x: 1, y: 0})} aria-label="Right">→</button>
      </div>

    </div>
  );
}
