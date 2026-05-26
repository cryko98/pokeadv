export type GameState = 'START' | 'PLAYING' | 'GAMEOVER' | 'PAUSED' | 'BOSS_INTRO';

export type WeaponType = 'single' | 'triple' | 'zap' | 'thunder';

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  speed: number;
  weapon: WeaponType;
  weaponTimer: number; // Duration of power-up
  isInvulnerable: boolean;
  invulnerableTime: number;
  energy: number;
  maxEnergy: number;
}

export type EnemyType = 'meowth_normal' | 'meowth_fast' | 'meowth_tank' | 'meowth_boss';

export interface Enemy {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  health: number;
  maxHealth: number;
  type: EnemyType;
  scoreValue: number;
  // Sinusoidal movement parameters
  sinOffset?: number;
  sinSpeed?: number;
  sinRange?: number;
  // Attack behavior
  lastAttackTime?: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speedY: number;
  speedX: number;
  damage: number;
  color: string;
  isPlayerOwned: boolean;
}

export type PowerUpType = 'triple_shot' | 'zap_beam' | 'heal' | 'shield' | 'coin';

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: PowerUpType;
  speedY: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  emoji?: string;
}

export interface GameStats {
  score: number;
  highscore: number;
  level: number;
  meowthsBlasted: number;
  coinsCollected: number;
}
