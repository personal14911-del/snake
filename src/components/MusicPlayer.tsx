import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, VolumeX, Volume2, Music } from 'lucide-react';

const TRACKS = [
  { id: 1, title: "Neon Flow", artist: "Synth AI", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3" },
  { id: 2, title: "Cybernetic Pulse", artist: "Algorhythm", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3" },
  { id: 3, title: "Digital Sunrise", artist: "Neural Wave", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3" }
];

export function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.warn("Autoplay blocked or audio load error:", e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  const skipForward = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const skipBack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleEnded = () => {
    skipForward();
  };

  return (
    <div className="glass rounded-2xl p-4 w-full flex flex-col h-full gap-4">
      <h3 className="text-xs font-bold uppercase text-zinc-400 mb-2 border-b border-zinc-800 pb-2">Playlist</h3>
      
      <div className="space-y-1 flex-1 overflow-y-auto min-h-[200px]">
        {TRACKS.map((track, idx) => (
          <button 
            key={track.id}
            onClick={() => {
              setCurrentTrackIndex(idx);
              setIsPlaying(true);
            }}
            className={cn(
              "w-full flex items-center p-3 rounded-xl text-left transition-colors",
              idx === currentTrackIndex ? "bg-zinc-800/40 border border-zinc-700/50" : "opacity-50 hover:bg-zinc-900/40"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-lg mr-3 flex items-center justify-center shrink-0",
              idx === currentTrackIndex ? "bg-cyan-900 text-cyan-400" : "bg-zinc-800"
            )}>
              {idx === currentTrackIndex && isPlaying ? (
                 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}>
                   <Music className="w-5 h-5" />
                 </motion.div>
              ) : (
                <Music className="w-5 h-5" />
              )}
            </div>
            <div className="overflow-hidden">
              <p className={cn("text-sm font-bold truncate", idx !== currentTrackIndex && "font-medium")}>{track.title}</p>
              <p className="text-[10px] text-zinc-500 truncate">{track.artist}</p>
            </div>
          </button>
        ))}
      </div>

      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={handleEnded} 
        preload="auto"
      />

      <div className="mt-auto border-t border-zinc-800 pt-4 flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20 shrink-0 flex items-center justify-center">
            <Music className="w-6 h-6 text-white opacity-50" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-white">{currentTrack.title}</p>
            <p className="text-xs text-zinc-400 truncate">{currentTrack.artist}</p>
          </div>
          <button onClick={toggleMute} className="text-zinc-500 hover:text-white transition-colors">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center justify-center space-x-8">
          <button onClick={skipBack} className="text-zinc-500 hover:text-white transition-colors">
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          
          <button 
            onClick={togglePlay} 
            className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
          </button>
          
          <button onClick={skipForward} className="text-zinc-500 hover:text-white transition-colors">
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
