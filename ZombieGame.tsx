import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Shield, 
  ShieldAlert,
  Zap, 
  Sparkles, 
  Crosshair, 
  ArrowRight, 
  CheckCircle2, 
  XCircle,
  Package,
  Trophy,
  Skull,
  Award,
  Clock,
  Timer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/sound';
import { GRAMMAR_QUESTIONS, WEAPON_UPGRADES, getScrambledQuestion } from '../../data/grammarQuestions';
import { GrammarQuestion } from '../../types/grammar';

interface ZombieGameProps {
  onMasteryScore?: (points: number) => void;
  onZombieKilled?: () => void;
  onCrateOpened?: () => void;
  onBossDefeated?: (bossWave: number) => void;
  onWaveCleared?: (wave: number) => void;
  onVictory?: () => void;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  color: string;
  radius: number;
  life: number;
}

interface Zombie {
  id: number;
  x: number;
  y: number;
  speed: number;
  hp: number;
  maxHp: number;
  radius: number;
  color: string;
  type: 'shambler' | 'sprinter' | 'tank' | 'thrower' | 'teleporter' | 'boss_5' | 'boss_7' | 'boss_10';
  label: string;
  isBoss: boolean;
  bossName?: string;
  summonThresholds?: number[];
  attackCooldown?: number;
  teleportTimer?: number;
  isPhasing?: boolean;
}

interface DroppedCrate {
  id: number;
  x: number;
  y: number;
  type: 'gun' | 'stim' | 'nuke' | 'ammo';
  name: string;
  color: string;
  radius: number;
  glowAngle: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

interface BossProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: 'knife' | 'sonic' | 'charge';
  color: string;
  life: number;
  isMinionKnife?: boolean;
}

const MAX_WAVES = 10;
const MAX_CRATES_ON_MAP = 5;

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export type GameDifficulty = 'EASY' | 'HARD';

