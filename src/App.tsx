/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MusicPlayer } from './components/MusicPlayer';
import { SnakeGame } from './components/SnakeGame';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden relative">
      <header className="flex items-center justify-between px-6 py-4 glass rounded-2xl z-10 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse"></div>
          <h1 className="text-xl md:text-2xl font-bold tracking-widest text-cyan-400 uppercase neon-text-cyan">
            Neon-Synth Snake
          </h1>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-6 z-10 pb-6 w-full max-w-[1200px] mx-auto">
        <div className="lg:col-span-8 flex items-center justify-center">
          <SnakeGame />
        </div>
        
        <div className="lg:col-span-4 flex flex-col h-full">
          <MusicPlayer />
        </div>
      </main>
    </div>
  );
}
