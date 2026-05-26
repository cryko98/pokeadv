import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Shield, 
  Award, 
  Sparkles, 
  Coins, 
  Zap, 
  Gamepad2, 
  ShieldCheck, 
  Flame, 
  Heart,
  Wrench,
  ChevronRight,
  Plus,
  HelpCircle,
  Trophy,
  Activity,
  ArrowUp
} from 'lucide-react';
import { audioEngine } from './AudioEngine';

// Official High-Quality Pokémon Artwork Asset URLs from PokeAPI
const POKEMON_IMAGES = {
  pikachu: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
  charmander: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
  squirtle: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",
  bulbasaur: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
  eevee: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png",
  koffing: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/109.png",
  meowth: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png",
  gengar: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png",
  pokeball: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
};

// Interactive Companion Pokemon helper roles
type CompanionType = 'CHARMANDER' | 'SQUIRTLE' | 'BULBASAUR' | 'EEVEE';

interface Companion {
  type: CompanionType;
  x: number;
  y: number;
  hoverOffset: number;
}

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'GLASS' | 'LIGHTNING_CABLE' | 'CLOUD' | 'GOLD';
}

interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'KOFFING' | 'MEOWTH' | 'ROCKET_BOX';
  speedY?: number;
  speedX?: number;
  sinOffset?: number;
  health?: number;
}

interface TargetBall {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: CompanionType;
  isCustom?: boolean;
}

interface Coin {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  isSpecial?: boolean;
}

interface FireBullet {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  text?: string;
  emoji?: string;
}

// Upgrade costs mapping helper
const STAT_UPGRADES = {
  HEALTH: { costs: [10, 20, 35, 60, 100], values: [100, 120, 140, 160, 180, 200], title: 'Max Capacitance (HP Boost)' },
  MAGNET: { costs: [8, 18, 30, 50, 90], values: [0, 95, 140, 190, 240, 300], title: 'Magnet Vine Sweep (Range)' },
  CHARGE: { costs: [12, 22, 40, 75, 120], values: [1, 1.25, 1.5, 1.8, 2.2, 2.8], title: 'Volt Charge velocity' },
  LUCKY: { costs: [15, 25, 45, 80, 150], values: [1, 1.2, 1.45, 1.75, 2.1, 2.5], title: 'Lucky Ball Encounter frequency' }
};

