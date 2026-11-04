import React, { useState, useEffect } from 'react';
import { 
  Home,
  Crosshair, 
  Trophy, 
  Building2, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Award,
  Sparkles,
  HelpCircle,
  Globe2,
  User,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZombieGame } from './games/ZombieSurvivor/ZombieGame';
import { ClassroomTycoon } from './games/ClassroomTycoon/ClassroomTycoon';
import { StrategyCodex } from './components/StrategyCodex';
import { HomeScreen } from './components/HomeScreen';
import { AchievementsModal } from './components/AchievementsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { TutorialModal } from './components/TutorialModal';
import { NameEntryModal } from './components/NameEntryModal';
import { sounds } from './utils/sound';
import { 
  loadProgression, 
  saveProgression, 
  PlayerProgression, 
  getLevelFromXp 
} from './utils/progression';

type ActiveGameMode = 'home' | 'zombie' | 'tycoon' | 'codex';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveGameMode>('home');
  const [progression, setProgression] = useState<PlayerProgression>(loadProgression);
  const [isMuted, setIsMuted] = useState(sounds.isMuted());
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(!progression.hasChosenName);
  const [unlockedToast, setUnlockedToast] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  // Save progression whenever updated
  useEffect(() => {
    saveProgression(progression);
  }, [progression]);

  // USER REQUEST: Save progress when switching game!
  const handleSwitchTab = (newTab: ActiveGameMode) => {
    saveProgression(progression);
    setActiveTab(newTab);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  // USER REQUEST: Make person make name when first arrive
  const handleConfirmName = (name: string) => {
    const updated: PlayerProgression = {
      ...progression,
      playerName: name,
      hasChosenName: true
    };
    setProgression(updated);
    saveProgression(updated);
    setIsNameModalOpen(false);
  };

  // Check and unlock achievements
  const checkAchievements = (updater: (prev: PlayerProgression) => PlayerProgression) => {
    setProgression(prev => {
      const next = updater(prev);
      let newlyUnlockedTitle: string | null = null;

      const updatedAchievements = next.achievements.map(ach => {
        let isNowUnlocked = ach.unlocked;
        let progress = ach.progress;

        if (ach.id === 'first_strike') {
          progress = next.totalQuestionsAnswered;
          if (progress >= 1) isNowUnlocked = true;
        } else if (ach.id === 'zombie_slayer_master') {
          progress = next.zombiesKilled;
          if (progress >= 50) isNowUnlocked = true;
        } else if (ach.id === 'crate_scavenger') {
          progress = next.cratesOpened;
          if (progress >= 5) isNowUnlocked = true;
        } else if (ach.id === 'boss_slayer_5') {
          progress = next.bossesDefeated >= 1 ? 1 : 0;
          if (progress >= 1) isNowUnlocked = true;
        } else if (ach.id === 'boss_slayer_7') {
          progress = next.bossesDefeated >= 2 ? 1 : 0;
          if (progress >= 1) isNowUnlocked = true;
        } else if (ach.id === 'wave_10_victory') {
          progress = next.wavesCleared >= 10 ? 1 : 0;
          if (progress >= 1) isNowUnlocked = true;
        } else if (ach.id === 'classroom_mogul') {
          progress = next.tycoonEarnings;
          if (progress >= 2500) isNowUnlocked = true;
        } else if (ach.id === 'active_virtuoso') {
          progress = next.totalQuestionsAnswered;
          if (progress >= 15) isNowUnlocked = true;
        } else if (ach.id === 'verb_hunter') {
          progress = Math.min(5, Math.floor(next.totalQuestionsAnswered / 2));
          if (progress >= 5) isNowUnlocked = true;
        }

        if (!ach.unlocked && isNowUnlocked) {
          newlyUnlockedTitle = ach.title;
        }

        return {
          ...ach,
          progress: Math.min(ach.maxProgress, progress),
          unlocked: isNowUnlocked
        };
      });

      if (newlyUnlockedTitle) {
        sounds.playUpgrade();
        setUnlockedToast(newlyUnlockedTitle);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.2 } });
        setTimeout(() => setUnlockedToast(null), 3500);
      }

      return {
        ...next,
        achievements: updatedAchievements
      };
    });
  };

  const handleAddMasteryScore = (points: number) => {
    checkAchievements(prev => ({
      ...prev,
      xp: prev.xp + points,
      totalQuestionsAnswered: prev.totalQuestionsAnswered + 1
    }));
  };

  const handleZombieKilled = () => {
    checkAchievements(prev => ({
      ...prev,
      zombiesKilled: prev.zombiesKilled + 1,
      xp: prev.xp + 15
    }));
  };

  const handleCrateOpened = () => {
    checkAchievements(prev => ({
      ...prev,
      cratesOpened: prev.cratesOpened + 1,
      xp: prev.xp + 50
    }));
  };

  const handleBossDefeated = (bossWave: number) => {
    checkAchievements(prev => ({
      ...prev,
      bossesDefeated: prev.bossesDefeated + 1,
      xp: prev.xp + (bossWave === 10 ? 300 : bossWave === 7 ? 200 : 150)
    }));
  };

  const handleWaveCleared = (wave: number) => {
    checkAchievements(prev => ({
      ...prev,
      wavesCleared: Math.max(prev.wavesCleared, wave),
      xp: prev.xp + 40
    }));
  };

  const handleVictory = () => {
    checkAchievements(prev => ({
      ...prev,
      wavesCleared: Math.max(prev.wavesCleared, 10),
      xp: prev.xp + 500
    }));
  };

  const handleFundsEarned = (amount: number) => {
    checkAchievements(prev => ({
      ...prev,
      tycoonEarnings: prev.tycoonEarnings + amount,
      xp: prev.xp + Math.floor(amount / 5)
    }));
  };

  const handleStudentHelped = () => {
    checkAchievements(prev => ({
      ...prev,
      totalQuestionsAnswered: prev.totalQuestionsAnswered + 1,
      xp: prev.xp + 40
    }));
  };

  const handleToggleSound = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  const { level, title } = getLevelFromXp(progression.xp);

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* ============================================================== */}
      {/* TOP BAR CONTRACT: Zone 1 (Brand) — Zone 2 (4 Links) — Zone 3 (1 Action Cluster) */}
      {/* ============================================================== */}
      <header className="h-14 px-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-8 shrink-0 z-30">
        {/* Zone 1: Single Wordmark */}
        <div 
          onClick={() => handleSwitchTab('home')}
          className="flex items-center gap-3 shrink-0 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 font-display font-black text-sm">
            AV
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 font-display">
            Active Voice Arcade
          </span>
        </div>

        {/* Zone 2: 4 Concise Single-Line Navigation Tabs */}
        <nav className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800/80">
          <button
            onClick={() => handleSwitchTab('home')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'home'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Home & Group 2
          </button>

          <button
            onClick={() => handleSwitchTab('zombie')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'zombie'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 text-blue-300" />
            Zombie Gunner (10 Waves)
          </button>

          <button
            onClick={() => handleSwitchTab('tycoon')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'tycoon'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-300" />
            Classroom Tycoon
          </button>

          <button
            onClick={() => handleSwitchTab('codex')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'codex'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-300" />
            Strategy Codex
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Cluster (Name, Level, Badges, Leaderboard, Tutorial, Sound) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* USER REQUEST: Player Name Pill */}
          <button
            onClick={() => setIsNameModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-blue-500/40 hover:border-blue-400 transition cursor-pointer text-xs"
            title="Edit Player Name"
          >
            <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-white font-medium truncate max-w-[95px] text-[11px] font-display">
              {progression.playerName || 'Set Name'}
            </span>
          </button>

          {/* Level & Badge Pill */}
          <button
            onClick={() => setIsAchievementsOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950 border border-amber-500/30 hover:border-amber-400 transition cursor-pointer text-xs"
            title="Inspect Digital Badges"
          >
            <span className="font-mono text-amber-400 font-bold">LVL {level}</span>
            <span className="text-slate-400 text-[11px] truncate max-w-[100px]">{title}</span>
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          </button>

          {/* Global Leaderboard Button */}
          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Global XP Leaderboard & Progress Save"
          >
            <Globe2 className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Tutorial Button */}
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Interactive Tutorial"
          >
            <HelpCircle className="w-4 h-4 text-blue-400" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* USER REQUEST: SAVE PROGRESS ON GAME SWITCH TOAST */}
      {saveToast && (
        <div className="absolute top-16 left-6 z-50 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600/90 text-white font-mono text-xs shadow-2xl animate-bounce border border-emerald-400">
          <Check className="w-4 h-4 text-emerald-200 stroke-[3]" />
          <span>Progress Saved!</span>
        </div>
      )}

      {/* UNLOCKED BADGE TOAST BANNER */}
      {unlockedToast && (
        <div className="absolute top-16 right-6 z-50 flex items-center gap-3 p-3.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-2xl animate-bounce">
          <Award className="w-5 h-5 fill-current" />
          <div>
            <span className="text-[10px] uppercase font-mono block text-slate-900 font-normal">BADGE UNLOCKED!</span>
            <span>{unlockedToast}</span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MAIN VIEWPORT: ACTIVE GAME OR HOME VIEW */}
      {/* ============================================================== */}
      <main className="flex-1 p-3 flex items-center justify-center relative overflow-hidden">
        <div className="w-full max-w-6xl h-full flex flex-col justify-center">
          {activeTab === 'home' && (
            <HomeScreen
              progression={progression}
              onSelectGame={handleSwitchTab}
              onOpenTutorial={() => setIsTutorialOpen(true)}
              onOpenAchievements={() => setIsAchievementsOpen(true)}
              onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
              onEditName={() => setIsNameModalOpen(true)}
            />
          )}

          {activeTab === 'zombie' && (
            <ZombieGame 
              onMasteryScore={handleAddMasteryScore}
              onZombieKilled={handleZombieKilled}
              onCrateOpened={handleCrateOpened}
              onBossDefeated={handleBossDefeated}
              onWaveCleared={handleWaveCleared}
              onVictory={handleVictory}
            />
          )}

          {activeTab === 'tycoon' && (
            <ClassroomTycoon 
              onMasteryScore={handleAddMasteryScore}
              onFundsEarned={handleFundsEarned}
              onStudentHelped={handleStudentHelped}
            />
          )}

          {activeTab === 'codex' && (
            <StrategyCodex />
          )}
        </div>
      </main>

      {/* USER REQUEST: First-Arrival Cadet Name Selection Modal */}
      <NameEntryModal
        isOpen={isNameModalOpen}
        initialName={progression.playerName}
        isFirstArrival={!progression.hasChosenName}
        onConfirm={handleConfirmName}
        onClose={() => setIsNameModalOpen(false)}
      />

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={progression.achievements}
        totalXp={progression.xp}
      />

      {/* Global Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        progression={progression}
        onUpdateProgression={setProgression}
      />

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onLaunchGame={setActiveTab}
      />

      {/* Footer Minimal Status bar */}
      <footer className="h-7 px-6 bg-slate-950 border-t border-slate-900 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span>Active Voice Academy · 120 FPS High-Refresh Engine</span>
          <span>·</span>
          <span>Group 2: When to Avoid Passive Voice</span>
          <span>·</span>
          <span>Digital Badges System Active</span>
        </div>
        <div className="flex items-center gap-3">
          <span>XP: {progression.xp}</span>
          <span>·</span>
          <span>Level {level}: {title}</span>
        </div>
      </footer>
    </div>
  );
}
