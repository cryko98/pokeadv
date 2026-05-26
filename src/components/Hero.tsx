import { Flame, Sparkles, TrendingUp, Zap, HelpCircle } from 'lucide-react';
import { audioEngine } from './AudioEngine';

export default function Hero() {

  const handleInteract = () => {
    audioEngine.playPowerUp();
  };

  return (
    <div className="relative pt-6 pb-12 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center">
      {/* Absolute cute backgrounds or cartoon stars */}
      <div className="absolute top-10 left-5 md:left-20 w-32 h-32 bg-sky-200 rounded-full blur-3xl opacity-35 pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 right-5 md:right-20 w-48 h-48 bg-emerald-200 rounded-full blur-3xl opacity-35 pointer-events-none animate-pulse"></div>

      {/* Hero Content Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
        
        {/* Left column: Epic copy */}
        <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white font-game text-[10px] px-3.5 py-2.5 rounded-full border border-white/30 shadow-md mb-6 animate-float">
            <Flame className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500" />
            THE FIRST PLAY-TO-EARN PIKA MEMECOIN ON SOLANA!
          </div>

          {/* Heading */}
          <h1 className="font-cartoon text-5xl md:text-7xl lg:text-8xl text-yellow-300 leading-none tracking-tight mb-6 drop-shadow-[4px_4px_0px_rgba(0,0,0,0.85)] uppercase italic text-shadow">
            PIKA <span className="text-white">SHOOTER</span>
          </h1>

          <p className="font-display text-lg md:text-xl text-white font-medium max-w-2xl mb-8 leading-relaxed bg-black/15 p-5 rounded-2xl backdrop-blur-sm border border-white/10">
            Meowth and Team Rocket have been scheming to steal our Solana coins! Pikachu has upgraded to a high-capacity lightning railgun to blast those greedy cats back to orbit. <b>Shoot Meowth, earn highscores, and send $PIKASHU to $100M!</b>
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start w-full">
            <a
              href="#game-section"
              onClick={handleInteract}
              className="px-8 py-4 px-10 glass-btn-yellow font-cartoon text-xl tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-6 h-6 fill-black animate-bounce" />
              PLAY & BLAST MEOWTH
            </a>

            <a
              href="https://raydium.io/swap/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleInteract}
              className="px-8 py-4 px-10 glass-btn-red font-cartoon text-xl tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <TrendingUp className="w-5 h-5 stroke-[3]" />
              BUY $PIKASHU
            </a>
          </div>

          {/* Quick Stats bar */}
          <div className="grid grid-cols-3 gap-3 md:gap-6 mt-10 w-full max-w-md">
            <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 flex flex-col items-center shadow-lg">
              <span className="font-game text-[8px] md:text-[9px] text-[#E0F2FE] mb-1">BOOST LEVEL</span>
              <span className="font-cartoon text-xl md:text-2xl text-yellow-300">⚡ 100x</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 flex flex-col items-center shadow-lg">
              <span className="font-game text-[8px] md:text-[9px] text-[#E0F2FE] mb-1">TOTAL SUPPLY</span>
              <span className="font-cartoon text-xl md:text-2xl text-white">1B BILLION</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 flex flex-col items-center shadow-lg">
              <span className="font-game text-[8px] md:text-[9px] text-[#E0F2FE] mb-1">TAXES</span>
              <span className="font-cartoon text-xl md:text-2xl text-emerald-300">0% BUY/SELL</span>
            </div>
          </div>

        </div>

        {/* Right column: Beautiful Anime / Cartoon Visual Showcase with Pikachu and Meowth */}
        <div className="lg:col-span-5 flex justify-center items-center relative mt-6 lg:mt-0">
          
          <div className="relative w-80 h-80 md:w-96 md:h-96 bg-white/10 backdrop-blur-md rounded-[50px] border-4 border-white/30 shadow-2xl flex items-center justify-center p-4">
            
            {/* Target Ring Effect */}
            <div className="absolute inset-4 border-2 border-white/10 rounded-full animate-spin [animation-duration:15s] pointer-events-none"></div>
            
            {/* Pikachu Battle Stand */}
            <div className="absolute -bottom-2 w-64 h-12 bg-black/20 rounded-full blur-md"></div>
            
            {/* Official Pikachu Image battling floating Meowth */}
            <div className="relative w-full h-full flex items-center justify-center">
              
              {/* Pikachu Sprite (Left-Center) - Flipped to face right */}
              <div className="absolute -left-2 bottom-8 w-44 h-44 z-10 animate-float scale-x-[-1]">
                <img 
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" 
                  alt="Official Pikachu Sprite" 
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]"
                  referrerPolicy="no-referrer"
                />
                
                {/* Micro Sparks overlaying */}
                <div className="absolute top-8 right-8">
                  <Sparkles className="w-6 h-6 text-yellow-300 fill-yellow-300 animate-pulse" />
                </div>
              </div>

              {/* Lightning blast beam between Pikachu and Meowth */}
              <div className="absolute left-1/3 bottom-1/3 right-1/4 h-8 bg-gradient-to-r from-yellow-300 via-white to-sky-300 border border-white/40 transform rotate-[-15deg] origin-left rounded-full z-0 flex items-center justify-center shadow-[0_0_15px_#fff]">
                <span className="font-game text-[8px] text-black font-black">ZAP!!</span>
              </div>

              {/* Meowth Sprite (Right-Top) */}
              <div className="absolute right-0 top-6 w-36 h-36 z-10 animate-pulse [animation-duration:2.5s] origin-center -rotate-12 translate-y-3">
                <img 
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png" 
                  alt="Official Meowth Sprite" 
                  className="w-full h-full object-contain filter brightness-95 saturate-110 drop-shadow-[0_8px_8px_rgba(0,0,0,0.4)]"
                  referrerPolicy="no-referrer"
                />
                
                {/* Scratch / Hits overlay */}
                <div className="absolute bottom-6 left-2 bg-pika-red text-white font-game text-[8px] px-2 py-1 border border-white/30 rounded shadow-md rotate-12">
                  HP -9999!
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
