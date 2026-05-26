import { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, MessageSquare, Twitter, Zap } from 'lucide-react';
import { audioEngine } from './AudioEngine';

interface NavbarProps {
  onMuteToggle: (muted: boolean) => void;
  isMuted: boolean;
}

export default function Navbar({ onMuteToggle, isMuted }: NavbarProps) {
  const [copied, setCopied] = useState(false);
  const contractAddress = 'PikaS6L4nAMeowthBLastCAxxxxxxxxxx28Z6xp';

  const handleCopy = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    audioEngine.playCoin();
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSound = () => {
    const nextMute = !isMuted;
    onMuteToggle(nextMute);
    if (!nextMute) {
      audioEngine.playCoin();
    }
  };

  return (
    <nav className="w-full bg-white/10 backdrop-blur-md border-b border-white/20 text-white py-3.5 px-4 md:px-8 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-50 shadow-lg">
      {/* Brand logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-yellow-400 rounded-full border border-white/30 flex items-center justify-center p-1 overflow-hidden animate-bounce shadow-md">
          <img 
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" 
            alt="Pika" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-cartoon text-2xl md:text-3xl tracking-wide text-white drop-shadow-[2px_2px_0px_#000]">
            $PIKASHU
          </span>
          <span className="font-mono text-[10px] font-black uppercase tracking-widest text-yellow-300 mt-[-2px]">
            PIKA BLASTER SOL
          </span>
        </div>
      </div>

      {/* Solana Contract Holder with Frosted design */}
      <div className="flex items-center bg-white/15 backdrop-blur-lg rounded-xl border border-white/25 px-3 py-1.5 shadow-inner max-w-full overflow-hidden shrink min-w-0">
        <span className="font-game text-[9px] text-yellow-300 mr-2 shrink-0 animate-pulse-light">SOL CA:</span>
        <code className="font-mono text-xs text-white font-bold select-all truncate">
          {contractAddress}
        </code>
        <button 
          onClick={handleCopy}
          className="ml-2.5 p-1 bg-white/20 hover:bg-white/30 active:scale-90 rounded border border-white/30 flex items-center justify-center transition-all cursor-pointer shadow-sm"
          title="Copy Contract Address"
          id="ca-copy-btn"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          ) : (
            <Copy className="w-4 h-4 text-white stroke-[2]" />
          )}
        </button>
      </div>

      {/* Controls and Social links */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Toggle Sound */}
        <button
          onClick={toggleSound}
          className="p-2 bg-white/10 hover:bg-white/20 active:scale-95 rounded-xl border border-white/20 cursor-pointer flex items-center gap-2 font-mono text-xs font-bold transition-all"
          title={isMuted ? "Unmute Sound" : "Mute Sound"}
          id="sound-toggle-btn"
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-pika-red stroke-[2]" />
              <span className="hidden sm:inline text-pika-red">OFF</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-emerald-300 stroke-[2]" />
              <span className="hidden sm:inline text-emerald-300">ON</span>
            </>
          )}
        </button>

        {/* Telegram Icon Button */}
        <a 
          href="https://t.me/pikashu_sol" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 bg-sky-500/80 hover:bg-sky-500 text-white active:scale-95 rounded-xl border border-white/20 flex items-center font-cartoon text-sm gap-2 shadow-lg transition-all"
          id="tg-link"
        >
          <MessageSquare className="w-4 h-4 stroke-[2]" />
          <span className="hidden lg:inline text-xs font-game">TELEGRAM</span>
        </a>

        {/* Twitter Icon Button */}
        <a 
          href="https://x.com/pikashu_sol" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 bg-black/55 hover:bg-black/75 text-white active:scale-95 rounded-xl border border-white/15 flex items-center font-cartoon text-sm gap-2 shadow-lg transition-all"
          id="twitter-link"
        >
          <Twitter className="w-4 h-4 fill-white stroke-none" />
          <span className="hidden lg:inline text-xs font-game">TWITTER</span>
        </a>

        {/* Play Now CTA */}
        <a
          href="#game-section"
          className="hidden sm:flex px-4 py-2 bg-yellow-400 text-black hover:bg-yellow-300 active:translate-y-[2px] rounded-xl border border-white/30 font-cartoon text-sm items-center gap-1.5 shadow-md transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-black text-black animate-pulse" />
          PLAY GAME
        </a>
      </div>
    </nav>
  );
}