export const ZombieGame: React.FC<ZombieGameProps> = ({ 
  onMasteryScore, 
  onZombieKilled,
  onCrateOpened,
  onBossDefeated,
  onWaveCleared,
  onVictory
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // USER REQUEST: Difficulty Hard and Easy
  const [difficulty, setDifficulty] = useState<GameDifficulty>('EASY');

  // React State for HUD & UI modals
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'PAUSED' | 'CRATE_QUESTION' | 'BOSS_PARRY' | 'GAMEOVER' | 'VICTORY'>('MENU');
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [playerHp, setPlayerHp] = useState(150);
  const [weaponTier, setWeaponTier] = useState(1);
  const [activeQuestion, setActiveQuestion] = useState<GrammarQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.isMuted());
  const [activeCrate, setActiveCrate] = useState<DroppedCrate | null>(null);
  const [zombiesDefeated, setZombiesDefeated] = useState(0);
  const [cratesCollected, setCratesCollected] = useState(0);
  const [nearbyCratePrompt, setNearbyCratePrompt] = useState<string | null>(null);
  const [activeBossInfo, setActiveBossInfo] = useState<{ name: string; hp: number; maxHp: number } | null>(null);
  const [bossParrySkill, setBossParrySkill] = useState<{
    type: 'charge' | 'knife' | 'sonic';
    name: string;
    bossName: string;
    damage: number;
  } | null>(null);
  const [bossTelegraphBanner, setBossTelegraphBanner] = useState<string | null>(null);
  const [mapCratesCount, setMapCratesCount] = useState(5);
  
  // USER REQUEST: Fast, punchy zombie waves (finish game faster!)
  const [zombiesLeft, setZombiesLeft] = useState(8);
  const [gameTimeElapsed, setGameTimeElapsed] = useState(0);

  // References to keep game loop 120fps decoupled from React state
  const stateRef = useRef({
    difficulty: 'EASY' as GameDifficulty,
    gameState: 'MENU' as 'MENU' | 'PLAYING' | 'PAUSED' | 'CRATE_QUESTION' | 'BOSS_PARRY' | 'GAMEOVER' | 'VICTORY',
    player: {
      x: 460,
      y: 320,
      radius: 18,
      speed: 4.0,
      hp: 150,
      maxHp: 150,
      angle: 0,
      invulnerableTimer: 0
    },
    keys: { w: false, a: false, s: false, d: false, space: false },
    mouse: { x: 460, y: 320, isDown: false },
    bullets: [] as Bullet[],
    zombies: [] as Zombie[],
    crates: [] as DroppedCrate[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    bossProjectiles: [] as BossProjectile[],
    bossSkillTimer: 8,
    bossStunTimer: 0,
    score: 0,
    wave: 1,
    weaponTier: 1,
    lastShotTime: 0,
    waveSpawnedCount: 0,
    waveTotalCount: 8, // Fast Wave 1 start
    waveSpawnTimer: 0,
    bossSpawned: false,
    zombiesDefeated: 0,
    cratesCollected: 0,
    nukeTriggered: false,
    activeCrate: null as DroppedCrate | null,
    gameTimeElapsed: 0,
    lastUiSyncTime: 0,
    zombiesLeft: 8
  });

  const questionIndexRef = useRef(0);

  const handleToggleSound = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  // Inspect Dropped Crate Question with SCRAMBLED answers!
  const triggerCrateQuestion = useCallback((crate: DroppedCrate) => {
    stateRef.current.gameState = 'CRATE_QUESTION';
    stateRef.current.activeCrate = crate;
    setGameState('CRATE_QUESTION');
    setActiveCrate(crate);

    // Pick raw question and SCRAMBLE answer choices so they are never in fixed order!
    const rawQuestion = GRAMMAR_QUESTIONS[questionIndexRef.current % GRAMMAR_QUESTIONS.length];
    questionIndexRef.current++;
    const scrambled = getScrambledQuestion(rawQuestion);

    setActiveQuestion(scrambled);
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    sounds.playCrateUnlock();
  }, []);

  const handleAnswerSubmit = (optionIndex: number) => {
    if (answerSubmitted || !activeQuestion || !activeCrate) return;
    setSelectedAnswer(optionIndex);
    setAnswerSubmitted(true);

    const isCorrect = optionIndex === activeQuestion.correctIndex;
    if (isCorrect) {
      sounds.playCorrect();
      sounds.playUpgrade();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      // Apply Crate Reward based on type
      if (activeCrate.type === 'gun') {
        const nextTier = Math.min(5, stateRef.current.weaponTier + 1);
        stateRef.current.weaponTier = nextTier;
        setWeaponTier(nextTier);
      } else if (activeCrate.type === 'stim') {
        // USER REQUEST: make the healing less health (reduced to +22 HP on Easy, +14 HP on Hard)
        const healAmt = stateRef.current.difficulty === 'EASY' ? 22 : 14;
        stateRef.current.player.hp = Math.min(stateRef.current.player.maxHp, stateRef.current.player.hp + healAmt);
        setPlayerHp(stateRef.current.player.hp);
        sounds.playHeal();
        stateRef.current.floatingTexts.push({
          x: stateRef.current.player.x,
          y: stateRef.current.player.y - 20,
          text: `+${healAmt} HP (MEDKIT)`,
          color: '#34D399',
          alpha: 1,
          vy: -1.6
        });
      } else if (activeCrate.type === 'nuke') {
        stateRef.current.nukeTriggered = true;
        sounds.playNuke();
      } else if (activeCrate.type === 'ammo') {
        const nextTier = Math.min(5, stateRef.current.weaponTier + 1);
        stateRef.current.weaponTier = nextTier;
        setWeaponTier(nextTier);
      }

      stateRef.current.crates = stateRef.current.crates.filter(c => c.id !== activeCrate.id);

      const bonusPts = 300;
      stateRef.current.score += bonusPts;
      setScore(stateRef.current.score);
      stateRef.current.cratesCollected++;
      setCratesCollected(stateRef.current.cratesCollected);

      onMasteryScore?.(bonusPts);
      onCrateOpened?.();
    } else {
      sounds.playWrong();
    }
  };

  const handleResumeFromCrate = () => {
    stateRef.current.gameState = 'PLAYING';
    stateRef.current.activeCrate = null;
    setGameState('PLAYING');
    setActiveQuestion(null);
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    setActiveCrate(null);
  };

  // Trigger Defensive Quick-Time Parry Challenge for 50 Damage Boss Attacks
  const triggerBossParryChallenge = useCallback((skill: {
    type: 'charge' | 'knife' | 'sonic';
    name: string;
    bossName: string;
    damage: number;
  }) => {
    stateRef.current.gameState = 'BOSS_PARRY';
    setGameState('BOSS_PARRY');
    setBossParrySkill(skill);

    const rawQuestion = GRAMMAR_QUESTIONS[questionIndexRef.current % GRAMMAR_QUESTIONS.length];
    questionIndexRef.current++;
    const scrambled = getScrambledQuestion(rawQuestion);

    setActiveQuestion(scrambled);
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    sounds.playWrong();
  }, []);

  const handleBossParrySubmit = (optionIndex: number) => {
    if (answerSubmitted || !activeQuestion || !bossParrySkill) return;
    setSelectedAnswer(optionIndex);
    setAnswerSubmitted(true);

    const isCorrect = optionIndex === activeQuestion.correctIndex;
    const s = stateRef.current;

    if (isCorrect) {
      sounds.playCorrect();
      sounds.playShieldBlock();
      sounds.playUpgrade();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 }
      });

      // Stun boss and push back
      s.bossStunTimer = 2.0;
      const boss = s.zombies.find(z => z.isBoss);
      if (boss) {
        const pushAngle = Math.atan2(boss.y - s.player.y, boss.x - s.player.x);
        boss.x += Math.cos(pushAngle) * 85;
        boss.y += Math.sin(pushAngle) * 85;
      }

      s.bossProjectiles = [];

      s.floatingTexts.push({
        x: s.player.x,
        y: s.player.y - 30,
        text: '🛡️ 50 DAMAGE BLOCKED! ACTIVE BARRIER DEFLECTED ATTACK!',
        color: '#34D399',
        alpha: 1,
        vy: -2
      });

      onMasteryScore?.(150);
    } else {
      sounds.playWrong();
      // Deal 25 damage in EASY mode, 50 damage in HARD mode
      const bossDmg = s.difficulty === 'EASY' ? 25 : 50;
      s.player.hp = Math.max(0, s.player.hp - bossDmg);
      setPlayerHp(s.player.hp);

      for (let p = 0; p < 16; p++) {
        s.particles.push({
          x: s.player.x,
          y: s.player.y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          color: '#EF4444',
          radius: Math.random() * 3 + 2,
          alpha: 1
        });
      }

      s.floatingTexts.push({
        x: s.player.x,
        y: s.player.y - 30,
        text: `💥 PARRY FAILED! -${bossDmg} DAMAGE TAKEN!`,
        color: '#EF4444',
        alpha: 1,
        vy: -2
      });

      s.bossProjectiles = [];

      if (s.player.hp <= 0) {
        s.gameState = 'GAMEOVER';
        setGameState('GAMEOVER');
      }
    }
  };

  const handleResumeFromBossParry = () => {
    if (stateRef.current.gameState === 'GAMEOVER') return;
    stateRef.current.gameState = 'PLAYING';
    setGameState('PLAYING');
    setActiveQuestion(null);
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    setBossParrySkill(null);
  };

  // USER REQUEST:
  // "remove nuke from hard mode" - Easy gets 1 Nuke; Hard mode has NO nukes!
  const spawnWaveLoot = useCallback((s: typeof stateRef.current, width = 920, height = 640) => {
    s.crates = [];
    const lootPlan: DroppedCrate['type'][] = s.difficulty === 'EASY'
      ? ['nuke', 'gun', 'stim', 'ammo', 'stim']
      : ['gun', 'stim', 'ammo', 'gun', 'stim'];
    const crateNames: Record<DroppedCrate['type'], string> = {
      nuke: 'TACTICAL NUKE',
      gun: 'WEAPON CACHE',
      stim: 'ADRENALINE STIM',
      ammo: 'KINETIC AMMO'
    };
    const crateColors: Record<DroppedCrate['type'], string> = {
      nuke: '#F59E0B',
      gun: '#3B82F6',
      stim: '#10B981',
      ammo: '#8B5CF6'
    };

    const shuffled = [...lootPlan].sort(() => Math.random() - 0.5);

    shuffled.forEach((type, idx) => {
      let cx = 80 + Math.random() * (width - 160);
      let cy = 80 + Math.random() * (height - 160);
      if (Math.hypot(cx - s.player.x, cy - s.player.y) < 130) {
        cx = (cx + 260) % (width - 120) + 60;
        cy = (cy + 220) % (height - 120) + 60;
      }
      s.crates.push({
        id: Date.now() + idx + Math.random(),
        x: cx,
        y: cy,
        type,
        name: crateNames[type],
        color: crateColors[type],
        radius: type === 'nuke' ? 18 : 15,
        glowAngle: Math.random() * Math.PI * 2
      });
    });

    setMapCratesCount(s.crates.length);
  }, []);

  const startGame = () => {
    const isEasy = difficulty === 'EASY';
    const startHp = isEasy ? 150 : 100;
    const startSpeed = isEasy ? 4.0 : 3.6;

    stateRef.current = {
      difficulty,
      gameState: 'PLAYING',
      player: {
        x: 460,
        y: 320,
        radius: 18,
        speed: startSpeed,
        hp: startHp,
        maxHp: startHp,
        angle: 0,
        invulnerableTimer: 0
      },
      keys: { w: false, a: false, s: false, d: false, space: false },
      mouse: { x: 460, y: 320, isDown: false },
      bullets: [],
      zombies: [],
      crates: [],
      particles: [],
      floatingTexts: [],
      bossProjectiles: [],
      bossSkillTimer: 7.5,
      bossStunTimer: 0,
      score: 0,
      wave: 1,
      weaponTier: 1,
      lastShotTime: 0,
      waveSpawnedCount: 0,
      waveTotalCount: 8,
      waveSpawnTimer: 0,
      bossSpawned: false,
      zombiesDefeated: 0,
      cratesCollected: 0,
      nukeTriggered: false,
      activeCrate: null,
      gameTimeElapsed: 0,
      lastUiSyncTime: 0,
      zombiesLeft: 8
    };

    // Guarantee 5 loot crates in Wave 1 including at least 1 Tactical Nuke!
    spawnWaveLoot(stateRef.current, 920, 640);

    setScore(0);
    setWave(1);
    setPlayerHp(startHp);
    setWeaponTier(1);
    setZombiesDefeated(0);
    setCratesCollected(0);
    setNearbyCratePrompt(null);
    setActiveBossInfo(null);
    setBossTelegraphBanner(null);
    setBossParrySkill(null);
    setGameTimeElapsed(0);
    setZombiesLeft(8);
    setGameState('PLAYING');
    sounds.playUpgrade();
  };

  // Keyboard and mouse handlers
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') stateRef.current.keys.w = true;
      if (key === 'a' || key === 'arrowleft') stateRef.current.keys.a = true;
      if (key === 's' || key === 'arrowdown') stateRef.current.keys.s = true;
      if (key === 'd' || key === 'arrowright') stateRef.current.keys.d = true;
      if (key === ' ') {
        stateRef.current.keys.space = true;
        if (stateRef.current.gameState === 'MENU' || stateRef.current.gameState === 'VICTORY') startGame();
      }
      if (key === 'p' || key === 'escape') {
        if (stateRef.current.gameState === 'PLAYING') {
          stateRef.current.gameState = 'PAUSED';
          setGameState('PAUSED');
        } else if (stateRef.current.gameState === 'PAUSED') {
          stateRef.current.gameState = 'PLAYING';
          setGameState('PLAYING');
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') stateRef.current.keys.w = false;
      if (key === 'a' || key === 'arrowleft') stateRef.current.keys.a = false;
      if (key === 's' || key === 'arrowdown') stateRef.current.keys.s = false;
      if (key === 'd' || key === 'arrowright') stateRef.current.keys.d = false;
      if (key === ' ') stateRef.current.keys.space = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    stateRef.current.mouse.x = e.clientX - rect.left;
    stateRef.current.mouse.y = e.clientY - rect.top;
  };

  const handleMouseDown = () => {
    stateRef.current.mouse.isDown = true;
  };

  const handleMouseUp = () => {
    stateRef.current.mouse.isDown = false;
  };

  // 120 FPS Main Game Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.016); // 120 FPS high refresh clamp

      const s = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Handle Tactical Nuke (USER REQUEST: Boss is IMMUNE to nuke)
      if (s.nukeTriggered) {
        s.nukeTriggered = false;
        s.zombies.forEach(z => {
          if (z.isBoss) {
            // USER REQUIREMENT: make the nuke immune to the boss!
            s.floatingTexts.push({
              x: z.x,
              y: z.y - 25,
              text: '🛡️ BOSS IS IMMUNE TO NUKE!',
              color: '#EF4444',
              alpha: 1,
              vy: -1.5
            });
          } else {
            z.hp = 0;
            s.score += 25;
          }
          for (let p = 0; p < (z.isBoss ? 6 : 14); p++) {
            s.particles.push({
              x: z.x,
              y: z.y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              color: '#F59E0B',
              radius: Math.random() * 4 + 2,
              alpha: 1
            });
          }
        });

        // Filter out non-bosses killed by nuke
        s.zombies = s.zombies.filter(z => z.hp > 0);

        s.floatingTexts.push({
          x: width / 2,
          y: height / 2,
          text: '⚡ TACTICAL NUKE CLEARED THE HORDE! (BOSS IMMUNE)',
          color: '#FBBF24',
          alpha: 1,
          vy: -1.5
        });
      }

      if (s.gameState === 'PLAYING') {
        // Live Mission Stopwatch
        s.gameTimeElapsed += dt;

        // Real-time count of Zombies Left (queue + active on map)
        const currentZombiesRemaining = Math.max(0, (s.waveTotalCount - s.waveSpawnedCount) + s.zombies.length);
        s.zombiesLeft = currentZombiesRemaining;

        // Sync throttled state to React every 150ms for smooth 120 FPS
        if (now - s.lastUiSyncTime > 150) {
          s.lastUiSyncTime = now;
          setGameTimeElapsed(Math.floor(s.gameTimeElapsed));
          setZombiesLeft(currentZombiesRemaining);
        }

        // 1. Move Player
        let dx = 0;
        let dy = 0;
        if (s.keys.w) dy -= 1;
        if (s.keys.s) dy += 1;
        if (s.keys.a) dx -= 1;
        if (s.keys.d) dx += 1;

        if (dx !== 0 && dy !== 0) {
          dx *= 0.7071;
          dy *= 0.7071;
        }

        s.player.x = Math.max(s.player.radius, Math.min(width - s.player.radius, s.player.x + dx * s.player.speed));
        s.player.y = Math.max(s.player.radius, Math.min(height - s.player.radius, s.player.y + dy * s.player.speed));

        s.player.angle = Math.atan2(s.mouse.y - s.player.y, s.mouse.x - s.player.x);

        if (s.player.invulnerableTimer > 0) {
          s.player.invulnerableTimer -= dt;
        }

        // 2. Shooting
        const currentWeapon = WEAPON_UPGRADES[s.weaponTier] || WEAPON_UPGRADES[1];
        const fireInterval = 1 / currentWeapon.fireRate;
        if ((s.mouse.isDown || s.keys.space) && now / 1000 - s.lastShotTime >= fireInterval) {
          s.lastShotTime = now / 1000;
          sounds.playLaser();

          const count = currentWeapon.bulletCount;
          const baseAngle = s.player.angle;
          const spread = count > 1 ? 0.22 : 0;

          for (let i = 0; i < count; i++) {
            const angleOffset = count === 1 ? 0 : (i - (count - 1) / 2) * spread;
            const finalAngle = baseAngle + angleOffset;
            const speed = 13;
            s.bullets.push({
              x: s.player.x + Math.cos(finalAngle) * 22,
              y: s.player.y + Math.sin(finalAngle) * 22,
              vx: Math.cos(finalAngle) * speed,
              vy: Math.sin(finalAngle) * speed,
              damage: currentWeapon.damage,
              color: currentWeapon.color,
              radius: s.weaponTier >= 4 ? 4.5 : 3,
              life: 1.2
            });
          }
        }

        // 3. Update Bullets
        for (let i = s.bullets.length - 1; i >= 0; i--) {
          const b = s.bullets[i];
          b.x += b.vx;
          b.y += b.vy;
          b.life -= dt;
          if (b.life <= 0 || b.x < 0 || b.x > width || b.y < 0 || b.y > height) {
            s.bullets.splice(i, 1);
          }
        }

        // 4. Check Dropped Crate Collisions
        let foundNearbyCrate: DroppedCrate | null = null;
        for (let ci = s.crates.length - 1; ci >= 0; ci--) {
          const crate = s.crates[ci];
          crate.glowAngle += dt * 3;
          const distToPlayer = Math.hypot(crate.x - s.player.x, crate.y - s.player.y);

          if (distToPlayer < s.player.radius + crate.radius + 14) {
            foundNearbyCrate = crate;
            if (distToPlayer < s.player.radius + crate.radius) {
              triggerCrateQuestion(crate);
              break;
            }
          }
        }
        setNearbyCratePrompt(foundNearbyCrate ? `STEP ONTO ${foundNearbyCrate.name} TO SOLVE PUZZLE` : null);

        // 5. Spawn Zombies & FAST-PACED BOSSES (Waves 5, 7, 10)
        s.waveSpawnTimer += dt;

        // USER REQUEST: Finish game faster, intense punchy boss fights
        if (!s.bossSpawned) {
          if (s.wave === 5) {
            s.bossSpawned = true;
            s.zombies.push({
              id: 5005,
              x: width / 2,
              y: -40,
              speed: 1.4,
              hp: 950,
              maxHp: 950,
              radius: 36,
              color: '#E11D48',
              type: 'boss_5',
              label: 'BOSS: PASSIVE GOLEM',
              bossName: 'The Passive Golem (Wave 5)',
              isBoss: true,
              summonThresholds: [0.5]
            });
            sounds.playBossRoar();
            sounds.playUpgrade();
          } else if (s.wave === 7) {
            s.bossSpawned = true;
            s.zombies.push({
              id: 7007,
              x: width + 40,
              y: height / 2,
              speed: 1.95,
              hp: 1400,
              maxHp: 1400,
              radius: 38,
              color: '#9333EA',
              type: 'boss_7',
              label: 'BOSS: BUREAUCRATIC ABOMINATION',
              bossName: 'Bureaucratic Abomination (Wave 7)',
              isBoss: true,
              summonThresholds: [0.5]
            });
            sounds.playBossRoar();
            sounds.playUpgrade();
          } else if (s.wave === 10) {
            s.bossSpawned = true;
            s.zombies.push({
              id: 10010,
              x: width / 2,
              y: -50,
              speed: 1.6,
              hp: 2200,
              maxHp: 2200,
              radius: 46,
              color: '#F59E0B',
              type: 'boss_10',
              label: 'FINAL BOSS: ARCH-TITAN OVERLORD',
              bossName: 'The Arch-Titan Overlord (Final Boss)',
              isBoss: true,
              summonThresholds: [0.75, 0.5, 0.25]
            });
            sounds.playBossRoar();
            sounds.playUpgrade();
          }
        }

        // Fast spawn interval so waves finish faster!
        const spawnInterval = Math.max(0.45, 0.75 - Math.min(s.wave * 0.04, 0.35));
        if (s.waveSpawnedCount < s.waveTotalCount && s.waveSpawnTimer >= spawnInterval) {
          s.waveSpawnTimer = 0;
          s.waveSpawnedCount++;

          let zx = 0;
          let zy = 0;
          const edge = Math.floor(Math.random() * 4);
          if (edge === 0) { zx = Math.random() * width; zy = -25; }
          else if (edge === 1) { zx = width + 25; zy = Math.random() * height; }
          else if (edge === 2) { zx = Math.random() * width; zy = height + 25; }
          else { zx = -25; zy = Math.random() * height; }

          const rand = Math.random();
          let zType: Zombie['type'] = 'shambler';
          let zHp = 42 + s.wave * 8;
          let zSpeed = 1.35 + Math.random() * 0.35;
          let zRadius = 16;
          let zColor = '#10B981';
          let zLabel = 'was bitten by';
          let attackCooldown: number | undefined = undefined;
          let teleportTimer: number | undefined = undefined;

          // USER REQUEST: Knife Thrower & Teleporter (removed from easy mode!)
          if (s.wave >= 2 && rand > 0.76) {
            zType = 'thrower';
            zHp = 38 + s.wave * 6;
            zSpeed = 1.35;
            zRadius = 15;
            zColor = '#06B6D4'; // Cyan
            zLabel = 'is throwing knives';
            attackCooldown = 1.6 + Math.random() * 1.6;
          } else if (s.difficulty === 'HARD' && s.wave >= 3 && rand > 0.56 && rand <= 0.76) {
            // Teleport zombies ONLY spawn in HARD mode!
            zType = 'teleporter';
            zHp = 44 + s.wave * 6;
            zSpeed = 1.65;
            zRadius = 15;
            zColor = '#A855F7'; // Violet Phase
            zLabel = 'was phased behind by';
            teleportTimer = 3.0 + Math.random() * 2.0;
          } else if (rand > 0.38) {
            zType = 'sprinter';
            zHp = 28 + s.wave * 5;
            zSpeed = 2.5;
            zRadius = 14;
            zColor = '#F59E0B';
            zLabel = 'is being said';
          } else if (rand > 0.20) {
            zType = 'tank';
            zHp = 80 + s.wave * 12;
            zSpeed = 1.05;
            zRadius = 22;
            zColor = '#8B5CF6';
            zLabel = 'has been made';
          }

          s.zombies.push({
            id: Math.random(),
            x: zx,
            y: zy,
            speed: zSpeed,
            hp: zHp,
            maxHp: zHp,
            radius: zRadius,
            color: zColor,
            type: zType,
            label: zLabel,
            isBoss: false,
            attackCooldown,
            teleportTimer
          });
        }

        // Track active boss HP for top HUD bar
        const currentActiveBoss = s.zombies.find(z => z.isBoss);
        if (currentActiveBoss) {
          setActiveBossInfo({
            name: currentActiveBoss.bossName || currentActiveBoss.label,
            hp: Math.max(0, currentActiveBoss.hp),
            maxHp: currentActiveBoss.maxHp
          });
        } else {
          setActiveBossInfo(null);
        }

        // ==============================================================
        // USER REQUEST: BOSS SPECIAL SKILLS (SONIC WAVE, KNIFE, CHARGE)
        // Deals 50 damage and requires active voice answer to block
        // ==============================================================
        if (s.bossStunTimer > 0) {
          s.bossStunTimer -= dt;
        }

        if (currentActiveBoss && s.bossStunTimer <= 0) {
          s.bossSkillTimer -= dt;

          // 2.0 seconds before firing, show warning telegraph
          if (s.bossSkillTimer <= 2.0 && s.bossSkillTimer > 0) {
            const skillName = currentActiveBoss.type === 'boss_5'
              ? 'SEISMIC DUAL ROCK CHARGE'
              : currentActiveBoss.type === 'boss_7'
              ? '5-BLADE OBSCURITY FAN'
              : 'CASCADE SUPERSONIC SHOCKWAVE';

            setBossTelegraphBanner(`⚠️ WARNING: ${currentActiveBoss.bossName || 'BOSS'} PREPARING ${skillName}! (50 DMG)`);
          }

          // Trigger special attack when cooldown expires
          if (s.bossSkillTimer <= 0) {
            if (currentActiveBoss.type === 'boss_7') {
              // Boss 7: 5 razor knives in wide fan spread (cooldown 7.5s)
              s.bossSkillTimer = 7.5;
              setBossTelegraphBanner(null);
              const baseAngle = Math.atan2(s.player.y - currentActiveBoss.y, s.player.x - currentActiveBoss.x);
              [-0.44, -0.22, 0, 0.22, 0.44].forEach(offset => {
                const angle = baseAngle + offset;
                s.bossProjectiles.push({
                  x: currentActiveBoss.x,
                  y: currentActiveBoss.y,
                  vx: Math.cos(angle) * 8.8,
                  vy: Math.sin(angle) * 8.8,
                  radius: 14,
                  type: 'knife',
                  color: '#C084FC',
                  life: 2.8
                });
              });
              sounds.playWrong();
            } else if (currentActiveBoss.type === 'boss_10') {
              // Boss 10: Dual cascading sonic waves + 2 flanking razor knives (cooldown 6.5s)
              s.bossSkillTimer = 6.5;
              setBossTelegraphBanner(null);
              const baseAngle = Math.atan2(s.player.y - currentActiveBoss.y, s.player.x - currentActiveBoss.x);
              // Lead primary sonic wave
              s.bossProjectiles.push({
                x: currentActiveBoss.x,
                y: currentActiveBoss.y,
                vx: Math.cos(baseAngle) * 6.5,
                vy: Math.sin(baseAngle) * 6.5,
                radius: 32,
                type: 'sonic',
                color: '#38BDF8',
                life: 3.4
              });
              // Secondary trailing pulse wave
              s.bossProjectiles.push({
                x: currentActiveBoss.x,
                y: currentActiveBoss.y,
                vx: Math.cos(baseAngle) * 4.9,
                vy: Math.sin(baseAngle) * 4.9,
                radius: 22,
                type: 'sonic',
                color: '#60A5FA',
                life: 3.2
              });
              // Flanking razor knives
              [-0.36, 0.36].forEach(offset => {
                const angle = baseAngle + offset;
                s.bossProjectiles.push({
                  x: currentActiveBoss.x,
                  y: currentActiveBoss.y,
                  vx: Math.cos(angle) * 8.0,
                  vy: Math.sin(angle) * 8.0,
                  radius: 14,
                  type: 'knife',
                  color: '#FBBF24',
                  life: 2.6
                });
              });
              sounds.playWrong();
            } else {
              // Boss 5: Dual seismic rock charges (cooldown 8.0s)
              s.bossSkillTimer = 8.0;
              setBossTelegraphBanner(null);
              const baseAngle = Math.atan2(s.player.y - currentActiveBoss.y, s.player.x - currentActiveBoss.x);
              [-0.18, 0.18].forEach(offset => {
                const angle = baseAngle + offset;
                s.bossProjectiles.push({
                  x: currentActiveBoss.x,
                  y: currentActiveBoss.y,
                  vx: Math.cos(angle) * 8.4,
                  vy: Math.sin(angle) * 8.4,
                  radius: 32,
                  type: 'charge',
                  color: '#F43F5E',
                  life: 2.2
                });
              });
              sounds.playWrong();
            }
          }
        } else if (!currentActiveBoss) {
          setBossTelegraphBanner(null);
        }

        // Update Boss Projectiles & Collision with Player
        for (let bpi = s.bossProjectiles.length - 1; bpi >= 0; bpi--) {
          const bp = s.bossProjectiles[bpi];
          bp.x += bp.vx;
          bp.y += bp.vy;
          bp.life -= dt;

          if (Math.random() < 0.55) {
            s.particles.push({
              x: bp.x,
              y: bp.y,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              color: bp.color,
              radius: Math.random() * 2.5 + 1,
              alpha: 0.8
            });
          }

          // Check hit on player
          const distToPlayer = Math.hypot(bp.x - s.player.x, bp.y - s.player.y);
          if (distToPlayer < s.player.radius + bp.radius) {
            // USER REQUEST: Knife thrown by zombie deals 10 HP (5 HP in EASY mode)!
            if (bp.isMinionKnife) {
              if (s.player.invulnerableTimer <= 0) {
                const knifeDmg = s.difficulty === 'EASY' ? 5 : 10;
                s.player.hp = Math.max(0, s.player.hp - knifeDmg);
                s.player.invulnerableTimer = 0.55;
                sounds.playKnifeHit();
                setPlayerHp(s.player.hp);
                s.floatingTexts.push({
                  x: s.player.x,
                  y: s.player.y - 18,
                  text: `-${knifeDmg} HP (KNIFE!)`,
                  color: '#EF4444',
                  alpha: 1,
                  vy: -1.6
                });
                for (let p = 0; p < 8; p++) {
                  s.particles.push({
                    x: s.player.x,
                    y: s.player.y,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    color: '#06B6D4',
                    radius: 2.5,
                    alpha: 1
                  });
                }
                if (s.player.hp <= 0) {
                  s.gameState = 'GAMEOVER';
                  setGameState('GAMEOVER');
                }
              }
              s.bossProjectiles.splice(bpi, 1);
              continue;
            }

            const skillName = bp.type === 'knife'
              ? 'FLYING OBSCURITY KNIVES'
              : bp.type === 'sonic'
              ? 'SUPERSONIC APOCALYPSE WAVE'
              : 'SEISMIC BULL CHARGE';

            triggerBossParryChallenge({
              type: bp.type,
              name: skillName,
              bossName: currentActiveBoss?.bossName || 'Boss Titan',
              damage: 50
            });

            s.bossProjectiles.splice(bpi, 1);
            break;
          }

          if (bp.life <= 0 || bp.x < -50 || bp.x > width + 50 || bp.y < -50 || bp.y > height + 50) {
            s.bossProjectiles.splice(bpi, 1);
          }
        }

        // 6. Update Zombies & Bullet Collisions
        for (let zi = s.zombies.length - 1; zi >= 0; zi--) {
          const z = s.zombies[zi];
          if (z.isBoss && s.bossStunTimer > 0) {
            // Boss is stunned! Cannot move while stunned
          } else {
            // USER REQUEST: Knife Thrower zombie attacks (deal 10 HP on hit)
            if (z.type === 'thrower') {
              z.attackCooldown = (z.attackCooldown ?? 2.5) - dt;
              if (z.attackCooldown <= 0) {
                z.attackCooldown = 3.2 + Math.random() * 1.0;
                const kAngle = Math.atan2(s.player.y - z.y, s.player.x - z.x);
                s.bossProjectiles.push({
                  x: z.x,
                  y: z.y,
                  vx: Math.cos(kAngle) * 7.5,
                  vy: Math.sin(kAngle) * 7.5,
                  radius: 9,
                  type: 'knife',
                  color: '#06B6D4',
                  life: 2.4,
                  isMinionKnife: true
                });
                sounds.playKnifeThrow();
              }
            }

            // USER REQUEST: Teleporter zombie teleports right behind you!
            if (z.type === 'teleporter') {
              z.teleportTimer = (z.teleportTimer ?? 3.8) - dt;
              if (z.teleportTimer <= 0.4 && z.teleportTimer > 0) {
                z.isPhasing = true;
                s.particles.push({
                  x: z.x + (Math.random() - 0.5) * 16,
                  y: z.y + (Math.random() - 0.5) * 16,
                  vx: 0,
                  vy: -1.2,
                  color: '#C084FC',
                  radius: 3,
                  alpha: 0.9
                });
              } else if (z.teleportTimer <= 0) {
                z.teleportTimer = 4.8 + Math.random() * 1.5;
                z.isPhasing = false;
                // Teleport right behind player (opposite facing angle)!
                const behindAngle = s.player.angle + Math.PI;
                const behindDist = 65;
                z.x = Math.max(25, Math.min(width - 25, s.player.x + Math.cos(behindAngle) * behindDist));
                z.y = Math.max(25, Math.min(height - 25, s.player.y + Math.sin(behindAngle) * behindDist));
                sounds.playTeleport();

                for (let p = 0; p < 12; p++) {
                  s.particles.push({
                    x: z.x,
                    y: z.y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    color: '#A855F7',
                    radius: 3.5,
                    alpha: 1
                  });
                }
                s.floatingTexts.push({
                  x: z.x,
                  y: z.y - 18,
                  text: '⚡ BEHIND YOU!',
                  color: '#C084FC',
                  alpha: 1,
                  vy: -1.8
                });
              }
            }

            const zAngle = Math.atan2(s.player.y - z.y, s.player.x - z.x);
            const speedMod = s.difficulty === 'EASY' ? 0.85 : 1.0;
            z.x += Math.cos(zAngle) * (z.speed * speedMod);
            z.y += Math.sin(zAngle) * (z.speed * speedMod);
          }

          for (let bi = s.bullets.length - 1; bi >= 0; bi--) {
            const b = s.bullets[bi];
            const dist = Math.hypot(b.x - z.x, b.y - z.y);
            if (dist < z.radius + b.radius) {
              z.hp -= b.damage;
              sounds.playHit();

              for (let p = 0; p < (z.isBoss ? 8 : 4); p++) {
                s.particles.push({
                  x: b.x,
                  y: b.y,
                  vx: (Math.random() - 0.5) * 5,
                  vy: (Math.random() - 0.5) * 5,
                  color: b.color,
                  radius: Math.random() * 2 + 1,
                  alpha: 1
                });
              }

              s.floatingTexts.push({
                x: z.x + (Math.random() - 0.5) * 16,
                y: z.y - 12,
                text: `-${b.damage}`,
                color: z.isBoss ? '#FBBF24' : '#FFFFFF',
                alpha: 1,
                vy: -1
              });

              s.bullets.splice(bi, 1);

              // USER REQUEST: Boss Harder - Phase summoning & Enrage speed
              if (z.isBoss && z.summonThresholds && z.summonThresholds.length > 0) {
                const healthRatio = z.hp / z.maxHp;
                if (healthRatio <= z.summonThresholds[0]) {
                  z.summonThresholds.shift(); // consume threshold
                  sounds.playWrong();

                  if (z.type === 'boss_5') {
                    // Golem summons 2 stone tanks
                    for (let m = 0; m < 2; m++) {
                      s.zombies.push({
                        id: Math.random(),
                        x: z.x + (m === 0 ? -45 : 45),
                        y: z.y + 35,
                        speed: 1.15,
                        hp: 150,
                        maxHp: 150,
                        radius: 22,
                        color: '#9F1239',
                        type: 'tank',
                        label: 'has been reinforced by',
                        isBoss: false
                      });
                    }
                    s.floatingTexts.push({
                      x: z.x,
                      y: z.y - 25,
                      text: '🗿 GOLEM SUMMONS STONE ESCORTS!',
                      color: '#F43F5E',
                      alpha: 1,
                      vy: -2
                    });
                  } else if (z.type === 'boss_10') {
                    // Arch-Titan summons 3 fast sprinters
                    for (let m = 0; m < 3; m++) {
                      s.zombies.push({
                        id: Math.random(),
                        x: z.x + (m - 1) * 45,
                        y: z.y + 40,
                        speed: 2.7,
                        hp: 65,
                        maxHp: 65,
                        radius: 14,
                        color: '#F59E0B',
                        type: 'sprinter',
                        label: 'was struck by',
                        isBoss: false
                      });
                    }
                    s.floatingTexts.push({
                      x: z.x,
                      y: z.y - 25,
                      text: '👑 ARCH-TITAN SUMMONS SPRINTER HORDE!',
                      color: '#FBBF24',
                      alpha: 1,
                      vy: -2
                    });
                  }
                }
              }

              // Boss Enraged Speed
              if (z.isBoss) {
                if (z.type === 'boss_10' && z.hp < z.maxHp * 0.4) {
                  z.speed = 2.15;
                } else if (z.type === 'boss_7' && z.hp < z.maxHp * 0.5) {
                  z.speed = 2.45;
                }
              }

              // Zombie or Boss Defeated!
              if (z.hp <= 0) {
                s.zombiesDefeated++;
                setZombiesDefeated(s.zombiesDefeated);
                onZombieKilled?.();

                if (z.isBoss) {
                  onBossDefeated?.(s.wave);
                  sounds.playUpgrade();
                  confetti({ particleCount: 70, spread: 70, origin: { y: 0.5 } });

                  s.floatingTexts.push({
                    x: z.x,
                    y: z.y,
                    text: `🏆 ${z.bossName || 'BOSS'} CRUSHED!`,
                    color: '#FBBF24',
                    alpha: 1,
                    vy: -2
                  });

                  // Guaranteed Crate Drop for Boss (respecting max 5)
                  if (s.crates.length >= MAX_CRATES_ON_MAP) {
                    s.crates.shift(); // remove oldest crate so boss reward always fits
                  }
                  s.crates.push({
                    id: Math.random(),
                    x: z.x,
                    y: z.y,
                    type: (s.wave === 10 && s.difficulty === 'EASY') ? 'nuke' : s.wave === 7 ? 'stim' : 'gun',
                    name: (s.wave === 10 && s.difficulty === 'EASY') ? 'QUANTUM NUKE' : s.wave === 7 ? 'MEGA ADRENALINE' : 'WEAPON CACHE',
                    color: (s.wave === 10 && s.difficulty === 'EASY') ? '#F59E0B' : s.wave === 7 ? '#10B981' : '#3B82F6',
                    radius: 18,
                    glowAngle: 0
                  });
                  setMapCratesCount(s.crates.length);
                } else if (s.crates.length < MAX_CRATES_ON_MAP && Math.random() < 0.10) {
                  // In Hard mode, no nukes drop
                  const crateTypes: DroppedCrate['type'][] = s.difficulty === 'EASY'
                    ? ['gun', 'stim', 'nuke', 'ammo']
                    : ['gun', 'stim', 'ammo', 'stim'];
                  const pickedType = crateTypes[Math.floor(Math.random() * crateTypes.length)];
                  const crateColors = {
                    gun: '#3B82F6',
                    stim: '#10B981',
                    nuke: '#F59E0B',
                    ammo: '#8B5CF6'
                  };
                  const crateNames = {
                    gun: 'WEAPON CRATE',
                    stim: 'ADRENALINE STIM',
                    nuke: 'TACTICAL NUKE',
                    ammo: 'KINETIC AMMO'
                  };

                  s.crates.push({
                    id: Math.random(),
                    x: z.x,
                    y: z.y,
                    type: pickedType,
                    name: crateNames[pickedType],
                    color: crateColors[pickedType],
                    radius: 14,
                    glowAngle: 0
                  });
                  setMapCratesCount(s.crates.length);
                }

                s.score += z.isBoss ? 800 : z.type === 'tank' ? 45 : 20;
                setScore(s.score);

                for (let p = 0; p < (z.isBoss ? 20 : 8); p++) {
                  s.particles.push({
                    x: z.x,
                    y: z.y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    color: z.color,
                    radius: Math.random() * 3 + 1.5,
                    alpha: 1
                  });
                }

                s.zombies.splice(zi, 1);
                break;
              }
            }
          }

          // Check player collision
          if (s.player.invulnerableTimer <= 0) {
            const playerDist = Math.hypot(s.player.x - z.x, s.player.y - z.y);
            if (playerDist < s.player.radius + z.radius) {
              const dmg = z.isBoss ? 45 : z.type === 'tank' ? 20 : 12;
              s.player.hp -= dmg;
              s.player.invulnerableTimer = 0.8;
              sounds.playWrong();
              setPlayerHp(Math.max(0, s.player.hp));

              const knockAngle = Math.atan2(s.player.y - z.y, s.player.x - z.x);
              s.player.x += Math.cos(knockAngle) * 22;
              s.player.y += Math.sin(knockAngle) * 22;

              if (s.player.hp <= 0) {
                s.gameState = 'GAMEOVER';
                setGameState('GAMEOVER');
              }
            }
          }
        }

        // 7. Check Wave Progression & WAVE 10 VICTORY!
        if (s.waveSpawnedCount >= s.waveTotalCount && s.zombies.length === 0) {
          if (s.wave >= MAX_WAVES) {
            // ==============================================================
            // USER REQUEST: "a victory when defeat all wave 10"
            // ==============================================================
            s.gameState = 'VICTORY';
            setGameState('VICTORY');
            sounds.playUpgrade();
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.4 }
            });
            onWaveCleared?.(10);
            onVictory?.();
          } else {
            // Advance to next wave
            onWaveCleared?.(s.wave);
            s.wave++;
            s.waveSpawnedCount = 0;
            // USER REQUEST: Fast punchy wave counts (8 to 26 zombies) to finish game faster!
            s.waveTotalCount = 8 + (s.wave - 1) * 2;
            s.bossSpawned = false;
            setWave(s.wave);
            // USER REQUEST: Spawn at least 5 loot crates in each wave (including at least 1 Tactical Nuke)!
            spawnWaveLoot(s, width, height);
            sounds.playUpgrade();

            s.floatingTexts.push({
              x: width / 2,
              y: height / 2,
              text: `WAVE ${s.wave} INCOMING!`,
              color: '#34D399',
              alpha: 1,
              vy: -1.5
            });
          }
        }
      }

      // Update Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= dt * 2.2;
        if (p.alpha <= 0) s.particles.splice(i, 1);
      }

      // Update Floating Texts
      for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
        const ft = s.floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= dt * 1.5;
        if (ft.alpha <= 0) s.floatingTexts.splice(i, 1);
      }

      // ==========================================
      // RENDER CANVAS (PROJECT ZOMBOID ATMOSPHERE)
      // ==========================================
      ctx.fillStyle = '#060A10';
      ctx.fillRect(0, 0, width, height);

      // Cracked asphalt lines
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 1.5;
      const gridSize = 45;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Render Dropped Buff Crates (USER REQUEST: at least 5 per wave, 1 guaranteed Tactical Nuke)
      s.crates.forEach(crate => {
        ctx.save();
        ctx.translate(crate.x, crate.y);

        const isNuke = crate.type === 'nuke';
        const pulse = Math.sin(crate.glowAngle) * (isNuke ? 6 : 4);
        ctx.fillStyle = isNuke ? 'rgba(245, 158, 11, 0.35)' : `${crate.color}33`;
        ctx.beginPath();
        ctx.arc(0, 0, crate.radius + (isNuke ? 9 : 6) + pulse, 0, Math.PI * 2);
        ctx.fill();

        if (isNuke) {
          ctx.strokeStyle = '#FBBF24';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.fillStyle = crate.color;
        ctx.shadowColor = isNuke ? '#FBBF24' : crate.color;
        ctx.shadowBlur = isNuke ? 18 : 12;
        ctx.fillRect(-crate.radius / 1.5, -crate.radius / 1.5, crate.radius * 1.3, crate.radius * 1.3);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-2, -crate.radius / 2, 4, crate.radius);
        ctx.fillRect(-crate.radius / 2, -2, crate.radius, 4);

        ctx.restore();

        ctx.font = isNuke ? 'bold 10px Outfit, sans-serif' : 'bold 9px Outfit, sans-serif';
        ctx.fillStyle = isNuke ? '#FBBF24' : crate.color;
        ctx.textAlign = 'center';
        ctx.fillText(isNuke ? `☢️ ${crate.name}` : `📦 ${crate.name}`, crate.x, crate.y + crate.radius + 14);
      });

      // Render Bullets
      s.bullets.forEach(b => {
        ctx.save();
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Boss Special Projectiles (Knives, Sonic Waves, Earth Charge)
      s.bossProjectiles.forEach(bp => {
        ctx.save();
        if (bp.type === 'knife') {
          ctx.translate(bp.x, bp.y);
          const angle = Math.atan2(bp.vy, bp.vx);
          ctx.rotate(angle);
          ctx.fillStyle = bp.isMinionKnife ? '#06B6D4' : '#C084FC';
          ctx.shadowColor = bp.isMinionKnife ? '#0891B2' : '#A855F7';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(13, 0);
          ctx.lineTo(-7, -4.5);
          ctx.lineTo(-3, 0);
          ctx.lineTo(-7, 4.5);
          ctx.closePath();
          ctx.fill();
        } else if (bp.type === 'sonic') {
          ctx.shadowColor = '#38BDF8';
          ctx.shadowBlur = 14;
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(bp.x, bp.y, bp.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(bp.x, bp.y, bp.radius * 0.55, 0, Math.PI * 2);
          ctx.stroke();
        } else if (bp.type === 'charge') {
          ctx.shadowColor = '#F43F5E';
          ctx.shadowBlur = 16;
          ctx.fillStyle = '#F43F5E';
          ctx.beginPath();
          ctx.arc(bp.x, bp.y, bp.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
        ctx.restore();
      });

      // Render Zombies & Bosses
      s.zombies.forEach(z => {
        ctx.save();
        if (z.type === 'teleporter' && z.isPhasing) {
          ctx.globalAlpha = 0.45;
        }
        ctx.fillStyle = z.color;
        ctx.shadowColor = z.color;
        ctx.shadowBlur = z.isBoss ? 24 : 6;

        ctx.beginPath();
        ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2);
        ctx.fill();

        // Thrower indicator
        if (z.type === 'thrower') {
          ctx.strokeStyle = '#22D3EE';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(z.x, z.y, z.radius + 3, 0, Math.PI * 2);
          ctx.stroke();
        } else if (z.type === 'teleporter') {
          // Teleporter phase ring
          ctx.strokeStyle = '#C084FC';
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(z.x, z.y, z.radius + 3.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Crown / Skull indicator for Bosses
        if (z.isBoss) {
          ctx.strokeStyle = '#FBBF24';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(z.x, z.y, z.radius + 4, 0, Math.PI * 2);
          ctx.stroke();

          if (s.bossStunTimer > 0) {
            ctx.font = 'bold 12px sans-serif';
            ctx.fillStyle = '#FBBF24';
            ctx.textAlign = 'center';
            ctx.fillText('💫 STUNNED!', z.x, z.y - z.radius - 20);
          }
        }

        if (z.hp < z.maxHp || z.isBoss) {
          const barW = z.radius * (z.isBoss ? 2.8 : 2);
          const barH = z.isBoss ? 6 : 4;
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.fillRect(z.x - barW / 2, z.y - z.radius - 12, barW, barH);
          ctx.fillStyle = z.isBoss ? '#F59E0B' : '#EF4444';
          ctx.fillRect(z.x - barW / 2, z.y - z.radius - 12, (z.hp / z.maxHp) * barW, barH);
        }

        ctx.font = z.isBoss ? 'bold 11px Outfit, sans-serif' : '10px Outfit, sans-serif';
        ctx.fillStyle = z.isBoss ? '#FBBF24' : '#E2E8F0';
        ctx.textAlign = 'center';
        ctx.fillText(z.label, z.x, z.y + z.radius + (z.isBoss ? 16 : 12));
        ctx.restore();
      });

      // Render Particles
      s.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // PROJECT ZOMBOID FLASHLIGHT CONE & VISION
      ctx.save();
      const flashlightAngle = s.player.angle;
      const coneWidth = Math.PI * 0.42;
      const coneLength = 320;

      const flashGrad = ctx.createRadialGradient(
        s.player.x, s.player.y, 25,
        s.player.x, s.player.y, coneLength
      );
      flashGrad.addColorStop(0, 'rgba(66, 133, 244, 0.16)');
      flashGrad.addColorStop(1, 'rgba(66, 133, 244, 0.0)');

      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.moveTo(s.player.x, s.player.y);
      ctx.arc(s.player.x, s.player.y, coneLength, flashlightAngle - coneWidth / 2, flashlightAngle + coneWidth / 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Render Player
      ctx.save();
      ctx.translate(s.player.x, s.player.y);
      ctx.rotate(s.player.angle);

      if (s.player.invulnerableTimer <= 0 || Math.floor(now / 80) % 2 === 0) {
        ctx.fillStyle = '#3B82F6';
        ctx.shadowColor = '#60A5FA';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, s.player.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(8, -4, 16, 8);

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Render Floating Text
      s.floatingTexts.forEach(ft => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = 'bold 12px Outfit, sans-serif';
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [triggerCrateQuestion, triggerBossParryChallenge, onZombieKilled, onBossDefeated, onWaveCleared, onVictory]);

  const currentWeaponInfo = WEAPON_UPGRADES[weaponTier] || WEAPON_UPGRADES[1];

  return (
    <div className="relative w-full h-[640px] rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* Top HUD Cluster */}
      <div className="absolute top-0 inset-x-0 z-20 px-4 py-2.5 bg-gradient-to-b from-slate-950/95 via-slate-950/80 to-transparent flex items-center justify-between text-xs text-slate-300 pointer-events-none">
        {/* Left: Player Vital Signs */}
        <div className="flex items-center gap-3.5 pointer-events-auto">
          {/* USER REQUEST: Difficulty Badge */}
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1 shadow-sm ${
            difficulty === 'EASY'
              ? 'bg-emerald-950/85 border-emerald-500/60 text-emerald-300'
              : 'bg-rose-950/85 border-rose-500/60 text-rose-300'
          }`}>
            {difficulty === 'EASY' ? '🟢 EASY' : '💀 HARD'}
          </span>

          {/* Health */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">HP</span>
            <div className="w-24 h-3 bg-slate-800 rounded-sm overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-emerald-400 transition-all duration-200"
                style={{ width: `${Math.max(0, (playerHp / (difficulty === 'EASY' ? 150 : 100)) * 100)}%` }}
              />
            </div>
            <span className="font-mono tabular-nums text-slate-100 font-bold">
              {Math.max(0, playerHp)}/{difficulty === 'EASY' ? 150 : 100}
            </span>
          </div>

          {/* Gun Tier */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">GUN:</span>
            <span className="font-bold text-blue-400">{currentWeaponInfo.name}</span>
            <span className="text-slate-500 font-mono text-[11px]">T{weaponTier}</span>
          </div>

          {/* USER REQUEST: 5 Crates with 1 Tactical Nuke in Easy mode; Pure tactical in Hard mode */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-900/90 border border-slate-800">
            <Package className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 font-mono text-[11px]">CRATES:</span>
            <span className="font-mono text-amber-300 font-bold text-xs">{mapCratesCount} on map</span>
            {difficulty === 'EASY' ? (
              <span className="text-[9px] font-mono font-bold text-amber-400 px-1 bg-amber-950/80 rounded border border-amber-500/40">
                ☢️ 1 NUKE
              </span>
            ) : (
              <span className="text-[9px] font-mono font-bold text-cyan-400 px-1 bg-cyan-950/80 rounded border border-cyan-500/40">
                ⚔️ NO NUKES
              </span>
            )}
          </div>
        </div>

        {/* Center: Mission Stopwatch & Zombies Left Counter */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Mission Stopwatch */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-semibold shadow-inner">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">TIME:</span>
            <span className="text-white text-sm font-bold tabular-nums">{formatTime(gameTimeElapsed)}</span>
          </div>

          {/* USER REQUEST: Real-Time Zombies Left Counter */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono text-xs font-semibold shadow-inner transition-colors ${
            zombiesLeft <= 5 && zombiesLeft > 0
              ? 'bg-amber-950/90 border-amber-500/60 text-amber-300 animate-pulse'
              : 'bg-red-950/80 border-red-500/40 text-rose-300'
          }`}>
            <Skull className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400">ZOMBIES LEFT:</span>
            <span className="text-white text-sm font-bold tabular-nums">{zombiesLeft}</span>
            {zombiesLeft <= 5 && zombiesLeft > 0 && (
              <span className="text-[9px] font-bold text-amber-300 tracking-wider">FINAL PACK!</span>
            )}
          </div>
        </div>

        {/* Right Stats: Wave & Boss Indicator */}
        <div className="flex items-center gap-3.5 pointer-events-auto">
          <span className="px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-500/30 text-[10px] font-mono text-blue-400">
            120 FPS
          </span>

          {/* Wave Counter (1 to 10) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400 font-mono text-xs font-semibold">WAVE:</span>
            <span className="font-mono font-bold text-amber-400 text-sm">{wave} / {MAX_WAVES}</span>
            {wave === 5 && <span className="text-[10px] text-rose-400 font-bold font-mono">⚠️ BOSS</span>}
            {wave === 7 && <span className="text-[10px] text-purple-400 font-bold font-mono">⚠️ BOSS</span>}
            {wave === 10 && <span className="text-[10px] text-amber-400 font-bold font-mono">👑 FINAL BOSS</span>}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">SCORE:</span>
            <span className="font-mono font-bold text-white text-sm tabular-nums">{score}</span>
          </div>

          <button
            onClick={handleToggleSound}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* BOSS TELEGRAPH WARNING BANNER (50 DMG INCOMING) */}
      {bossTelegraphBanner && (
        <div className="absolute top-14 inset-x-0 z-30 flex justify-center pointer-events-none animate-pulse">
          <div className="px-4 py-1.5 rounded-lg bg-red-600/90 text-white font-bold text-xs shadow-xl border border-red-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-300 animate-bounce" />
            {bossTelegraphBanner}
          </div>
        </div>
      )}

      {/* ACTIVE BOSS HEALTH BAR BANNER (FOR WAVE 5, 7, 10) */}
      {activeBossInfo && (
        <div className="absolute top-14 inset-x-0 z-20 flex justify-center pointer-events-none">
          <div className="max-w-md w-full bg-slate-950/90 border border-rose-500/60 rounded-xl p-2.5 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Skull className="w-4 h-4 text-rose-400 animate-pulse" />
                {activeBossInfo.name}
              </span>
              <span>{activeBossInfo.hp} / {activeBossInfo.maxHp} HP</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-100"
                style={{ width: `${Math.max(0, (activeBossInfo.hp / activeBossInfo.maxHp) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Game Canvas */}
      <canvas
        ref={canvasRef}
        width={920}
        height={640}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className="w-full h-full cursor-crosshair select-none block"
      />

      {/* Dynamic Crate Prompt Banner */}
      {nearbyCratePrompt && (
        <div className="absolute bottom-10 inset-x-0 z-20 flex justify-center pointer-events-none">
          <div className="px-4 py-1.5 rounded-full bg-amber-500/90 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/30 flex items-center gap-2 animate-bounce">
            <Package className="w-4 h-4" />
            {nearbyCratePrompt}
          </div>
        </div>
      )}

      {/* Control Hint Line at Bottom */}
      <div className="absolute bottom-2 inset-x-0 z-10 text-center pointer-events-none">
        <span className="text-[11px] text-slate-500 font-mono tracking-wide">
          WASD Move · Mouse Aim & Shoot · Bosses at Wave 5, 7 & 10 · Clear Wave 10 to Achieve Total Victory!
        </span>
      </div>

      {/* TITLE SCREEN MODAL */}
      {gameState === 'MENU' && (
        <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mb-4 text-blue-400 shadow-lg shadow-blue-500/20">
              <Crosshair className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight font-display mb-1">
              Zombie Outbreak: Fast 10-Wave Defense
            </h2>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Fast-paced active voice survival! Solve dropped crates to get weapon upgrades and medkits. Dodge <strong className="text-cyan-400">Knife Throwers</strong> and parry lethal boss attacks!
            </p>

            {/* USER REQUEST: Difficulty Hard and Easy Selection */}
            <div className="w-full mb-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Select Difficulty
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setDifficulty('EASY');
                    stateRef.current.difficulty = 'EASY';
                    setPlayerHp(150);
                    sounds.playUpgrade();
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    difficulty === 'EASY'
                      ? 'bg-emerald-950/80 border-emerald-500 shadow-lg shadow-emerald-950/60 ring-1 ring-emerald-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                      🟢 EASY MODE
                    </span>
                    {difficulty === 'EASY' && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    150 Max HP · Slower Zombies (-15%) · 5 HP Knife · +22 HP Medkit · 1 Nuke/Wave · <strong className="text-emerald-300">NO Teleporters</strong>
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDifficulty('HARD');
                    stateRef.current.difficulty = 'HARD';
                    setPlayerHp(100);
                    sounds.playWrong();
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    difficulty === 'HARD'
                      ? 'bg-rose-950/80 border-rose-500 shadow-lg shadow-rose-950/60 ring-1 ring-rose-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-rose-400 flex items-center gap-1.5">
                      💀 HARD MODE
                    </span>
                    {difficulty === 'HARD' && (
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 font-mono px-2 py-0.5 rounded font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    100 Max HP · Fast Horde · 10 HP Knife · +14 HP Medkit · 50 Boss DMG · <strong className="text-rose-300">NO Nukes</strong> · <strong className="text-purple-300">Teleporters Active</strong>
                  </p>
                </button>
              </div>
            </div>

            {/* Horde Features & Crate Guarantee */}
            <div className="grid grid-cols-4 gap-2 w-full mb-4 text-left">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs text-amber-400 font-semibold block mb-0.5">📦 5 Crates/Wave</span>
                <p className="text-[10px] text-slate-400 leading-tight">5 crates each wave (Nuke in Easy; Weapon & Medkits in Hard).</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs text-cyan-400 font-semibold block mb-0.5">🔪 Knife Thrower</span>
                <p className="text-[10px] text-slate-400 leading-tight">Throws blades dealing 5-10 HP damage with audio alerts.</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs text-purple-400 font-semibold block mb-0.5">⚡ Teleporter</span>
                <p className="text-[10px] text-slate-400 leading-tight">Hard Mode only: phases & teleports behind you with sound cue!</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs text-rose-400 font-semibold block mb-0.5">👑 Wave 5, 7, 10</span>
                <p className="text-[10px] text-slate-400 leading-tight">Epic boss fights with audio roars & parry deflection!</p>
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              Start {difficulty === 'EASY' ? 'Easy' : 'Hard'} Defense (Space)
            </button>
          </div>
        </div>
      )}

      {/* DROPPED CRATE QUESTION MODAL WITH SCRAMBLED CHOICES */}
      {gameState === 'CRATE_QUESTION' && activeQuestion && activeCrate && (
        <div className="absolute inset-0 z-40 bg-slate-950/92 backdrop-blur-md flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  Dropped {activeCrate.name} Decryption
                </h3>
              </div>
              <span className="text-xs text-blue-400 font-mono font-medium">{activeQuestion.categoryLabel}</span>
            </div>

            {activeQuestion.contextSentence && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 mb-4 text-xs font-mono text-slate-300">
                <span className="text-slate-500 text-[10px] block mb-1 uppercase tracking-wider">Intercepted Sentence</span>
                "{activeQuestion.contextSentence}"
              </div>
            )}

            <p className="text-sm font-medium text-slate-100 mb-4 leading-snug">
              {activeQuestion.question}
            </p>

            <div className="space-y-2.5 mb-5">
              {activeQuestion.options.map((opt, idx) => {
                let btnStyle = 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800';
                if (answerSubmitted) {
                  if (idx === activeQuestion.correctIndex) {
                    btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold';
                  } else if (idx === selectedAnswer) {
                    btnStyle = 'bg-red-950/80 border-red-500 text-red-200';
                  } else {
                    btnStyle = 'bg-slate-950/40 border-slate-800/40 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={answerSubmitted}
                    onClick={() => handleAnswerSubmit(idx)}
                    className={`w-full p-3 text-left rounded-xl border text-xs transition flex items-start gap-3 cursor-pointer ${btnStyle}`}
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] shrink-0 font-mono mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {answerSubmitted && idx === activeQuestion.correctIndex && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {answerSubmitted && idx === selectedAnswer && idx !== activeQuestion.correctIndex && (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {answerSubmitted && (
              <div className="space-y-4 pt-3 border-t border-slate-800 animate-fadeIn">
                <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                  selectedAnswer === activeQuestion.correctIndex
                    ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-200'
                    : 'bg-red-950/40 border border-red-800/60 text-red-200'
                }`}>
                  <span className="font-bold block mb-1">
                    {selectedAnswer === activeQuestion.correctIndex 
                      ? `✓ Crate Cracked! ${activeCrate.name} Equipped!` 
                      : '✗ Decryption Failed! Passive Voice Hint:'}
                  </span>
                  <p className="mb-1">{activeQuestion.explanation}</p>
                  <p className="text-[11px] text-slate-400 italic">Tip: {activeQuestion.tip}</p>
                </div>

                <button
                  onClick={handleResumeFromCrate}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  Return to Battle <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* USER REQUEST: BOSS 50 DAMAGE ATTACK - ANSWER TO BLOCK THE SHOT */}
      {/* ============================================================== */}
      {gameState === 'BOSS_PARRY' && activeQuestion && bossParrySkill && (
        <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
          <div className="max-w-xl w-full bg-slate-900 border-2 border-red-500/80 rounded-2xl p-6 shadow-2xl relative shadow-red-950/50">
            {/* Warning Header */}
            <div className="flex items-center justify-between pb-3 border-b border-red-500/40 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 animate-pulse">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold block">
                    CRITICAL BOSS ATTACK INCOMING: 50 DAMAGE
                  </span>
                  <h3 className="font-bold text-white text-base font-display">
                    Parry Defense: {bossParrySkill.name}
                  </h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-red-950/90 border border-red-500/60 text-xs font-mono font-bold text-red-300">
                -50 HP LETHAL
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3 bg-red-950/30 border border-red-900/50 p-2.5 rounded-lg leading-relaxed">
              ⚠️ <strong className="text-white">{bossParrySkill.bossName}</strong> has unleashed its deadly special skill! Solve this active voice challenge to deploy your kinetic barrier and <strong className="text-emerald-400">PARRY 100% of the damage (0 DMG)</strong>. Failure will inflict <strong className="text-rose-400">50 DAMAGE</strong>!
            </p>

            {activeQuestion.contextSentence && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 mb-4 text-xs font-mono text-slate-300">
                <span className="text-slate-500 text-[10px] block mb-1 uppercase tracking-wider">Targeted Passive Construct</span>
                "{activeQuestion.contextSentence}"
              </div>
            )}

            <p className="text-sm font-semibold text-slate-100 mb-4 leading-snug">
              {activeQuestion.question}
            </p>

            <div className="space-y-2.5 mb-5">
              {activeQuestion.options.map((opt, idx) => {
                let btnStyle = 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-red-500/50 hover:bg-slate-800';
                if (answerSubmitted) {
                  if (idx === activeQuestion.correctIndex) {
                    btnStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-bold';
                  } else if (idx === selectedAnswer) {
                    btnStyle = 'bg-red-950/90 border-red-500 text-red-200 font-bold';
                  } else {
                    btnStyle = 'bg-slate-950/40 border-slate-800/40 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={answerSubmitted}
                    onClick={() => handleBossParrySubmit(idx)}
                    className={`w-full p-3 text-left rounded-xl border text-xs transition flex items-start gap-3 cursor-pointer ${btnStyle}`}
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] shrink-0 font-mono mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {answerSubmitted && idx === activeQuestion.correctIndex && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {answerSubmitted && idx === selectedAnswer && idx !== activeQuestion.correctIndex && (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {answerSubmitted && (
              <div className="space-y-4 pt-3 border-t border-slate-800 animate-fadeIn">
                <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                  selectedAnswer === activeQuestion.correctIndex
                    ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-200'
                    : 'bg-red-950/40 border border-red-800/60 text-red-200'
                }`}>
                  <span className="font-bold block mb-1">
                    {selectedAnswer === activeQuestion.correctIndex 
                      ? '🛡️ ATTACK BLOCKED! 0 DAMAGE TAKEN & BOSS STUNNED FOR 3.5s!' 
                      : '💥 PARRY FAILED! 50 HP DAMAGE TAKEN!'}
                  </span>
                  <p className="mb-1">{activeQuestion.explanation}</p>
                  <p className="text-[11px] text-slate-400 italic">Rule Tip: {activeQuestion.tip}</p>
                </div>

                <button
                  onClick={handleResumeFromBossParry}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {stateRef.current.player.hp <= 0 ? 'View Game Over' : 'Resume Combat'} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* USER REQUEST: 10-Minute Survival & Wave 10 Victory             */}
      {/* ============================================================== */}
      {gameState === 'VICTORY' && (
        <div className="absolute inset-0 z-40 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="max-w-md w-full bg-slate-900 border-2 border-amber-500/60 rounded-2xl p-6 shadow-2xl">
            <Trophy className="w-14 h-14 text-amber-400 mx-auto mb-2 animate-bounce" />
            <h3 className="text-2xl font-black text-white mb-1 font-display tracking-tight">
              WAVE 10 TOTAL VICTORY!
            </h3>
            <p className="text-xs text-amber-300 font-semibold mb-1">
              👑 You conquered all 10 rapid waves and banished the Arch-Titan Overlord!
            </p>
            <p className="text-xs text-slate-400 mb-6">
              By mastering the "Who Did It?" rule, parrying boss skills (50 DMG), dodging knife throwers & teleporters, and hunting weak verbs, your dynamic active arsenal saved the city in record time!
            </p>

            <div className="grid grid-cols-4 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 mb-4 text-center font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Clear Time</span>
                <span className="text-sm font-bold text-cyan-400 tabular-nums">{formatTime(gameTimeElapsed)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Final Score</span>
                <span className="text-sm font-bold text-white tabular-nums">{score}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Waves</span>
                <span className="text-sm font-bold text-amber-400">{wave} / 10 👑</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Difficulty</span>
                <span className={`text-xs font-bold ${difficulty === 'EASY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {difficulty === 'EASY' ? '🟢 Easy' : '💀 Hard'}
                </span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Play Fast 10-Wave Campaign Again
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER MODAL */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-red-400 mb-2 font-display">Overrun by Passive Sludge!</h3>
            <p className="text-xs text-slate-400 mb-4">
              The horde overwhelmed your defenses. Remember: keep the actor at the start of the sentence to stay fast and clear!
            </p>

            <div className="grid grid-cols-4 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 mb-6 text-center font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Time Survived</span>
                <span className="text-sm font-bold text-cyan-400 tabular-nums">{formatTime(gameTimeElapsed)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Score</span>
                <span className="text-sm font-bold text-white tabular-nums">{score}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Wave</span>
                <span className="text-sm font-bold text-amber-400">{wave} / 10</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Difficulty</span>
                <span className={`text-xs font-bold ${difficulty === 'EASY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {difficulty === 'EASY' ? '🟢 Easy' : '💀 Hard'}
                </span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Try Campaign Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
