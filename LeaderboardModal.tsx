import React, { useState } from 'react';
import { 
  Trophy, 
  X, 
  Search, 
  Award, 
  Sparkles, 
  Save, 
  Check, 
  RotateCcw, 
  UserCheck, 
  Globe2 
} from 'lucide-react';
import { 
  PlayerProgression, 
  getGlobalLeaderboard, 
  saveProgression 
} from '../utils/progression';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  progression: PlayerProgression;
  onUpdateProgression: (updated: PlayerProgression) => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  progression,
  onUpdateProgression
}) => {
  const [filter, setFilter] = useState<'all' | 'top5'>('all');
  const [editingName, setEditingName] = useState(false);
  const [customName, setCustomName] = useState(progression.playerName);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const leaderboard = getGlobalLeaderboard(progression);
  const filtered = filter === 'top5' ? leaderboard.slice(0, 5) : leaderboard;
  const playerRankEntry = leaderboard.find(e => e.isCurrentPlayer);

  const handleSaveName = () => {
    const trimmed = customName.trim() || 'Player (You)';
    const updated = {
      ...progression,
      playerName: trimmed
    };
    onUpdateProgression(updated);
    saveProgression(updated);
    setEditingName(false);
  };

  const handleManualSave = () => {
    saveProgression(progression);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                Active Voice Global Leaderboard
                <span className="text-xs font-mono font-medium text-amber-400">
                  Global XP Rankings
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Compete with students worldwide by mastering active voice challenges
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

        {/* Current Player Standout Card */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold font-mono text-sm shadow">
              #{playerRankEntry?.rank || 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                {editingName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      maxLength={20}
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      className="px-2 py-0.5 rounded bg-slate-950 border border-blue-500 text-xs font-bold text-white focus:outline-none"
                    />
                    <button
                      onClick={handleSaveName}
                      className="px-2 py-0.5 rounded bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <span 
                    onClick={() => setEditingName(true)}
                    className="font-bold text-white text-xs flex items-center gap-1.5 cursor-pointer hover:text-blue-300"
                    title="Click to change your display name"
                  >
                    {progression.playerName}
                    <span className="text-[10px] text-blue-400 font-mono">(Edit)</span>
                  </span>
                )}
                <span className="text-[10px] text-slate-400 font-mono">· Level {playerRankEntry?.level} {playerRankEntry?.title}</span>
              </div>
              <span className="text-[11px] text-blue-300 font-mono">
                {progression.xp} XP · {progression.achievements.filter(a => a.unlocked).length} Badges · Last Saved: {progression.lastSavedAt}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSave}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Progress Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-slate-400" />
                  <span>Save Progress</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono text-[11px]">
            Showing {filtered.length} active students
          </span>
          <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Ranks
            </button>
            <button
              onClick={() => setFilter('top5')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                filter === 'top5' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Top 5 Podium
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="p-6 overflow-y-auto space-y-2">
          {filtered.map(entry => {
            const isPodium = entry.rank <= 3;
            const rankIcon = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`;

            return (
              <div
                key={entry.rank}
                className={`p-3 rounded-xl border transition flex items-center justify-between ${
                  entry.isCurrentPlayer
                    ? 'bg-blue-950/50 border-blue-500/60 shadow-md ring-1 ring-blue-500/30'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isPodium ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {rankIcon}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-xs ${entry.isCurrentPlayer ? 'text-blue-300' : 'text-white'}`}>
                        {entry.name}
                      </span>
                      {entry.isCurrentPlayer && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white font-mono text-[9px] font-bold">
                          YOU
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono">[{entry.country}]</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Level {entry.level} · {entry.title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">BADGES</span>
                    <span className="font-mono text-xs text-amber-400 font-bold">{entry.badges} 🏅</span>
                  </div>
                  <div className="w-24">
                    <span className="text-[10px] text-slate-500 block font-mono">TOTAL XP</span>
                    <span className="font-mono text-sm text-emerald-400 font-bold tabular-nums">
                      {entry.xp.toLocaleString()} XP
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Earn XP across all 3 games to climb the global leaderboard rankings!</span>
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
