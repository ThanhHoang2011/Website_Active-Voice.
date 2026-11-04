import React from 'react';
import { Award, CheckCircle2, Lock, X, Sparkles, Trophy } from 'lucide-react';
import { Achievement, getLevelFromXp } from '../utils/progression';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  totalXp: number;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
  totalXp
}) => {
  if (!isOpen) return null;

  const { level, title, currentLevelXp, nextLevelXp, progressPercent } = getLevelFromXp(totalXp);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                Digital Badges & Achievements
                <span className="text-xs font-mono font-medium text-amber-400">
                  {unlockedCount}/{achievements.length} Unlocked
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Level {level}: {title} · {totalXp} Total XP Earned
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level XP Progress Bar Banner */}
        <div className="px-6 py-3 bg-gradient-to-r from-blue-950/60 to-purple-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 flex-1 mr-6">
            <span className="font-bold text-blue-400 font-mono">LVL {level}</span>
            <div className="flex-1 h-2.5 bg-slate-850 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono text-slate-400 tabular-nums">
              {currentLevelXp} / {nextLevelXp} XP
            </span>
          </div>
          <span className="text-[11px] text-indigo-300 font-medium whitespace-nowrap">
            Title: {title}
          </span>
        </div>

        {/* Badges Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-2 gap-3.5">
          {achievements.map(badge => (
            <div
              key={badge.id}
              className={`p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                badge.unlocked
                  ? 'bg-slate-950/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-60'
              }`}
            >
              {/* Badge Icon / Plaque */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                  badge.unlocked
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-inner'
                    : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
              >
                {badge.icon}
              </div>

              {/* Badge Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h4 className="font-bold text-xs text-white truncate font-display">
                    {badge.title}
                  </h4>
                  {badge.unlocked ? (
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      UNLOCKED
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-0.5 shrink-0">
                      <Lock className="w-3 h-3 text-slate-600" />
                      LOCKED
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 leading-snug mb-2">
                  {badge.description}
                </p>

                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${badge.unlocked ? 'bg-amber-400' : 'bg-slate-600'}`}
                      style={{
                        width: `${Math.min(100, Math.floor((badge.progress / badge.maxProgress) * 100))}%`
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                    {badge.progress}/{badge.maxProgress}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Badges automatically unlock and persist in your browser profile.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
