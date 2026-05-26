import React from 'react';
import { Shield, Sparkles, TrendingUp, HelpCircle, Coins, Flame, Pocket } from 'lucide-react';

export default function Tokenomics() {
  return (
    <div className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="text-center mb-12">
        <h2 className="font-cartoon text-4xl md:text-6xl text-yellow-300 drop-shadow-[2px_2px_0px_#000] tracking-wider mb-3">
          $PIKASHU TOKENOMICS
        </h2>
        <p className="font-display text-white/80 max-w-xl mx-auto text-sm md:text-base bg-black/10 p-4 rounded-xl backdrop-blur-sm inline-block border border-white/10">
          Our token economics are structured to be completely safe, fair, and fun. No dev allocation, no extra taxes, and fully burned liquidity!
        </p>
      </div>

      {/* Stats Cards / Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        
        {/* Token Card Supply */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl hover:-translate-y-1 transition-all">
          <div className="w-12 h-12 bg-yellow-400/25 rounded-2xl flex items-center justify-center text-yellow-300 mb-4 border border-white/20">
            <Coins className="w-6 h-6" />
          </div>
          <h3 className="font-cartoon text-xl text-white tracking-wider mb-2">TOTAL SUPPLY</h3>
          <p className="font-game text-sm text-yellow-300 mb-3 font-bold">1,000,000,000</p>
          <p className="font-sans text-xs text-white/70">
            Exactly 1 Billion tokens minted at genesis. No additional minting keys exist, keeping the supply fixed and hyper-locked.
          </p>
        </div>

        {/* Token Card Burned LP */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl hover:-translate-y-1 transition-all">
          <div className="w-12 h-12 bg-rose-500/25 rounded-2xl flex items-center justify-center text-rose-300 mb-4 border border-white/20">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="font-cartoon text-xl text-white tracking-wider mb-2">LIQUIDITY BURNED</h3>
          <p className="font-game text-sm text-rose-300 mb-3 font-bold">100% TO ZERO</p>
          <p className="font-sans text-xs text-white/70">
            Raydium liquidity pool tokens were immediately sent to the incinerator. There's zero risk of rugpulls or liquidity extraction!
          </p>
        </div>

        {/* Token Card Tax */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl hover:-translate-y-1 transition-all">
          <div className="w-12 h-12 bg-emerald-500/25 rounded-2xl flex items-center justify-center text-emerald-300 mb-4 border border-white/20">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-cartoon text-xl text-white tracking-wider mb-2">ZERO TAX FEES</h3>
          <p className="font-game text-sm text-emerald-300 mb-3 font-bold">0% BUY / SELL</p>
          <p className="font-sans text-xs text-white/70">
            No dynamic taxes or team cuts on trades. Send and swap freely with maximum execution rates across the Solana galaxy.
          </p>
        </div>

        {/* Token Card Ownership */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl hover:-translate-y-1 transition-all">
          <div className="w-12 h-12 bg-sky-500/25 rounded-2xl flex items-center justify-center text-sky-300 mb-4 border border-white/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-cartoon text-xl text-white tracking-wider mb-2">OWNERSHIP REVOKED</h3>
          <p className="font-game text-sm text-sky-300 mb-3 font-bold">FULLY RENOUNCED</p>
          <p className="font-sans text-xs text-white/70">
            Contract ownership renounced to the blockchain void. This token belongs to the community and can never be altered!
          </p>
        </div>

      </div>

      {/* How to Buy Section styled like step-by-step game cards */}
      <div className="bg-white/10 backdrop-blur-md border border-white/25 rounded-3xl p-8 relative overflow-hidden mt-12 shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-300 via-sky-300 to-emerald-300"></div>
        
        <h3 className="font-cartoon text-3xl md:text-5xl text-white text-center tracking-wider mb-10">
          HOW TO BUY $PIKASHU IN 4 STEPS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          
          {/* Step 1 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/15 flex flex-col items-center text-center relative">
            <div className="w-10 h-10 bg-yellow-400 text-black font-game text-xs font-bold rounded-full border border-white/30 flex items-center justify-center mb-4 shadow">
              01
            </div>
            <h4 className="font-cartoon text-lg text-white mb-2">LOAD PHANTOM</h4>
            <p className="font-sans text-xs text-white/70">
              Download and install the Phantom wallet client on Google Chrome extension, Firefox, iOS, or Android devices.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/15 flex flex-col items-center text-center relative">
            <div className="w-10 h-10 bg-yellow-400 text-black font-game text-xs font-bold rounded-full border border-white/30 flex items-center justify-center mb-4 shadow">
              02
            </div>
            <h4 className="font-cartoon text-lg text-white mb-2">FUND WITH SOL</h4>
            <p className="font-sans text-xs text-white/70">
              Purchase SOL inside Phantom directly, or deposit Solana coins from an exchange (e.g. Binance, Coinbase) into your public address.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/15 flex flex-col items-center text-center relative">
            <div className="w-10 h-10 bg-yellow-400 text-black font-game text-xs font-bold rounded-full border border-white/30 flex items-center justify-center mb-4 shadow">
              03
            </div>
            <h4 className="font-cartoon text-lg text-white mb-2">SWAP ON DEX</h4>
            <p className="font-sans text-xs text-white/70">
              Go to Raydium or Jupiter Terminal. Paste our official Contract Address to safely identify the correct $PIKASHU pool.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/15 flex flex-col items-center text-center relative">
            <div className="w-10 h-10 bg-rose-500 text-white font-game text-xs font-bold rounded-full border border-white/30 flex items-center justify-center mb-4 shadow-md">
              04
            </div>
            <h4 className="font-cartoon text-lg text-yellow-300 mb-2 animate-bounce">BLAST THE GAME!</h4>
            <p className="font-sans text-xs text-white/70">
              Swap your SOL, secure your $PIKASHU bags, then head upstairs to play the arcade game and level up! Our rocket has ignited.
            </p>
          </div>

        </div>

        {/* Disclaimer card footer */}
        <div className="mt-10 p-4 rounded-xl bg-rose-500/15 border border-rose-500/25 text-center">
          <p className="font-mono text-[9px] text-rose-200 uppercase tracking-widest">
            ⚠️ DISCLAIMER: $PIKASHU is a decentralized play-to-earn community meme experiment on Solana with zero official association with Nintendo or Pokémon. Play, swap, and blast at your own wild adventure discretion.
          </p>
        </div>

      </div>
    </div>
  );
}
