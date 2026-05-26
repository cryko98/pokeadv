import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PikaGame from './components/PikaGame';
import Tokenomics from './components/Tokenomics';
import Footer from './components/Footer';
import { Sparkles, Zap, Flame, Coins, ShieldCheck, Gamepad } from 'lucide-react';
import { audioEngine } from './components/AudioEngine';

export default function App() {
  const [isMuted, setIsMuted] = useState(false);

  // Sync mute state on initial page load
  useEffect(() => {
    setIsMuted(audioEngine.getIsMuted());

    // Auto-unmute sound context once the user taps anywhere on the document (safari/chrome policy bypass)
    const handleGesture = () => {
      audioEngine.setMute(isMuted);
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
    };

    window.addEventListener('click', handleGesture);
    window.addEventListener('keydown', handleGesture);
    window.addEventListener('touchstart', handleGesture);

    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
    };
  }, [isMuted]);

  const handleMuteToggle = (muted: boolean) => {
    setIsMuted(muted);
    audioEngine.setMute(muted);
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* Top Banner Navigation Bar */}
      <Navbar onMuteToggle={handleMuteToggle} isMuted={isMuted} />

      {/* Hero Welcome Unit */}
      <header className="w-full relative py-6 text-white">
        <Hero />
      </header>

      {/* Main Interactive Play-To-Earn Section */}
      <main className="flex-grow w-full py-6">
        
        {/* Game Area Wrapper */}
        <section className="w-full transition-transform duration-300">
          <PikaGame />
        </section>

        {/* Fun Solana Meme Card Info Carousel / Features with glass panels */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-yellow-400/20 rounded-xl border border-white/20 text-yellow-300 shadow">
                  <Gamepad className="w-6 h-6" />
                </div>
                <h3 className="font-cartoon text-xl tracking-wider text-white">REPLAYABLE GAMEPLAY</h3>
              </div>
              <p className="font-sans text-xs text-white/80 leading-relaxed">
                Experience high-octane 2D retro action! Control Pikachu using WASD, arrows, or direct fingertip sliding. Blast falling Meowths and dodge multi-angle golden coin bullets!
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-rose-500/25 rounded-xl border border-white/20 text-rose-300 shadow">
                  <Flame className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="font-cartoon text-xl tracking-wider text-white">MEME FORCE INTEGRATED</h3>
              </div>
              <p className="font-sans text-xs text-white/80 leading-relaxed">
                $PIKASHU is not just a token — it is a movement. No dev teams holding tokens in secret. Completely organic growth backed by a custom live game component that rewards pure skill.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-emerald-500/25 rounded-xl border border-white/20 text-emerald-300 shadow">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-cartoon text-xl tracking-wider text-white">SOLANA SPEED</h3>
              </div>
              <p className="font-sans text-xs text-white/80 leading-relaxed">
                Built directly on the high-throughput, low-fee Solana Network. Swap, send, holds, and collect rewards inside our ecosystem with near-instant speed and sub-penny costs.
              </p>
            </div>

          </div>
        </section>

        {/* Detailed Coin Mechanics & Guidelines */}
        <section id="tokenomics-section" className="w-full">
          <Tokenomics />
        </section>

      </main>

      {/* Footer Branding Area */}
      <Footer />

    </div>
  );
}
