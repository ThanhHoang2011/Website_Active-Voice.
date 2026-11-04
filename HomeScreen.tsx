import React from 'react';
import { 
  Play, 
  HelpCircle, 
  Trophy, 
  Crosshair, 
  Building2, 
  BookOpen, 
  Award, 
  Zap, 
  ShieldAlert, 
  CheckCircle2, 
  Flame, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { getLevelFromXp, PlayerProgression } from '../utils/progression';

interface HomeScreenProps {
  progression: PlayerProgression;
  onSelectGame: (game: 'zombie' | 'tycoon' | 'codex') => void;
  onOpenTutorial: () => void;
  onOpenAchievements: () => void;
  onOpenLeaderboard: () => void;
  onEditName?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  progression,
  onSelectGame,
  onOpenTutorial,
  onOpenAchievements,
  onOpenLeaderboard,
  onEditName
}) => {
  const { level, title, currentLevelXp, nextLevelXp, progressPercent } = getLevelFromXp(progression.xp);
  const unlockedBadges = progression.achievements.filter(a => a.unlocked).length;

  const WHEN_TO_AVOID_RULES = [
    {
      id: 1,
      question: 'Why can passive voice make sentences unclear? When is active voice clearer?',
      explanation: 'Passive voice often drops the actor entirely ("Mistakes were made"), leaving readers wondering who is responsible. Active voice names the doer right away ("The developer made mistakes"), providing instant clarity and accountability.',
      icon: <HelpCircle className="w-4 h-4 text-blue-400" />,
      tag: 'Clarity & Accountability',
      badgeColor: 'border-blue-500/40 text-blue-400'
    },
    {
      id: 2,
      question: 'In what situations is the active voice better?',
      explanation: 'Active voice is superior in news reporting, incident investigations, leadership commands, emergency protocols, scientific summaries, and thrillers where cause-and-effect must be unmistakably clear.',
      icon: <ShieldAlert className="w-4 h-4 text-emerald-400" />,
      tag: 'High-Stakes Scenarios',
      badgeColor: 'border-emerald-500/40 text-emerald-400'
    },
    {
      id: 3,
      question: 'How can the passive voice make sentences longer or more complicated?',
      explanation: 'Passive sentences require extra auxiliary verbs ("was", "were", "has been") and prepositional tags ("by the committee"). Trimming these weak helpers cuts word count by 25%+ without losing meaning.',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      tag: 'Sentence Bloat Reduction',
      badgeColor: 'border-amber-500/40 text-amber-400'
    },
    {
      id: 4,
      question: 'When do you need to be clear about who did the action? Why use active voice here?',
      explanation: 'In medical orders, aviation safety, and contracts, knowing WHO executed an action prevents catastrophic errors (e.g. "Nurse Rivera administered the dose" vs "The dose was administered").',
      icon: <CheckCircle2 className="w-4 h-4 text-cyan-400" />,
      tag: 'Life & Safety Precision',
      badgeColor: 'border-cyan-500/40 text-cyan-400'
    },
    {
      id: 5,
      question: 'Why is the active voice more engaging in stories or persuasive writing?',
      explanation: 'Active verbs generate forward kinetic speed. When "The dragon lunged at Sarah," readers feel visceral adrenaline. Passive voice ("Sarah was lunged at by the dragon") lags mentally and dampens emotional impact.',
      icon: <Flame className="w-4 h-4 text-rose-400" />,
      tag: 'Narrative Energy & Punch',
      badgeColor: 'border-rose-500/40 text-rose-400'
    },
    {
      id: 6,
      question: 'Does the passive voice sound unnatural in informal situations like conversations?',
      explanation: 'Yes! Everyday human speech defaults to direct action. Saying "A compliment was given to you by me" sounds like an awkward robot. Saying "I paid you a compliment!" sounds warm, human, and authentic.',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      tag: 'Authentic Dialogue',
      badgeColor: 'border-purple-500/40 text-purple-400'
    },
    {
      id: 7,
      question: 'How can too much passive voice make writing less interesting or harder to understand?',
      explanation: 'Cognitive research shows human brains mentally reverse passive sentences to decode [Actor -> Verb -> Object]. Stacking multiple passive clauses creates mental fatigue and alienates the reader.',
      icon: <BookOpen className="w-4 h-4 text-sky-400" />,
      tag: 'Cognitive Flow',
      badgeColor: 'border-sky-500/40 text-sky-400'
    }
  ];

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Hero Banner & Player Level Profile */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 shadow-2xl flex items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-600/20 border border-blue-500/40 text-blue-400">
                Google Grammar Academy
              </span>
              <span className="text-xs text-slate-400 font-mono">120 FPS High-Refresh Engine</span>
            </div>

            <h1 className="text-3xl font-extrabold text-white font-display tracking-tight mb-2">
              Master When to Avoid the Passive Voice
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Train your writing instincts through 10 intense Project Zomboid survival waves with 3 epic boss encounters (Wave 5, 7, 10), and construct an inspiring Classroom Tycoon studio!
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onSelectGame('zombie')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                Play Zombie Gunner (10 Waves)
              </button>

              <button
                onClick={onOpenTutorial}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                Interactive Tutorial
              </button>

              <button
                onClick={onOpenAchievements}
                className="px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-amber-400 font-medium text-xs border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trophy className="w-4 h-4" />
                Badges ({unlockedBadges})
              </button>

              <button
                onClick={onOpenLeaderboard}
                className="px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-emerald-400 font-medium text-xs border border-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                Leaderboard
              </button>
            </div>
          </div>

          {/* Level & Rank Badge Card */}
          <div className="w-72 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 shadow-inner flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Player Status</span>
              <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-500/40 text-blue-400 font-mono text-[11px] font-bold">
                LVL {level}
              </span>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm font-display truncate max-w-[170px]">
                  {progression.playerName || 'Cadet (You)'}
                </h3>
                {onEditName && (
                  <button
                    onClick={onEditName}
                    className="text-[10px] text-blue-400 hover:underline font-mono cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>
              <p className="text-xs text-amber-400 font-medium">{title}</p>
              <span className="text-[11px] text-slate-400 font-mono">{progression.xp} Total XP</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Progress to Lvl {Math.min(8, level + 1)}</span>
                <span>{currentLevelXp} / {nextLevelXp} XP</span>
              </div>
              <div className="w-full h-2 bg-slate-850 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Game Quick-Launch Cards */}
        <div className="grid grid-cols-2 gap-5">
          {/* Card 1: Zombie Survivor (10 Waves + Bosses at 5, 7, 10) */}
          <div
            onClick={() => onSelectGame('zombie')}
            className="group relative rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-6 transition-all cursor-pointer shadow-xl overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition">
                  <Crosshair className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-[10px] font-mono font-bold text-blue-300">
                  <span>10 WAVES</span>
                  <span>·</span>
                  <span className="text-amber-400">3 BOSSES</span>
                </div>
              </div>

              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold block mb-1">
                Project Zomboid Survival Mode
              </span>
              <h3 className="text-lg font-bold text-white font-display mb-1.5 group-hover:text-blue-300 transition">
                Zombie Gunner: 10-Wave Defense
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Fight in the dark with your flashlight. Defeated zombies drop glowing buff crates with <strong className="text-amber-400">scrambled answer options</strong>. Slay the Golem at Wave 5, the Abomination at Wave 7, and the Arch-Titan at Wave 10 for total victory!
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-blue-400 pt-3 border-t border-slate-800">
              <span>Play 10-Wave Defense (120 FPS)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 2: Classroom Tycoon */}
          <div
            onClick={() => onSelectGame('tycoon')}
            className="group relative rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-6 transition-all cursor-pointer shadow-xl overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-300">
                  <span>TYCOON SIM</span>
                  <span>·</span>
                  <span className="text-amber-400">EXPANSIONS</span>
                </div>
              </div>

              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                Academy Management Sim
              </span>
              <h3 className="text-lg font-bold text-white font-display mb-1.5 group-hover:text-emerald-300 transition">
                Classroom Tycoon Builder
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Construct student desks, interactive Google Smartboards, and dynamic verb libraries. Consult students with scrambled active voice writing challenges to amass Tuition Cash!
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 pt-3 border-t border-slate-800">
              <span>Manage English Academy</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* GROUP 2: WHEN TO AVOID THE PASSIVE VOICE (DEDICATED SECTION)   */}
        {/* ============================================================== */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider block mb-0.5">
                Core Curriculum · Group 2
              </span>
              <h2 className="text-xl font-bold text-white font-display">
                When to Avoid the Passive Voice: 7 Critical Principles
              </h2>
            </div>
            <button
              onClick={() => onSelectGame('codex')}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600/30 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Open Strategy Codex
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {WHEN_TO_AVOID_RULES.map(rule => (
              <div
                key={rule.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                    {rule.icon}
                  </div>
                  <div className="flex-1">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border inline-block mb-1 ${rule.badgeColor}`}>
                      {rule.tag}
                    </span>
                    <h4 className="text-xs font-bold text-white leading-snug font-display">
                      {rule.question}
                    </h4>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pl-11">
                  {rule.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
