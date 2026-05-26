import React, { useState } from 'react';
import { Copy, Check, Heart, MessageSquare, Twitter, Sparkles, Coins } from 'lucide-react';
import { audioEngine } from './AudioEngine';

export default function Footer() {
  const [copied, setCopied] = useState(false);
  const contractAddress = 'PikaS6L4nAMeowthBLastCAxxxxxxxxxx28Z6xp';

  const handleCopy = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    audioEngine.playCoin();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="w-full bg-white/10 backdrop-blur-md border-t border-white/20 py-10 px-4 md:px-8 mt-12 relative overflow-hidden shadow-2xl">
      {/* Visual top border lightning stripes */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-300 via-sky-300 to-emerald-300"></div>
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        
        {/* Left side info */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-cartoon text-xl text-yellow-300">$PIKASHU</span>
            <span className="font-mono text-[9px] px-1.5 py-0.5 bg-yellow-400 text-black rounded font-bold uppercase">SOLANA</span>
          </div>
          <p className="font-sans text-xs text-white/70 max-w-sm">
            The ultimate custom retro arcade pokemon blaster experience built natively on the high-frequency Solana blockchain.
          </p>
        </div>

        {/* Center: Copy Contract Box */}
        <div className="flex flex-col items-center">
          <span className="font-game text-[8px] text-white/70 mb-2">OFFICIAL SOLANA CONTRACT ADDRESS:</span>
          <div className="flex items-center bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 px-3 py-1.5 max-w-xs md:max-w-md shrink overflow-hidden">
            <code className="font-mono text-xs text-yellow-300 truncate select-all">
              {contractAddress}
            </code>
            <button 
              onClick={handleCopy}
              className="ml-2.5 p-1 bg-white/20 hover:bg-white/35 active:scale-95 text-white rounded border border-white/30 transition-all cursor-pointer"
              title="Copy Address"
              id="footer-copy-btn"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-300 stroke-[3]" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-white stroke-[2]" />
              )}
            </button>
          </div>
        </div>

        {/* Right side social links and design tag */}
        <div className="flex flex-col items-center md:items-end gap-3 text-center">
          <div className="flex items-center gap-2">
            <a 
              href="https://t.me/pikashu_sol" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-sky-500/80 hover:bg-sky-500 transition-all text-white rounded-lg border border-white/20 cursor-pointer shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
            <a 
              href="https://x.com/pikashu_sol" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-black/60 hover:bg-black/80 transition-all text-white rounded-lg border border-white/15 cursor-pointer shadow-md"
            >
              <Twitter className="w-4 h-4 fill-white stroke-none" />
            </a>
          </div>
          
          <div className="font-mono text-[9px] text-white/50 flex items-center gap-1">
            <span>Powering the Pikachu Revolution</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>2026</span>
          </div>
        </div>

      </div>

      {/* Extreme bottom copyright/fine print safety guidelines */}
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/10 text-center text-[10px] text-white/45 font-sans">
        🚀 $PIKASHU stands as a decentralized community memecoin. This application is constructed strictly for amusement purposes. All rights and characters are held by Nintendo, Creatures Inc., and GAME FREAK.
      </div>
    </footer>
  );
}
