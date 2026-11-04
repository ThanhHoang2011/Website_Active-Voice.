import React, { useState } from 'react';
import { User, Sparkles, Check, Shield, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/sound';

interface NameEntryModalProps {
  isOpen: boolean;
  initialName?: string;
  isFirstArrival?: boolean;
  onConfirm: (name: string) => void;
  onClose?: () => void;
}

const CALLSIGN_SUGGESTIONS = [
  'Agent Active',
  'Verb Striker',
  'Grammar Knight',
  'Actor Detective',
  'Clarity Ghost',
  'Dynamic Wordsmith',
  'Passive Slayer'
];

export const NameEntryModal: React.FC<NameEntryModalProps> = ({
  isOpen,
  initialName = '',
  isFirstArrival = false,
  onConfirm,
  onClose
}) => {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      setError('Please enter a name with at least 2 characters.');
      return;
    }
    if (trimmed.length > 20) {
      setError('Name must be 20 characters or fewer.');
      return;
    }

    sounds.playUpgrade();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    onConfirm(trimmed);
  };

  const handlePickSuggestion = (suggestion: string) => {
    setName(suggestion);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-blue-950/60 to-slate-900 border-b border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-lg">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-blue-600/30 text-blue-400 font-bold border border-blue-500/40">
                {isFirstArrival ? 'First Arrival Induction' : 'Player Profile'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white font-display">
              {isFirstArrival ? 'Welcome to Active Voice Arcade' : 'Change Player Name'}
            </h2>
            <p className="text-xs text-slate-400">
              {isFirstArrival
                ? 'Register your official academy call-sign to record scores & rank on global leaderboards.'
                : 'Update your display name for the community rankings.'}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
              Agent / Cadet Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter your name (e.g. Maverick, Wordsmith)"
                maxLength={20}
                autoFocus
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium tracking-wide"
              />
              <span className="absolute right-3 top-3 text-[11px] font-mono text-slate-500">
                {name.length}/20
              </span>
            </div>
            {error && (
              <p className="mt-1.5 text-xs text-rose-400 font-medium">
                {error}
              </p>
            )}
          </div>

          {/* Quick Suggestions */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
              Or pick an Academy call-sign:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CALLSIGN_SUGGESTIONS.map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => handlePickSuggestion(s)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition font-mono ${
                    name === s
                      ? 'bg-blue-600 text-white border-blue-400 font-bold'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            {!isFirstArrival && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition rounded-lg"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="w-full px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              {isFirstArrival ? 'Confirm & Enter Academy' : 'Save Name'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
