import React, { useState } from 'react';
import { 
  BookOpen, 
  Crosshair, 
  Trophy, 
  Building2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  CheckCircle2, 
  Zap, 
  Target 
} from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchGame: (mode: 'zombie' | 'tycoon' | 'codex') => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  onLaunchGame
}) => {
  const [slide, setSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'Welcome to Active Voice Arcade!',
      subtitle: 'Master the 3 Core Teaching Strategies to Eliminate Passive Voice',
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            Welcome, cadet! In English writing, weak passive constructions (like <code className="text-red-400 font-mono">"The car was driven by Leo"</code>) drag down momentum, hide who did the action, and bore readers.
          </p>
          <div className="grid grid-cols-3 gap-3 text-left">
            <div className="p-3 rounded-xl bg-slate-950 border border-blue-500/30">
              <span className="font-bold text-blue-400 block mb-1">1. "Who Did It?" Rule</span>
              <p className="text-[11px] text-slate-400 leading-snug">
                Always find the real actor and move them upfront to the driver's seat of the sentence.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30">
              <span className="font-bold text-emerald-400 block mb-1">2. Verb Replacement</span>
              <p className="text-[11px] text-slate-400 leading-snug">
                Hunt weak "to be" auxiliary verbs + past participles and swap them for punchy dynamic verbs.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30">
              <span className="font-bold text-amber-400 block mb-1">3. Context Comparison</span>
              <p className="text-[11px] text-slate-400 leading-snug">
                Read passive vs active versions aloud to feel the speed, clarity, and word savings!
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Game 1: Zombie Gunner (10-Wave Survival & Bosses)',
      subtitle: '10 Waves · Bosses at 5, 7, 10 · Scrambled Answers · Total Victory',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3">
            <Crosshair className="w-8 h-8 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-1">Survivor Mechanics & Tactical Drops</span>
              <p className="text-[11px] text-slate-300 leading-snug">
                Move with <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px]">WASD</kbd>, aim with mouse, and shoot in a dark, atmospheric city with your flashlight.
              </p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <span className="text-xl">📦</span>
            <div>
              <span className="font-bold text-amber-400 block mb-0.5">Scrambled Crate Decryption & Bosses</span>
              <p className="text-[11px] text-slate-400">
                Zombies drop glowing crates with randomly scrambled answer choices! Slay the Passive Golem at Wave 5, the Bureaucratic Abomination at Wave 7, and conquer Wave 10's Arch-Titan for Total Victory!
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Game 2: Classroom Tycoon Builder',
      subtitle: 'Build Your Academy, Expand Studios & Consult Students',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
            <Building2 className="w-8 h-8 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-1">Classroom Management</span>
              <p className="text-[11px] text-slate-300 leading-snug">
                Build student modern desks, install Google Interactive Smartboards, set up action verb bookshelves, and hire grammar professors!
              </p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <span className="text-xl">🎓</span>
            <div>
              <span className="font-bold text-emerald-400 block mb-0.5">Solve Student Essay Dilemmas</span>
              <p className="text-[11px] text-slate-400">
                Click thought bubbles over students to review their writing. Helping them spot actors and swap weak verbs awards major Tuition Cash and Active Fame Stars!
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-sm font-display">
              Academy Training Guide & Tutorial
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Slide Body */}
        <div className="p-6">
          <div className="mb-4">
            <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider block mb-1">
              Step {slide + 1} of {slides.length}
            </span>
            <h4 className="text-lg font-bold text-white font-display">
              {slides[slide].title}
            </h4>
            <p className="text-xs text-slate-400">
              {slides[slide].subtitle}
            </p>
          </div>

          <div className="min-h-[190px]">
            {slides[slide].content}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            disabled={slide === 0}
            onClick={() => setSlide(prev => Math.max(0, prev - 1))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              slide === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Previous
          </button>

          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  slide === i ? 'w-5 bg-blue-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          {slide < slides.length - 1 ? (
            <button
              onClick={() => setSlide(prev => Math.min(slides.length - 1, prev + 1))}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              Let's Play! <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