export default function PikaGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // General States
  const [muted, setMuted] = useState(false);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highscore, setHighscore] = useState(() => {
    return parseInt(localStorage.getItem('pikashu_high_runner') || '0', 10);
  });

  const [leaderboard, setLeaderboard] = useState<{name: string, score: number}[]>(() => {
    const saved = localStorage.getItem('pikashu_leaderboard_runner');
    if (saved) return JSON.parse(saved);
    return []; // Completely clean & genuine! No fake pre-populated profiles.
  });

  const [playerName, setPlayerName] = useState('ANON');
  const [controlType, setControlType] = useState<'tap_key' | 'keyboard_only'>('tap_key');
  const [showCRT, setShowCRT] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Persistent Coins & Upgrades (Stored in browser local storage)
  const [arcadeCoins, setArcadeCoins] = useState(() => {
    return parseInt(localStorage.getItem('pikashu_arcade_coins') || '0', 10);
  });
  
  const [lvlHealth, setLvlHealth] = useState(() => {
    return parseInt(localStorage.getItem('pikashu_lvl_health') || '0', 10);
  });
  const [lvlMagnet, setLvlMagnet] = useState(() => {
    return parseInt(localStorage.getItem('pikashu_lvl_magnet') || '0', 10);
  });
  const [lvlCharge, setLvlCharge] = useState(() => {
    return parseInt(localStorage.getItem('pikashu_lvl_charge') || '0', 10);
  });
  const [lvlLucky, setLvlLucky] = useState(() => {
    return parseInt(localStorage.getItem('pikashu_lvl_lucky') || '0', 10);
  });

  // Shop purchase notification triggers
  const [shopError, setShopError] = useState<string | null>(null);

  // Active rescued companion flags
  const [rescuedPokemon, setRescuedPokemon] = useState<CompanionType[]>([]);

  // Volt Tackle Ultimate availability state and energy bar (0-100)
  const [voltEnergy, setVoltEnergy] = useState(0);
  const [isVoltTackling, setIsVoltTackling] = useState(false);

  // HTML canvas caching image objects
  const imgs = useRef<{ [key: string]: HTMLImageElement }>({});

  // Real-time Physics Vector state
  const physicsRef = useRef<{
    gameSpeed: number;
    distance: number;
    player: {
      y: number;
      width: number;
      height: number;
      vy: number;
      isGrounded: boolean;
      jumpsLeft: number;
      health: number;
      maxHealth: number;
      isInvulnerable: boolean;
      invulerableTimer: number;
      hasSquirtleShield: boolean;
    };
    platforms: Platform[];
    obstacles: Obstacle[];
    targetBalls: TargetBall[];
    coins: Coin[];
    fireBullets: FireBullet[];
    particles: Particle[];
    companions: Companion[];
    shakeDuration: number;
    lastCharmanderShot: number;
    voltTackleTimer: number;
    scoreMultiplier: number;
    levelUpMilestone: number;
    cloudScroll: number;
    starsScroll: number;
    frameId: number;
    goldInRound: number;
  }>({
    gameSpeed: 4.8,
    distance: 0,
    player: {
      y: 200,
      width: 60,
      height: 60,
      vy: 0,
      isGrounded: false,
      jumpsLeft: 2,
      health: 100,
      maxHealth: 100,
      isInvulnerable: false,
      invulerableTimer: 0,
      hasSquirtleShield: false
    },
    platforms: [],
    obstacles: [],
    targetBalls: [],
    coins: [],
    fireBullets: [],
    particles: [],
    companions: [],
    shakeDuration: 0,
    lastCharmanderShot: 0,
    voltTackleTimer: 0,
    scoreMultiplier: 1,
    levelUpMilestone: 2000,
    cloudScroll: 0,
    starsScroll: 0,
    frameId: 0,
    goldInRound: 0
  });

  // Load sound helper proxy
  const triggerSound = (type: 'shoot' | 'hit' | 'bossHit' | 'powerup' | 'coin' | 'gameover' | 'bossintro') => {
    if (muted) return;
    try {
      switch(type) {
        case 'shoot': audioEngine.playShoot(); break;
        case 'hit': audioEngine.playHit(); break;
        case 'bossHit': audioEngine.playBossHit(); break;
        case 'powerup': audioEngine.playPowerUp(); break;
        case 'coin': audioEngine.playCoin(); break;
        case 'gameover': audioEngine.playGameOver(); break;
        case 'bossintro': audioEngine.playBossIntro(); break;
      }
    } catch (e) {
      console.warn("Audio Context init pending user action.", e);
    }
  };

  const handleMuteToggle = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    audioEngine.setMute(nextMuted);
  };

  // Sync volume state from singleton
  useEffect(() => {
    setMuted(audioEngine.getIsMuted());
  }, []);

  // Pre-load Pokemon Artwork objects
  useEffect(() => {
    Object.entries(POKEMON_IMAGES).forEach(([key, url]) => {
      const img = new Image();
      img.src = url;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imgs.current[key] = img;
      };
    });
  }, []);

  // Detect touchscreen and smaller mobile views
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update canvas sizing & keep fixed bounds
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const width = Math.min(1000, parent.clientWidth);
    canvas.width = width;
    canvas.height = 460; // Larger widescreen height for grander view!
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Upgrade Purchase Laboratory process
  const buyUpgrade = (statType: 'HEALTH' | 'MAGNET' | 'CHARGE' | 'LUCKY') => {
    setShopError(null);
    let currentLvl = 0;
    if (statType === 'HEALTH') currentLvl = lvlHealth;
    else if (statType === 'MAGNET') currentLvl = lvlMagnet;
    else if (statType === 'CHARGE') currentLvl = lvlCharge;
    else if (statType === 'LUCKY') currentLvl = lvlLucky;

    if (currentLvl >= 5) {
      setShopError("This tech is fully maxed! Ready to blast Meowth.");
      return;
    }

    const cost = STAT_UPGRADES[statType].costs[currentLvl];
    if (arcadeCoins < cost) {
      setShopError(`This stats upgrade costs ${cost} Gold. Dash more, gather coins!`);
      return;
    }

    // Process Purchase
    const remainingGold = arcadeCoins - cost;
    setArcadeCoins(remainingGold);
    localStorage.setItem('pikashu_arcade_coins', remainingGold.toString());

    triggerSound('powerup');

    if (statType === 'HEALTH') {
      const nextLevel = lvlHealth + 1;
      setLvlHealth(nextLevel);
      localStorage.setItem('pikashu_lvl_health', nextLevel.toString());
    } else if (statType === 'MAGNET') {
      const nextLevel = lvlMagnet + 1;
      setLvlMagnet(nextLevel);
      localStorage.setItem('pikashu_lvl_magnet', nextLevel.toString());
    } else if (statType === 'CHARGE') {
      const nextLevel = lvlCharge + 1;
      setLvlCharge(nextLevel);
      localStorage.setItem('pikashu_lvl_charge', nextLevel.toString());
    } else if (statType === 'LUCKY') {
      const nextLevel = lvlLucky + 1;
      setLvlLucky(nextLevel);
      localStorage.setItem('pikashu_lvl_lucky', nextLevel.toString());
    }
  };

  // Safe leaderboard save
  const storeNewScore = (finalScore: number) => {
    const entry = { name: playerName.trim().toUpperCase() || 'ANON', score: finalScore };
    const newList = [...leaderboard, entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    setLeaderboard(newList);
    localStorage.setItem('pikashu_leaderboard_runner', JSON.stringify(newList));
  };

  // Particle explosion helper
  const spawnExplosion = (x: number, y: number, color: string, count = 10, emoji?: string) => {
    for (let i = 0; i < count; i++) {
      const rotation = Math.random() * Math.PI * 2;
      const speed = 1.6 + Math.random() * 4.4;
      physicsRef.current.particles.push({
        id: Math.random().toString(),
        x,
        y,
        vx: Math.cos(rotation) * speed,
        vy: Math.sin(rotation) * speed,
        size: 3 + Math.random() * 6,
        color,
        life: 0,
        maxLife: 20 + Math.random() * 25,
        emoji
      });
    }
  };

  // Initiate new game sequence
  const startNewGame = () => {
    audioEngine.startBgm();

    const canvas = canvasRef.current;
    const targetW = canvas ? canvas.width : 750;
    
    // Core parameters mapping upgrades
    const topHP = STAT_UPGRADES.HEALTH.values[lvlHealth];

    physicsRef.current = {
      gameSpeed: 5.8, // Slightly faster starting pace for elevated difficulty and competitive adrenaline!
      distance: 0,
      player: {
        y: 150,
        width: 60,
        height: 60,
        vy: 0,
        isGrounded: false,
        jumpsLeft: 2,
        health: topHP,
        maxHealth: topHP,
        isInvulnerable: false,
        invulerableTimer: 0,
        hasSquirtleShield: false
      },
      // Guarantee starting platforms to lock jumping feel situated at the bottom
      platforms: [
        { x: 0, y: 350, width: 450, height: 200, type: 'GLASS' },
        { x: 500, y: 330, width: 280, height: 200, type: 'LIGHTNING_CABLE' },
        { x: 840, y: 300, width: 250, height: 200, type: 'CLOUD' }
      ],
      obstacles: [],
      targetBalls: [
        // Spawn starter pokeball and companion types
        { id: 'start-ball-1', x: 620, y: 280, width: 34, height: 34, type: 'SQUIRTLE' }
      ],
      coins: [
        { id: 'c1', x: 200, y: 290, width: 20, height: 20, value: 1 },
        { id: 'c2', x: 240, y: 270, width: 20, height: 20, value: 1 },
        { id: 'c3', x: 280, y: 290, width: 20, height: 20, value: 1 }
      ],
      fireBullets: [],
      particles: [],
      companions: [],
      shakeDuration: 0,
      lastCharmanderShot: 0,
      voltTackleTimer: 0,
      scoreMultiplier: 1,
      levelUpMilestone: 2200,
      cloudScroll: 0,
      starsScroll: 0,
      frameId: 0,
      goldInRound: 0
    };

    setScore(0);
    setLevel(1);
    setVoltEnergy(0);
    setIsVoltTackling(false);
    setRescuedPokemon([]);
    setGameState('PLAYING');

    triggerSound('powerup');
  };

  // Jump Controller
  const executeJump = useCallback(() => {
    if (gameState !== 'PLAYING') return;
    const body = physicsRef.current.player;

    if (body.jumpsLeft > 0) {
      body.vy = -7.6; // Slightly smaller jump power for a tighter, highly balanced feel (was -9.6)
      body.jumpsLeft -= 1;
      body.isGrounded = false;
      
      triggerSound('shoot');

      // Double jump spark circles
      spawnExplosion(100, body.y + body.height / 2, '#60A5FA', 10, '⚡');
    }
  }, [gameState]);

  // Active Shoot Controller
  const executeShoot = useCallback(() => {
    if (gameState !== 'PLAYING') return;
    const game = physicsRef.current;
    const body = game.player;

    // Throttle user shooting to 260ms cooldown for premium active playability
    const now = Date.now();
    if (now - game.lastCharmanderShot < 260) return;
    game.lastCharmanderShot = now;

    // Create electrical Thunderbolt sphere forward
    game.fireBullets.push({
      x: 100 + body.width / 2,
      y: body.y + 4,
      width: 24,
      height: 12,
      vx: 13.5 // high speed projectile
    });

    // Dual Fire Bullet support from Charmander if rescued!
    const hasChar = game.companions.some(c => c.type === 'CHARMANDER');
    if (hasChar) {
      const charPos = game.companions.find(c => c.type === 'CHARMANDER');
      const startY = charPos ? charPos.y : body.y - 20;
      game.fireBullets.push({
        x: charPos ? charPos.x + 15 : 130,
        y: startY,
        width: 18,
        height: 10,
        vx: 15.0
      });
      spawnExplosion(charPos ? charPos.x + 15 : 130, startY, '#EF4444', 3, '🔥');
    }

    triggerSound('shoot');
    spawnExplosion(110 + body.width / 2, body.y + 4, '#FBBF24', 4, '⚡');
  }, [gameState]);

  // Activation trigger for the supreme "ULTIMATE VOLT TACKLE"
  const triggerVoltTackle = useCallback(() => {
    if (gameState !== 'PLAYING') return;
    if (voltEnergy < 100 || isVoltTackling) return;

    setIsVoltTackling(true);
    physicsRef.current.voltTackleTimer = 340; // ~6 seconds of pure blazing madness!
    physicsRef.current.player.isInvulnerable = true;
    physicsRef.current.player.invulerableTimer = 340;
    
    // Boost running acceleration speed
    physicsRef.current.gameSpeed = 10.5;

    triggerSound('bossintro');

    // Ultimate particle shocks
    const body = physicsRef.current.player;
    spawnExplosion(100, body.y, '#FBBF24', 40, '💥');
    spawnExplosion(100, body.y, '#38BDF8', 25, '⚡');

    physicsRef.current.particles.push({
      id: "ut",
      x: 350,
      y: 190,
      vx: 0,
      vy: -1,
      size: 40,
      color: '#FBBF24',
      life: 0,
      maxLife: 45,
      text: "⚡ VOLT TACKLE ACTIVE ⚡"
    });
  }, [gameState, voltEnergy, isVoltTackling]);

  // Main real-time tick loop
  const gameTick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const game = physicsRef.current;
    const body = game.player;

    // A. Clear and draw complex background layers (Parallax)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let shakeX = 0;
    let shakeY = 0;
    if (game.shakeDuration > 0) {
      shakeX = (Math.random() - 0.5) * 11;
      shakeY = (Math.random() - 0.5) * 11;
      game.shakeDuration--;
    }

    // Sky gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#0f172a'); // Midnight Dark slate
    bgGrad.addColorStop(0.4, '#1e1b4b'); // Deep indigo purple
    bgGrad.addColorStop(0.8, '#311042'); // Sunset Violet
    bgGrad.addColorStop(1, '#1e293b'); // Warm ground shadow
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dynamic lightning background flares as static charge boosts
    if (Math.random() < 0.007) {
      ctx.fillStyle = 'rgba(234, 179, 8, 0.16)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      game.shakeDuration = 6;
    }

    // Parallax Layer 1: Stars field
    game.starsScroll = (game.starsScroll - game.gameSpeed * 0.1) % canvas.width;
    ctx.fillStyle = "rgba(255,255,255, 0.45)";
    for (let i = 0; i < 30; i++) {
      const sx = (i * 45 + game.starsScroll + canvas.width) % canvas.width;
      const sy = (i * 123 + 45) % (canvas.height - 180);
      const starRadius = (i % 3 === 0) ? 1.8 : 0.8;
      ctx.beginPath();
      ctx.arc(sx + shakeX, sy + shakeY, starRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Parallax Layer 2: Rolling distant purple Neon Mountains
    ctx.fillStyle = "rgba(67, 20, 100, 0.4)";
    ctx.beginPath();
    for (let x = 0; x <= canvas.width + 120; x += 120) {
      const px = x + ((game.distance * -0.2) % 120);
      const py = 250 + Math.sin(x * 0.015) * 45;
      if (x === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();

    // Parallax Layer 3: Fluffy ambient foreground clouds
    game.cloudScroll = (game.cloudScroll - game.gameSpeed * 0.4) % canvas.width;
    ctx.fillStyle = "rgba(148, 163, 184, 0.15)";
    for (let c = 0; c < 5; c++) {
      const cx = (c * 230 + game.cloudScroll + canvas.width) % canvas.width;
      const cy = 60 + Math.cos(c * 2.5) * 30;
      ctx.beginPath();
      ctx.arc(cx + shakeX, cy + shakeY, 35, 0, Math.PI * 2);
      ctx.arc(cx + 25 + shakeX, cy - 10 + shakeY, 45, 0, Math.PI * 2);
      ctx.arc(cx + 50 + shakeX, cy + shakeY, 35, 0, Math.PI * 2);
      ctx.fill();
    }

    // Advance running metrics
    game.distance += game.gameSpeed * 0.2;
    const runScore = Math.floor(game.distance) * game.scoreMultiplier;
    setScore(runScore);

    // Custom level scale up triggers
    if (runScore >= game.levelUpMilestone) {
      game.gameSpeed += 0.85;
      game.levelUpMilestone += 3500 + level*1500;
      setLevel(prev => prev + 1);
      
      // Flash floating levels notification
      game.particles.push({
        id: "lup",
        x: canvas.width / 2,
        y: canvas.height / 3,
        vx: 0,
        vy: -2,
        size: 28,
        color: '#EA580C',
        life: 0,
        maxLife: 60,
        text: "⚡ SPEED INCREASE & LEVEL UP! ⚡"
      });
      triggerSound('powerup');
    }

    // ============================================
    // B. Physics & Collision Handling for Platforms
    // ============================================
    
    // Jump physics gravity simulation
    body.vy += 0.42; // Fall gravity acceleration
    body.y += body.vy;

    // Ground platform collision bounds checking
    let onPlatform = false;
    const feetY = body.y + body.height / 2;
    const feetYPrev = feetY - body.vy;
    const pikaLeft = 100 - body.width / 2 + 5;
    const pikaRight = 100 + body.width / 2 - 5;

    // landing threshold scales dynamically with velocity so high gravity drops never fall through platforms!
    const landingThreshold = Math.max(12, body.vy + 2);

    for (let i = 0; i < game.platforms.length; i++) {
      const plat = game.platforms[i];
      
      if (
        body.vy >= 0 &&
        pikaRight > plat.x &&
        pikaLeft < plat.x + plat.width &&
        feetY >= plat.y - 5 &&
        feetYPrev <= plat.y + landingThreshold
      ) {
        // Safe landing registered!
        body.y = plat.y - body.height / 2;
        body.vy = 0;
        body.isGrounded = true;
        body.jumpsLeft = 2; // Restore double jumps
        onPlatform = true;
        break;
      }
    }

    if (!onPlatform) {
      body.isGrounded = false;
    }

    // Death void detection at bottom of canvas
    if (body.y > canvas.height + 60) {
      // Void bounce back with penalty
      body.y = 80;
      body.vy = 0;
      if (!body.isInvulnerable) {
        body.health = Math.max(0, body.health - 25);
        body.isInvulnerable = true;
        body.invulerableTimer = 85;
        game.shakeDuration = 15;
        triggerSound('hit');
        spawnExplosion(100, 200, '#EF4444', 12, '❓');
      }
    }

    // Update invulnerability timers
    if (body.isInvulnerable) {
      body.invulerableTimer--;
      if (body.invulerableTimer <= 0) {
        body.isInvulnerable = false;
      }
    }

    // ============================================
    // C. Platforms Scrolling, Generation, Drawing
    // ============================================
    for (let i = game.platforms.length - 1; i >= 0; i--) {
      const plat = game.platforms[i];
      plat.x -= game.gameSpeed;

      // Clean up out of boundary planks
      if (plat.x + plat.width < -100) {
        game.platforms.splice(i, 1);
        continue;
      }

      // Draw gorgeous high-voltage glass planks or lightning clouds
      ctx.save();
      ctx.translate(plat.x + shakeX, plat.y + shakeY);

      if (plat.type === 'GLASS') {
        // Glowing futuristic glass grid
        const glassGlow = ctx.createLinearGradient(0, 0, 0, plat.height);
        glassGlow.addColorStop(0, 'rgba(14, 165, 233, 0.5)'); // Cyan Glass
        glassGlow.addColorStop(1, 'rgba(3, 105, 161, 0.1)');
        ctx.fillStyle = glassGlow;
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2.5;
        
        ctx.shadowColor = '#0EA5E9';
        ctx.shadowBlur = 8;

        ctx.fillRect(0, 0, plat.width, plat.height);
        ctx.strokeRect(0, 0, plat.width, plat.height);
        
        // Shine highlights
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(plat.width * 0.35, 0);
        ctx.lineTo(plat.width * 0.15, plat.height);
        ctx.lineTo(0, plat.height);
        ctx.closePath();
        ctx.fill();
      } else if (plat.type === 'LIGHTNING_CABLE') {
        // Electric high-tension cables
        ctx.strokeStyle = '#EAB308';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#EAB308';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(plat.width, 0);
        ctx.stroke();

        // Neon metallic support pylons
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#475569';
        ctx.fillRect(0, 0, 15, plat.height);
        ctx.fillRect(plat.width - 15, 0, 15, plat.height);
      } else if (plat.type === 'GOLD') {
        // Solana hyper gold bridge planks
        ctx.fillStyle = 'rgba(234, 179, 8, 0.8)';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#FBBF24';
        ctx.shadowBlur = 15;
        ctx.fillRect(0, 0, plat.width, plat.height);
        ctx.strokeRect(0, 0, plat.width, plat.height);
      } else {
        // Cumulus vapor cloud jumping blocks
        ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(20, 10, 20, 0, Math.PI * 2);
        ctx.arc(plat.width / 2, 0, 25, 0, Math.PI * 2);
        ctx.arc(plat.width - 20, 10, 20, 0, Math.PI * 2);
        ctx.fillRect(10, 0, plat.width - 20, plat.height);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Platforms procedural endless generator
    if (game.platforms.length < 5) {
      const lastPlat = game.platforms[game.platforms.length - 1];
      
      // Determine vertical heights safely situated at the bottom (never generate unreachable jumps)
      const prevY = lastPlat ? lastPlat.y : 350;
      const proposedY = prevY + (Math.random() - 0.5) * 90;
      const safeY = Math.max(265, Math.min(370, proposedY));

      // Scale the gap based on height difference: if the proposed platform is higher,
      // shorten the gap appropriately to keep it accessible!
      const heightDiff = prevY - safeY; // positive if climbing up
      const gapMin = Math.max(50, 80 - (heightDiff > 0 ? heightDiff * 0.45 : 0));
      const gapMax = Math.max(90, 180 - (heightDiff > 0 ? heightDiff * 1.1 : 0));
      const gap = gapMin + Math.random() * (gapMax - gapMin);
      const startX = lastPlat ? lastPlat.x + lastPlat.width + gap : 800;

      const typesList: ('GLASS' | 'LIGHTNING_CABLE' | 'CLOUD' | 'GOLD')[] = ['GLASS', 'LIGHTNING_CABLE', 'CLOUD'];
      if (Math.random() < 0.12) typesList.push('GOLD');

      const selectedType = typesList[Math.floor(Math.random() * typesList.length)];
      const itemWidth = 120 + Math.floor(Math.random() * 150);

      game.platforms.push({
        x: startX,
        y: safeY,
        width: itemWidth,
        height: 200, // covers the bottom boundary completely!
        type: selectedType
      });

      // Spawn Coins and Rescuable Capture pokeballs above the newly generated bridge!
      if (Math.random() < 0.65) {
        // Cluster of coins
        const coinCount = 3 + Math.floor(Math.random() * 4);
        for (let k = 0; k < coinCount; k++) {
          game.coins.push({
            id: Math.random().toString(),
            x: startX + 25 + k * 28,
            y: safeY - 35 - Math.sin(k * 0.6) * 20,
            width: 18,
            height: 18,
            value: 1,
            isSpecial: Math.random() < 0.15
          });
        }
      }

      // Generate Pokeball Rescues (Dynamic rates depending on upgrades)
      const pokeballLuckChance = 0.16 * STAT_UPGRADES.LUCKY.values[lvlLucky];
      if (Math.random() < pokeballLuckChance && game.targetBalls.length < 2) {
        const potentialCompanions: CompanionType[] = ['CHARMANDER', 'SQUIRTLE', 'BULBASAUR', 'EEVEE'];
        
        // Better filter out already active companions to keep rescue variety
        const activeTypes = game.companions.map(c => c.type);
        const filtered = potentialCompanions.filter(t => !activeTypes.includes(t));
        const finalType = filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : potentialCompanions[Math.floor(Math.random() * potentialCompanions.length)];

        game.targetBalls.push({
          id: Math.random().toString(),
          x: startX + itemWidth / 2,
          y: safeY - 45,
          width: 32,
          height: 32,
          type: finalType
        });
      }

      // Spawn Team Rocket Koffing or chaser Meowth blocks
      if (Math.random() < 0.58 && startX > 220) {
        const obsType = Math.random() < 0.5 ? 'KOFFING' : 'MEOWTH';
        game.obstacles.push({
          id: Math.random().toString(),
          x: startX + itemWidth / 2 + (Math.random() - 0.5) * 30,
          y: obsType === 'KOFFING' ? safeY - 110 : safeY - 22,
          width: obsType === 'KOFFING' ? 36 : 42,
          height: obsType === 'KOFFING' ? 36 : 42,
          type: obsType,
          speedY: obsType === 'KOFFING' ? (Math.random() > 0.5 ? 1.2 : -1.2) : 0,
          speedX: obsType === 'MEOWTH' ? -(1.2 + Math.random() * 2.0) : 0, // runs actively leftwards towards Pikachu!
          sinOffset: Math.random() * 10
        });
      }
    }

    // ============================================
    // D. Coins Scrolling and Collect Magnetics
    // ============================================
    for (let i = game.coins.length - 1; i >= 0; i--) {
      const coin = game.coins[i];
      coin.x -= game.gameSpeed;

      // Clean up past screen
      if (coin.x < -40) {
        game.coins.splice(i, 1);
        continue;
      }

      // Coin Magnet effect (Derived from Bulbasaur rescue or Magnet upgrades level)
      const hasBulba = game.companions.some(c => c.type === 'BULBASAUR');
      const baseMagnetRadius = STAT_UPGRADES.MAGNET.values[lvlMagnet];
      const activeMagnetRange = hasBulba ? (baseMagnetRadius + 150) : baseMagnetRadius;

      if (activeMagnetRange > 0) {
        // Check distance to Pikachu (who runs static on offset 100)
        const distanceToPika = Math.hypot(coin.x - 100, coin.y - body.y);
        if (distanceToPika < activeMagnetRange) {
          const angle = Math.atan2(body.y - coin.y, 100 - coin.x);
          const drawPower = Math.min(13, 1.8 + (activeMagnetRange - distanceToPika) * 0.08);
          coin.x += Math.cos(angle) * drawPower;
          coin.y += Math.sin(angle) * drawPower;
        }
      }

      // Intersection overlap with Pika
      const collideDist = Math.hypot(coin.x - 100, coin.y - body.y);
      if (collideDist < (body.width / 2 + coin.width / 2)) {
        // Collect!
        const valueGot = coin.isSpecial ? 3 : 1;
        game.goldInRound += valueGot;
        setArcadeCoins(prev => prev + valueGot);

        // Boost Volt Energy bar (Affected by charging level up stats)
        const baseVelCharge = STAT_UPGRADES.CHARGE.values[lvlCharge];
        const addedEnergy = (coin.isSpecial ? 15 : 6) * baseVelCharge;
        setVoltEnergy(prev => Math.min(100, prev + addedEnergy));

        triggerSound('coin');

        // Text ripple indicators
        game.particles.push({
          id: Math.random().toString(),
          x: coin.x,
          y: coin.y,
          vx: 0,
          vy: -2,
          size: 14,
          color: coin.isSpecial ? '#FBBF24' : '#60A5FA',
          life: 0,
          maxLife: 28,
          text: coin.isSpecial ? "+3 SOL COINS!" : "+1 GOLD"
        });

        game.coins.splice(i, 1);
        continue;
      }

      // Draw Coins (Solana styled logo or Poké-coins)
      ctx.save();
      ctx.translate(coin.x + shakeX, coin.y + shakeY);
      
      // Floating spin bobbing oscillation
      const spinAngle = (Date.now() / 150) % (Math.PI * 2);
      ctx.scale(Math.abs(Math.sin(spinAngle)), 1.1);

      ctx.fillStyle = coin.isSpecial ? '#F59E0B' : '#FBBF24';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.4;
      
      ctx.shadowColor = coin.isSpecial ? '#D97706' : '#F59E0B';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.arc(0, 0, coin.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner details S letter (for Solana coins)
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('S', 0, 0);

      ctx.restore();
    }

    // ============================================
    // E. Capture Pokeball Rescues (Rescuing Real Companions)
    // ============================================
    for (let i = game.targetBalls.length - 1; i >= 0; i--) {
      const ball = game.targetBalls[i];
      ball.x -= game.gameSpeed;

      if (ball.x < -40) {
        game.targetBalls.splice(i, 1);
        continue;
      }

      // Sinking overlap check with Pika
      const distance = Math.hypot(ball.x - 100, ball.y - body.y);
      if (distance < (body.width / 2 + ball.width / 2)) {
        // SUCCESS: Captured/Rescued companion Pokémon!
        const rescueType = ball.type;
        
        // Add new unique companion to loop
        const activeList = game.companions.map(c => c.type);
        if (!activeList.includes(rescueType)) {
          game.companions.push({
            type: rescueType,
            x: 100 - (game.companions.length + 1) * 35, // line up behind Pikachu
            y: body.y,
            hoverOffset: Math.random() * 5
          });

          // Custom companion actions applying immediately
          if (rescueType === 'SQUIRTLE') {
            body.hasSquirtleShield = true;
          } else if (rescueType === 'EEVEE') {
            game.scoreMultiplier = 2; // Double multiplier!
          }
        }

        // Add to active state trackers
        setRescuedPokemon(prev => {
          if (!prev.includes(rescueType)) return [...prev, rescueType];
          return prev;
        });

        triggerSound('powerup');
        spawnExplosion(ball.x, ball.y, '#EF4444', 25, '❤️');

        // Floating large announcement text!
        game.particles.push({
          id: Math.random().toString(),
          x: canvas.width / 2,
          y: canvas.height / 3 - 30,
          vx: 0,
          vy: -1.4,
          size: 20,
          color: '#38BDF8',
          life: 0,
          maxLife: 65,
          text: `🎉 RESCUED ${rescueType}! COMPANION BOUND! 🎉`
        });

        game.targetBalls.splice(i, 1);
        continue;
      }

      // Draw floating Pokéballs
      ctx.save();
      ctx.translate(ball.x + shakeX, ball.y + shakeY);
      
      const bounceBob = Math.sin(Date.now() / 140) * 5;
      ctx.translate(0, bounceBob);

      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 12;

      const pBallImg = imgs.current['pokeball'];
      if (pBallImg) {
        ctx.drawImage(pBallImg, -ball.width/2, -ball.height/2, ball.width, ball.height);
      } else {
        // Pure vector backup Pokeball draw
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(0, 0, ball.width/2, Math.PI, 0);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, ball.width/2, 0, Math.PI);
        ctx.fill();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, ball.width/2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-ball.width/2, 0);
        ctx.lineTo(ball.width/2, 0);
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Capture prompt helper tag
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`SAVE ${ball.type}`, 0, -22);

      ctx.restore();
    }

    // ============================================
    // F. Team Rocket Obstacles & Damage Math
    // ============================================
    for (let i = game.obstacles.length - 1; i >= 0; i--) {
      const obs = game.obstacles[i];
      obs.x -= game.gameSpeed;

      // Koffing sinusoidal bobbing
      if (obs.type === 'KOFFING' && obs.sinOffset && obs.speedY) {
        obs.y += Math.sin(Date.now() * 0.0055 + obs.sinOffset) * 2.0; // slightly wider bobbing
      }

      // Meowth dynamic lateral dash speeds!
      if (obs.type === 'MEOWTH' && obs.speedX) {
        obs.x += obs.speedX;
      }

      if (obs.x < -60) {
        game.obstacles.splice(i, 1);
        continue;
      }

      // Inside a VOLT TACKLE: Smash through all obstacles automatically!
      if (isVoltTackling) {
        const dist = Math.hypot(obs.x - 100, obs.y - body.y);
        if (dist < (body.width / 2 + obs.width / 2 + 35)) {
          // Smash obstacle!
          triggerSound('bossHit');
          spawnExplosion(obs.x, obs.y, '#FBBF24', 18, '⚡');
          game.shakeDuration = 10;
          game.obstacles.splice(i, 1);
          continue;
        }
      } else {
        // Default physical overlap testing with Pikachu
        const hitDist = Math.hypot(obs.x - 100, obs.y - body.y);
        if (hitDist < (body.width / 2 + obs.width / 2 - 12)) {
          // Collision registered!
          if (!body.isInvulnerable) {
            // Check if protected by Squirtle Water Shelter bubble
            if (body.hasSquirtleShield) {
              body.hasSquirtleShield = false;
              body.isInvulnerable = true;
              body.invulerableTimer = 80;
              
              setRescuedPokemon(prev => prev.filter(p => p !== 'SQUIRTLE'));
              game.companions = game.companions.filter(c => c.type !== 'SQUIRTLE');

              triggerSound('powerup');
              spawnExplosion(100, body.y, '#38BDF8', 22, '🫧');
            } else {
              // Deduct health points with vibration shakes
              body.health = Math.max(0, body.health - 20);
              body.isInvulnerable = true;
              body.invulerableTimer = 100; // briefly flashing
              game.shakeDuration = 18;
              triggerSound('hit');
              spawnExplosion(100, body.y, '#EF4444', 15, '💥');
            }
          }

          game.obstacles.splice(i, 1);
          continue;
        }
      }

      // Draw Obstacles (Official Pokémon sprites: Koffing, Meowth)
      ctx.save();
      ctx.translate(obs.x + shakeX, obs.y + shakeY);

      if (obs.type === 'KOFFING') {
        ctx.rotate(Date.now() * 0.001);
        const koffingImg = imgs.current['koffing'];
        if (koffingImg) {
          ctx.drawImage(koffingImg, -obs.width/2, -obs.height/2, obs.width, obs.height);
        } else {
          ctx.fillStyle = '#8B5CF6';
          ctx.beginPath();
          ctx.arc(0, 0, obs.width/2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        const meowthImg = imgs.current['meowth'];
        if (meowthImg) {
          ctx.drawImage(meowthImg, -obs.width/2, -obs.height/2, obs.width, obs.height);
        } else {
          ctx.fillStyle = '#F59E0B';
          ctx.fillRect(-obs.width/2, -obs.height/2, obs.width, obs.height);
        }
      }
      ctx.restore();
    }

    // ============================================
    // G. Fire bullet sweeps from helper Charmander
    // ============================================
    // Shooting is now player-triggered manually ONLY (via keyboard mapping or the SHOOT console button)!
    // Charmander dynamic double bulletins are integrated directly inside executeShoot() callback instead!

    // Move and update Companion Fire Sprites
    for (let u = game.fireBullets.length - 1; u >= 0; u--) {
      const b = game.fireBullets[u];
      b.x += b.vx;

      if (b.x > canvas.width + 50) {
        game.fireBullets.splice(u, 1);
        continue;
      }

      // Hit test obstacles
      for (let o = game.obstacles.length - 1; o >= 0; o--) {
        const obs = game.obstacles[o];
        const distToObs = Math.hypot(b.x - obs.x, b.y - obs.y);
        
        if (distToObs < (obs.width / 2 + b.width / 2)) {
          // Vaporized!
          triggerSound('hit');
          spawnExplosion(obs.x, obs.y, '#EF4444', 12, '🔥');
          game.obstacles.splice(o, 1);
          game.fireBullets.splice(u, 1);
          break; // break to next bullet
        }
      }

      // Draw fire beams
      if (game.fireBullets[u]) {
        ctx.save();
        ctx.fillStyle = '#EF4444';
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 10;
        ctx.fillRect(b.x, b.y - b.height/2, b.width, b.height);
        ctx.restore();
      }
    }

    // ============================================
    // H. Move & Render Companions Line-up
    // ============================================
    for (let cidx = 0; cidx < game.companions.length; cidx++) {
      const comp = game.companions[cidx];
      
      // Let companion trail-follow Pikachu smoothly
      const targetFollowX = 100 - (cidx + 1) * 38;
      const targetFollowY = body.y + Math.sin(Date.now() * 0.005 + comp.hoverOffset) * 15;

      comp.x += (targetFollowX - comp.x) * 0.1;
      comp.y += (targetFollowY - comp.y) * 0.1;

      ctx.save();
      ctx.translate(comp.x + shakeX, comp.y + shakeY);

      // Unique custom companion actions indicators
      if (comp.type === 'CHARMANDER') {
        // Fire spark emitters
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.fillRect(-15, 10, 3, 3);
      } else if (comp.type === 'SQUIRTLE') {
        // Bubbles indicator
        ctx.fillStyle = 'rgba(14, 165, 233, 0.35)';
        ctx.beginPath();
        ctx.arc(-5, -12, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      const compImg = imgs.current[comp.type.toLowerCase()];
      if (compImg) {
        ctx.drawImage(compImg, -20, -20, 40, 40);
      } else {
        // Vector companion circles
        ctx.fillStyle = comp.type === 'CHARMANDER' ? '#EF4444' : comp.type === 'SQUIRTLE' ? '#38BDF8' : comp.type === 'BULBASAUR' ? '#10B981' : '#F59E0B';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // ============================================
    // I. DRAW PIKACHU (Main Character)
    // ============================================
    if (body.invulerableTimer <= 0 || Math.floor(Date.now() / 65) % 2 === 0) {
      ctx.save();
      ctx.translate(100 + shakeX, body.y + shakeY);

      // Soft water bubble shielding graphics surrounds Pika
      if (body.hasSquirtleShield) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#0EA5E9';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, body.width / 1.35, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Volt Tackle blazing core graphic wraps Pika during tackle
      if (isVoltTackling) {
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#FBBF24';
        ctx.shadowBlur = 25;
        ctx.beginPath();
        const startRad = (Date.now() / 82) % (Math.PI * 2);
        ctx.arc(0, 0, body.width / 1.1, startRad, startRad + Math.PI * 1.5);
        ctx.stroke();

        ctx.strokeStyle = '#38BDF8';
        ctx.beginPath();
        ctx.arc(0, 0, body.width / 1.3, -startRad * 1.4, -startRad * 1.4 + Math.PI * 1.2);
        ctx.stroke();

        // Extra dynamic high speed trails particles
        if (Math.random() < 0.45) {
          game.particles.push({
            id: Math.random().toString(),
            x: 100 + (Math.random() - 0.5) * 20,
            y: body.y + (Math.random() - 0.5) * 20,
            vx: -game.gameSpeed * 1.2,
            vy: (Math.random() - 0.5) * 3,
            size: 3 + Math.random() * 4,
            color: '#FFE600',
            life: 0,
            maxLife: 20
          });
        }
      }

      // Render official High-Quality Pikachu artwork
      const pikaImageObj = imgs.current['pikachu'];
      if (pikaImageObj) {
        ctx.save();
        // Flip Pikachu horizontally so he faces right (the running direction!)
        ctx.scale(-1, 1);
        
        let bobY = 0;
        let rotationAngle = 0;
        if (body.isGrounded && !isVoltTackling) {
          // Energetic vertical running bob
          bobY = Math.sin(Date.now() * 0.018) * 3.5;
        } else if (!body.isGrounded) {
          // Rotation tilt based on falling velocity
          rotationAngle = Math.max(-0.35, Math.min(0.35, body.vy * 0.035));
        }
        ctx.rotate(rotationAngle);
        ctx.drawImage(pikaImageObj, -body.width / 2, -body.height / 2 + bobY, body.width, body.height);
        ctx.restore();
      } else {
        // Vector model
        ctx.save();
        ctx.scale(-1, 1);
        ctx.fillStyle = '#FFE600';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, body.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }

    // ============================================
    // J. Update Volt Tackle Timer
    // ============================================
    if (isVoltTackling) {
      game.voltTackleTimer--;
      // Decelerating bar state
      setVoltEnergy(prev => Math.max(0, (game.voltTackleTimer / 340) * 100));

      if (game.voltTackleTimer <= 0) {
        setIsVoltTackling(false);
        game.gameSpeed = 5.2 + level * 0.45; // Restore normal velocity
        body.isInvulnerable = false;
      }
    }

    // ============================================
    // K. Physics Particles Loop & Floating score texts
    // ============================================
    for (let u = game.particles.length - 1; u >= 0; u--) {
      const pt = game.particles[u];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life++;

      if (pt.life >= pt.maxLife) {
        game.particles.splice(u, 1);
        continue;
      }

      ctx.save();
      ctx.translate(pt.x + shakeX, pt.y + shakeY);
      
      const fadeRatio = 1 - (pt.life / pt.maxLife);
      ctx.globalAlpha = fadeRatio;

      if (pt.text) {
        ctx.fillStyle = pt.color;
        ctx.font = `bold ${pt.size}px monospace`;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 6;
        ctx.textAlign = 'center';
        ctx.fillText(pt.text, 0, 0);
      } else if (pt.emoji) {
        ctx.font = `${pt.size * 1.5}px monospace`;
        ctx.fillText(pt.emoji, -pt.size/2, pt.size/2);
      } else {
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(0, 0, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // ============================================
    // L. Check Gameover Parameters
    // ============================================
    if (body.health <= 0) {
      triggerSound('gameover');
      
      // Persist Solana arcade earnings
      const actualRoundCoins = game.goldInRound;
      const cachedAggregate = arcadeCoins + actualRoundCoins;
      setArcadeCoins(cachedAggregate);
      localStorage.setItem('pikashu_arcade_coins', cachedAggregate.toString());

      // Save highscore
      const latestFinalScore = Math.floor(game.distance) * game.scoreMultiplier;
      if (latestFinalScore > highscore) {
        setHighscore(latestFinalScore);
        localStorage.setItem('pikashu_high_runner', latestFinalScore.toString());
      }
      
      storeNewScore(latestFinalScore);
      setGameState('GAMEOVER');
      cancelAnimationFrame(game.frameId);
      return;
    }

    game.frameId = requestAnimationFrame(gameTick);
  }, [gameState, isVoltTackling, voltEnergy, arcadeCoins, lvlHealth, lvlMagnet, lvlCharge, lvlLucky, highscore, level, leaderboard, playerName]);

  // Handle active game tick loops
  useEffect(() => {
    if (gameState === 'PLAYING') {
      physicsRef.current.frameId = requestAnimationFrame(gameTick);
    } else {
      cancelAnimationFrame(physicsRef.current.frameId);
    }
    return () => cancelAnimationFrame(physicsRef.current.frameId);
  }, [gameState, gameTick]);

  // Keys Listeners
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      // Prevent browser from scrolling when actively playing with action-inducing keys
      if (gameState === 'PLAYING') {
        const scrollKeys = [
          ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 
          'Spacebar', 'PageUp', 'PageDown', 
          'f', 'F', 's', 'S', 'x', 'X'
        ];
        if (scrollKeys.includes(e.key)) {
          e.preventDefault();
        }
      }

      // Ignore keys if focusing nickname context input fields
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.repeat) return;
      
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        executeJump();
      }
      if (e.key === 'f' || e.key === 'F' || e.key === 's' || e.key === 'S' || e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        executeShoot();
      }
      if (e.key === 'Shift') {
        e.preventDefault();
        triggerVoltTackle();
      }
    };

    window.addEventListener('keydown', handleKeys, { passive: false });
    return () => window.removeEventListener('keydown', handleKeys);
  }, [gameState, executeJump, executeShoot, triggerVoltTackle]);

  return (
    <div id="game-section" className="w-full max-w-5xl mx-auto my-8 px-4">
      {/* Container header board with Frosted Glass look */}
      <div className="bg-white/10 backdrop-blur-md border border-white/25 p-6 rounded-3xl relative overflow-hidden shadow-2xl">
        
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-300 via-sky-300 to-emerald-300"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-400/25 rounded-2xl border border-white/20 animate-pulse text-yellow-300">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-cartoon text-3xl md:text-4xl text-white tracking-widest leading-none drop-shadow-md">
                PikaVolt Adventure: Sky Dash ⚡
              </h2>
              <div className="flex items-center gap-2 mt-1.5 overflow-x-auto max-w-sm md:max-w-xl">
                <span className="font-mono text-[10px] text-emerald-300 font-extrabold tracking-wider uppercase bg-emerald-500/15 py-0.5 px-2 rounded border border-emerald-500/25 shrink-0">
                  🧬 RESCUE PLATFORMER
                </span>
                <span className="text-white/45 text-[10px]">|</span>
                <div className="flex items-center gap-1 font-mono text-[10px] font-black text-yellow-300 shrink-0">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span>{arcadeCoins} SOL COINS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sound, Community, and Telegram Section */}
          <div className="flex items-center gap-2">
            {/* Elegant Floating Telegram Community Share Pill */}
            <a
              href="https://t.me/pikavolt_adventure"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-2 px-3.5 bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/50 rounded-xl font-cartoon text-[11px] text-sky-300 uppercase tracking-widest font-black transition-all shadow-md active:scale-95 cursor-pointer select-none"
              title="Join our Telegram Community!"
              id="telegram-channel-link"
            >
              <svg className="w-4 h-4 fill-sky-300" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.94-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.28-.01.06.01.21 0 .26z" />
              </svg>
              <span>TELEGRAM</span>
            </a>

            {/* Sound Muting Control */}
            <button
              onClick={handleMuteToggle}
              className="p-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer text-white"
              title={muted ? "Unmute Game Theme" : "Mute Game Theme"}
              id="runner-mute-btn"
            >
              {muted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
            </button>
          </div>
        </div>

        {/* Dynamic Game Sandbox Viewport Frame */}
        <div className="relative w-full flex flex-col items-center">
          
          {/* Game Canvas Box */}
          <div 
            ref={containerRef}
            className="w-full relative rounded-2xl overflow-hidden aspect-[16/9] max-h-[480px] md:max-h-[500px] border border-white/25 shadow-2xl bg-slate-900"
          >
            {/* Realtime Canvas */}
            <canvas
              ref={canvasRef}
              onClick={executeJump}
              onTouchStart={(e) => {
                e.preventDefault();
                executeJump();
              }}
              className={`w-full h-full block cursor-pointer transition-all touch-none ${showCRT ? 'brightness-[1.04]' : ''}`}
            />

            {/* CRT Screen Scanlines / Filter overlay */}
            {showCRT && (
              <div className="absolute inset-0 pointer-events-none bg-radial-vignette opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] z-20" />
            )}

            {/* General Playing HUD overlay */}
            {gameState === 'PLAYING' && (
              <div className="absolute top-3 left-3 right-3 pointer-events-none flex justify-between items-start z-30 font-game text-[10px]">
                
                {/* Health & companion metrics left */}
                <div className="flex flex-col gap-2 bg-black/45 backdrop-blur-md p-2.5 rounded-xl border border-white/15">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400 fill-rose-500 animate-pulse" />
                    <div className="w-28 h-3.5 bg-slate-950/60 rounded border border-white/15 overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-400 transition-all"
                        style={{ width: `${(physicsRef.current.player.health / physicsRef.current.player.maxHealth) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Floating active companion icons */}
                  {rescuedPokemon.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1 bg-white/5 p-1 rounded-lg border border-white/10">
                      <span className="text-[7px] text-white/50 tracking-wider">RESCUED:</span>
                      <div className="flex gap-1">
                        {rescuedPokemon.map(cp => {
                          let emoji = '❤️';
                          if (cp === 'CHARMANDER') emoji = '🔥';
                          else if (cp === 'SQUIRTLE') emoji = '🫧';
                          else if (cp === 'BULBASAUR') emoji = '🌿';
                          else if (cp === 'EEVEE') emoji = '⭐';
                          return (
                            <span key={cp} title={cp} className="text-xs">{emoji}</span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Score & Ultimate Tackle control right */}
                <div className="flex flex-col gap-1 items-end pt-1">
                  <div className="bg-black/55 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5 text-yellow-300" />
                    <span className="text-white/80 uppercase">SCORE: <span className="text-yellow-300 font-bold text-xs">{score}</span></span>
                  </div>
                  <span className="text-[8px] font-mono text-emerald-300 mr-2 bg-emerald-500/10 px-1 py-0.5 rounded tracking-widest font-black">LVL {level}</span>
                </div>
              </div>
            )}

            {/* Ultimate Volt Tackle Button panel during runs */}
            {gameState === 'PLAYING' && (
              <div className="absolute bottom-4 left-4 right-4 pointer-events-auto flex justify-between items-center z-30 font-mono">
                {/* Visual energy gauge bar */}
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md py-2 px-3.5 rounded-xl border border-white/15 shadow">
                  <Zap className={`w-4 h-4 ${voltEnergy >= 100 ? 'text-yellow-300 animate-bounce' : 'text-slate-500'}`} />
                  <div className="flex flex-col">
                    <span className="text-[7.5px] text-white/50 tracking-widest font-black">VOLT TACKLE CORE ENERGY STATE:</span>
                    <div className="w-32 h-2.5 bg-slate-950/70 rounded border border-white/25 overflow-hidden mt-0.5 relative">
                      <div 
                        className={`h-full transition-all ${
                          isVoltTackling 
                            ? 'bg-gradient-to-r from-yellow-300 to-sky-300 animate-pulse' 
                            : 'bg-yellow-400'
                        }`}
                        style={{ width: `${voltEnergy}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Fire ultimate manual click trigger */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Avoid triggering jump tick
                    triggerVoltTackle();
                  }}
                  disabled={voltEnergy < 100 || isVoltTackling}
                  className={`py-2 px-4 rounded-xl border font-bold text-[10px] uppercase font-game cursor-pointer transition-all ${
                    voltEnergy >= 100 && !isVoltTackling
                      ? 'bg-gradient-to-r from-yellow-300 to-yellow-500 text-black border-white animate-bounce shadow-lg shadow-yellow-400/20 active:scale-95'
                      : 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
                  }`}
                  id="volt-ultimate-btn"
                >
                  {isVoltTackling ? '☄️ BLAZING VOLT!' : voltEnergy >= 100 ? '⚡ PRESS SHIFT / ACTIVATE!' : '🔌 CHARGING ENERGY...'}
                </button>
              </div>
            )}

            {/* SCREEN OVERLAYS: START SCREEN */}
            {gameState === 'START' && (
              <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40 overflow-y-auto">
                <div className="flex items-center gap-3 mb-2 animate-float">
                  <div className="w-18 h-18 bg-yellow-400/20 rounded-full border border-yellow-300/30 p-1">
                    <img src={POKEMON_IMAGES.pikachu} alt="Run Pikachu" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-3xl text-yellow-300 font-cartoon">⚡</span>
                  <div className="w-16 h-16 bg-rose-500/20 rounded-full border border-rose-400/30 p-1">
                    <img src={POKEMON_IMAGES.charmander} alt="Run Charmander" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-3xl text-sky-300 font-cartoon">🫧</span>
                  <div className="w-16 h-16 bg-sky-500/20 rounded-full border border-sky-400/30 p-1">
                    <img src={POKEMON_IMAGES.squirtle} alt="Run Squirtle" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                </div>

                <h3 className="font-cartoon text-3xl md:text-4xl text-yellow-300 mb-2 tracking-widest drop-shadow-[2px_2px_0px_#000]">
                  PIKAVOLT SKY DASH!
                </h3>
                
                <p className="font-sans text-xs text-white/80 max-w-lg leading-relaxed mb-4 p-3 rounded-2xl bg-white/5 border border-white/5">
                  Save your captured Pokémon buddies trapped in Team Rocket's custom Pokéballs! Run, jump, double-jump over valleys, and unleash Pikachu's supreme <strong className="text-yellow-300 animate-pulse">Ultimate Volt Tackle</strong>!
                </p>

                {/* Nickname setting card */}
                <div className="flex items-center bg-black/60 rounded-xl border border-white/10 p-1 mb-4 max-w-xs md:max-w-md w-full">
                  <span className="font-mono text-[9px] text-white/50 px-3 shrink-0 uppercase">NICKNAME (LEADERBOARD):</span>
                  <input
                    type="text"
                    maxLength={10}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                    className="bg-transparent text-yellow-300 border-none outline-none font-game font-bold text-xs uppercase text-center w-full focus:ring-0 placeholder-white/30"
                    placeholder="ANON"
                    id="player-nickname-input"
                  />
                </div>

                {/* Control Guide list */}
                <div className="flex flex-wrap gap-4 mb-5 text-[9px] text-white/60 font-mono justify-center border-t border-b border-white/5 py-2 w-full max-w-md">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-white/15 rounded border border-white/10 text-white font-bold">SPACE / CLICK</span>
                    <span>JUMP (DO DOUBLE JUMPS)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-white/15 rounded border border-white/10 text-white font-bold">SHIFT KEY</span>
                    <span>VOLT TACKLE ULTIMATE</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={startNewGame}
                    className="px-8 py-3 bg-gradient-to-r from-yellow-300 to-yellow-500 hover:from-yellow-400 hover:to-yellow-600 font-cartoon text-sm text-black rounded-2xl font-bold cursor-pointer transition-all border border-white/30 shadow-lg shadow-yellow-500/20"
                    id="start-running-btn"
                  >
                    PLAY SKY DASH 🎮
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN OVERLAYS: GAMEOVER */}
            {gameState === 'GAMEOVER' && (
              <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40 overflow-y-auto">
                <h3 className="font-cartoon text-4xl text-rose-500 mb-1 animate-pulse tracking-widest drop-shadow-[2px_2px_0px_#000]">
                  GAME OVER
                </h3>
                <h4 className="font-game text-[10px] text-white/50 mb-4">PIKACHU RAN OUT OF HP ENERGIES</h4>

                <div className="grid grid-cols-2 gap-4 mb-5 max-w-sm w-full bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="text-left py-1">
                    <div className="font-mono text-[8px] text-white/50">FINAL ROUND SCORE</div>
                    <div className="font-cartoon text-2xl text-yellow-300">{score}</div>
                  </div>
                  <div className="text-left py-1">
                    <div className="font-mono text-[8px] text-white/50">ARCADE GOLD GAINED</div>
                    <div className="font-cartoon text-2xl text-yellow-300 flex items-center gap-1.5">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      <span>+{physicsRef.current.goldInRound}</span>
                    </div>
                  </div>
                  <div className="text-left border-t border-white/10 pt-2 col-span-2">
                    <div className="font-mono text-[8px] text-white/50">ACTIVE HIGHSCORE RECORD</div>
                    <div className="font-game text-sm text-white">{Math.max(highscore, score)}</div>
                  </div>
                </div>

                <button
                  onClick={startNewGame}
                  className="px-8 py-3 bg-white text-black hover:bg-slate-200 font-cartoon text-sm rounded-2xl font-bold cursor-pointer transition-all border border-black shadow"
                  id="restart-running-btn"
                >
                  PLAY AGAIN 🚀
                </button>
              </div>
            )}

          </div>

          {/* Quick HUD guide line */}
          <div className="w-full mt-4 flex flex-col sm:flex-row justify-between items-center text-[11px] text-white/50 font-mono px-1 gap-2">
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10 text-yellow-300 text-[10px]">CONTROLS:</span>
              <span>[SPACE / W / ⬆️] Jump</span>
              <span className="text-white/20">|</span>
              <span>[F / S / X] Shoot</span>
              <span className="text-white/20">|</span>
              <span>[SHIFT] Volt Tackle</span>
            </div>
            <button 
              onClick={() => setShowCRT(!showCRT)}
              className="hover:text-white transition-colors cursor-pointer text-[10px] bg-slate-900/40 py-1 px-2.5 rounded border border-white/10 flex items-center gap-1.5"
              id="crt-toggle-btn"
            >
              <div className={`w-1.5 h-1.5 rounded-full ${showCRT ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              CRT Scanlines Filter: {showCRT ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Tactile Retro Console Controller Pad underneath the game field */}
          {gameState === 'PLAYING' && (
            <div className="w-full mt-4 p-4 rounded-2xl bg-slate-950/75 border border-white/15 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative select-none touch-none">
              
              {/* Decorative Console D-PAD (Left panel) */}
              <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-6 w-full md:w-auto shrink-0 justify-center md:justify-start">
                <div className="relative w-24 h-24">
                  {/* Vertical line cross */}
                  <div className="absolute top-0 bottom-0 left-8 right-8 bg-slate-800 rounded-md border border-white/10 shadow-inner" />
                  {/* Horizontal line cross */}
                  <div className="absolute left-0 right-0 top-8 bottom-8 bg-slate-800 rounded-md border border-white/10 shadow-inner" />
                  {/* Center core */}
                  <div className="absolute left-8 right-8 top-8 bottom-8 bg-slate-900 rounded-full border border-white/20 z-10 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
                  </div>
                  {/* Up / Down arrows label */}
                  <div className="absolute top-1 left-9 text-[9px] font-bold text-white/30 font-mono">⬆️</div>
                  <div className="absolute bottom-1 left-9 text-[9px] font-bold text-white/30 font-mono">⬇️</div>
                </div>
                <div>
                  <div className="font-cartoon text-sm text-yellow-300 tracking-wider">GAME BOY D-PAD</div>
                  <div className="font-mono text-[9px] text-white/40 leading-normal max-w-[130px]">
                    Press the action buttons to control Pikachu in real-time!
                  </div>
                </div>
              </div>

              {/* Action Buttons (Right panel) */}
              <div className="flex flex-1 w-full gap-3 md:gap-4 shrink-0">
                {/* 1. JUMP Button */}
                <button
                  onTouchStart={(e) => {
                    e.preventDefault();
                    executeJump();
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    executeJump();
                  }}
                  className="flex-1 py-4.5 bg-sky-500/25 active:bg-sky-500/40 hover:bg-sky-500/30 border-2 border-sky-400/60 rounded-xl text-white font-cartoon text-sm tracking-widest uppercase transition-all shadow-md active:scale-95 flex flex-col items-center justify-center gap-1 select-none cursor-pointer"
                  id="mobile-jump-btn"
                >
                  <div className="flex items-center gap-1">
                    <ArrowUp className="w-5 h-5 animate-bounce" />
                    <span className="text-xs font-black">JUMP ⚡</span>
                  </div>
                  <span className="font-mono text-[7px] text-sky-300 font-bold uppercase tracking-wider">[SPACE / W]</span>
                </button>

                {/* 2. SHOOT Button */}
                <button
                  onTouchStart={(e) => {
                    e.preventDefault();
                    executeShoot();
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    executeShoot();
                  }}
                  className="flex-1 py-4.5 bg-rose-500/25 active:bg-rose-500/40 hover:bg-rose-500/30 border-2 border-rose-400/60 rounded-xl text-white font-cartoon text-sm tracking-widest uppercase transition-all shadow-md active:scale-95 flex flex-col items-center justify-center gap-1 select-none cursor-pointer"
                  id="mobile-shoot-btn"
                >
                  <div className="flex items-center gap-1">
                    <Flame className="w-5 h-5 animate-pulse text-amber-400 fill-amber-500" />
                    <span className="text-xs font-black">SHOOT 🔥</span>
                  </div>
                  <span className="font-mono text-[7px] text-rose-300 font-bold uppercase tracking-wider">[F / S / X]</span>
                </button>
                
                {/* 3. VOLT TACKLE (ULTIMATE) Button */}
                <button
                  onTouchStart={(e) => {
                    e.preventDefault();
                    triggerVoltTackle();
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    triggerVoltTackle();
                  }}
                  disabled={voltEnergy < 100 || isVoltTackling}
                  className={`flex-1 py-4.5 border-2 rounded-xl font-cartoon text-sm tracking-widest uppercase transition-all shadow-md active:scale-95 flex flex-col items-center justify-center gap-1 select-none cursor-pointer ${
                    voltEnergy >= 100 && !isVoltTackling
                      ? 'bg-yellow-400 shadow-yellow-400/20 text-black border-yellow-300 animate-pulse font-extrabold shadow-lg shadow-yellow-400/20'
                      : 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
                  }`}
                  id="mobile-volt-btn"
                >
                  <div className="flex items-center gap-1">
                    <Zap className={`w-5 h-5 ${voltEnergy >= 100 ? 'text-black' : 'text-white/20'}`} />
                    <span className="text-xs font-black">ULTIMATE</span>
                  </div>
                  <span className={`font-mono text-[7px] font-bold uppercase tracking-wider ${voltEnergy >= 100 ? 'text-black/60' : 'text-white/20'}`}>[SHIFT]</span>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Dynamic Upgrade Shop & LAB and Leaderboard bento elements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t border-white/10 pt-8">
          
          {/* Section: UPGRADES LABORATORY */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
              <h3 className="font-cartoon text-xl text-white tracking-wider">
                PROFESSOR OAK'S UPGRADE LAB
              </h3>
            </div>
            
            <p className="font-sans text-xs text-white/70 mb-4 leading-relaxed">
              Spend Sol gold coins collected during high-volt runs to scale Pikachu's persistent starting capability!
            </p>

            {shopError && (
              <div className="bg-rose-500/15 border border-rose-500/20 text-rose-300 text-[10px] p-2 rounded-lg mb-3 font-mono animate-pulse">
                ⚠️ {shopError}
              </div>
            )}

            <div className="flex flex-col gap-3">
              
              {/* Option 1: HEALTH */}
              <div className="flex items-center justify-between p-2.5 bg-black/40 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                <div className="flex flex-col">
                  <span className="font-cartoon text-xs text-white uppercase tracking-wider">{STAT_UPGRADES.HEALTH.title}</span>
                  <span className="font-mono text-[8px] text-white/55">Current: Max {STAT_UPGRADES.HEALTH.values[lvlHealth]} HP (Level {lvlHealth}/5)</span>
                </div>
                <button
                  onClick={() => buyUpgrade('HEALTH')}
                  disabled={lvlHealth >= 5}
                  className={`py-1.5 px-3 rounded-lg text-xs font-mono font-black border transition-all flex items-center gap-1.5 cursor-pointer ${
                    lvlHealth >= 5
                      ? 'bg-slate-800 text-white/30 border-none cursor-default'
                      : 'bg-yellow-400/15 text-yellow-300 border-yellow-300/30 hover:bg-yellow-400 hover:text-black hover:border-white'
                  }`}
                  id="upgrade-health"
                >
                  {lvlHealth >= 5 ? 'MAX' : (
                    <>
                      <Coins className="w-3.5 h-3.5" />
                      <span>{STAT_UPGRADES.HEALTH.costs[lvlHealth]}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Option 2: MAGNET */}
              <div className="flex items-center justify-between p-2.5 bg-black/40 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                <div className="flex flex-col">
                  <span className="font-cartoon text-xs text-white uppercase tracking-wider">{STAT_UPGRADES.MAGNET.title}</span>
                  <span className="font-mono text-[8px] text-white/55">Current: Range {STAT_UPGRADES.MAGNET.values[lvlMagnet]}m (Level {lvlMagnet}/5)</span>
                </div>
                <button
                  onClick={() => buyUpgrade('MAGNET')}
                  disabled={lvlMagnet >= 5}
                  className={`py-1.5 px-3 rounded-lg text-xs font-mono font-black border transition-all flex items-center gap-1.5 cursor-pointer ${
                    lvlMagnet >= 5
                      ? 'bg-slate-800 text-white/30 border-none cursor-default'
                      : 'bg-yellow-400/15 text-yellow-300 border-yellow-300/30 hover:bg-yellow-400 hover:text-black hover:border-white'
                  }`}
                  id="upgrade-magnet"
                >
                  {lvlMagnet >= 5 ? 'MAX' : (
                    <>
                      <Coins className="w-3.5 h-3.5" />
                      <span>{STAT_UPGRADES.MAGNET.costs[lvlMagnet]}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Option 3: CHARGE SPEED */}
              <div className="flex items-center justify-between p-2.5 bg-black/40 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                <div className="flex flex-col">
                  <span className="font-cartoon text-xs text-white uppercase tracking-wider">{STAT_UPGRADES.CHARGE.title}</span>
                  <span className="font-mono text-[8px] text-white/55">Current: multiplier x{STAT_UPGRADES.CHARGE.values[lvlCharge]} (Level {lvlCharge}/5)</span>
                </div>
                <button
                  onClick={() => buyUpgrade('CHARGE')}
                  disabled={lvlCharge >= 5}
                  className={`py-1.5 px-3 rounded-lg text-xs font-mono font-black border transition-all flex items-center gap-1.5 cursor-pointer ${
                    lvlCharge >= 5
                      ? 'bg-slate-800 text-white/30 border-none cursor-default'
                      : 'bg-yellow-400/15 text-yellow-300 border-yellow-300/30 hover:bg-yellow-400 hover:text-black hover:border-white'
                  }`}
                  id="upgrade-charge"
                >
                  {lvlCharge >= 5 ? 'MAX' : (
                    <>
                      <Coins className="w-3.5 h-3.5" />
                      <span>{STAT_UPGRADES.CHARGE.costs[lvlCharge]}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Option 4: LUCKY RECALL COEFF */}
              <div className="flex items-center justify-between p-2.5 bg-black/40 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                <div className="flex flex-col">
                  <span className="font-cartoon text-xs text-white uppercase tracking-wider">{STAT_UPGRADES.LUCKY.title}</span>
                  <span className="font-mono text-[8px] text-white/55">Current: coefficient x{STAT_UPGRADES.LUCKY.values[lvlLucky]} (Level {lvlLucky}/5)</span>
                </div>
                <button
                  onClick={() => buyUpgrade('LUCKY')}
                  disabled={lvlLucky >= 5}
                  className={`py-1.5 px-3 rounded-lg text-xs font-mono font-black border transition-all flex items-center gap-1.5 cursor-pointer ${
                    lvlLucky >= 5
                      ? 'bg-slate-800 text-white/30 border-none cursor-default'
                      : 'bg-yellow-400/15 text-yellow-300 border-yellow-300/30 hover:bg-yellow-400 hover:text-black hover:border-white'
                  }`}
                  id="upgrade-lucky"
                >
                  {lvlLucky >= 5 ? 'MAX' : (
                    <>
                      <Coins className="w-3.5 h-3.5" />
                      <span>{STAT_UPGRADES.LUCKY.costs[lvlLucky]}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

          {/* Section: ARCADE LEADERBOARD */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <h3 className="font-cartoon text-xl text-white tracking-wider">
                HALL OF FAME (SKY LEADERBOARD)
              </h3>
            </div>
            
            <p className="font-sans text-xs text-white/70 mb-4 leading-relaxed">
              Dodge Team Rocket, level up, travel far, and secure your place alongside Pokemon legendary grandmasters!
            </p>

            <div className="flex flex-col gap-2">
              {leaderboard.length === 0 ? (
                <div className="text-center py-7 px-4 bg-black/35 rounded-xl border border-white/5 text-white/40 font-mono text-[11px] leading-relaxed">
                  🏆 <strong>NO RECORDS RECORDED YET!</strong><br />
                  Start a new run now and write your nickname on the legendary board! ⚡
                </div>
              ) : (
                leaderboard.map((lbEntry, index) => {
                  let badgeColor = "text-white/40";
                  if (index === 0) badgeColor = "text-yellow-300 font-extrabold";
                  else if (index === 1) badgeColor = "text-slate-300 font-bold";
                  else if (index === 2) badgeColor = "text-amber-600 font-bold";

                  return (
                    <div 
                      key={index} 
                      className="flex justify-between items-center py-2 px-3 bg-black/45 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`font-mono text-xs ${badgeColor} w-5`}>0{index + 1}</span>
                        <span className="font-game text-xs text-white/90 truncate max-w-[150px]">{lbEntry.name}</span>
                      </div>
                      <span className="font-mono text-xs text-yellow-300 font-bold">{lbEntry.score} PTS</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick tips card */}
            <div className="bg-yellow-400/5 border border-yellow-400/15 rounded-xl p-3 mt-4 text-[9px] text-white/70 leading-relaxed font-mono">
              💡 <strong>ADVENTURE METAGAME TIP:</strong> Rescuing <strong>Squirtle</strong> puts a blue water shield circle around Pikachu. Falling through voids still hurts, but you bounce back with full power!
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
