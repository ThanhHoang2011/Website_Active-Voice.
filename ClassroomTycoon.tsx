import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  DollarSign, 
  Sparkles, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Tv, 
  Coffee, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  ArrowRight,
  Award,
  Volume2,
  VolumeX,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/sound';
import { GRAMMAR_QUESTIONS, getScrambledQuestion } from '../../data/grammarQuestions';
import { GrammarQuestion } from '../../types/grammar';

interface ClassroomTycoonProps {
  onMasteryScore?: (points: number) => void;
  onFundsEarned?: (amount: number) => void;
  onStudentHelped?: () => void;
}

interface ClassroomUpgrade {
  id: string;
  name: string;
  category: 'furniture' | 'tech' | 'staff' | 'room';
  level: number;
  maxLevel: number;
  baseCost: number;
  incomePerSec: number;
  desc: string;
  icon: React.ReactNode;
}

interface StudentInClass {
  id: number;
  name: string;
  avatarColor: string;
  deskIndex: number;
  hasDilemma: boolean;
  questionIndex: number;
}

const STUDENT_NAMES = [
  'Maya', 'Leo', 'Sophia', 'Ethan', 'Zoe', 'Lucas', 'Aria', 'Liam', 'Chloe', 'Noah'
];

const STUDENT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'
];

export const ClassroomTycoon: React.FC<ClassroomTycoonProps> = ({ 
  onMasteryScore,
  onFundsEarned,
  onStudentHelped 
}) => {
  // Economy State (USER REQUEST: money come slower)
  const [cash, setCash] = useState(100);
  const [fame, setFame] = useState(10);
  const [passiveIncome, setPassiveIncome] = useState(2);
  const [isMuted, setIsMuted] = useState(sounds.isMuted());

  // Upgrades (USER REQUEST: money comes slower)
  const [upgrades, setUpgrades] = useState<ClassroomUpgrade[]>([
    {
      id: 'desks',
      name: 'Modern Student Desks',
      category: 'furniture',
      level: 2,
      maxLevel: 8,
      baseCost: 120,
      incomePerSec: 1,
      desc: 'Adds desk seating for aspiring grammar students. (+1$/sec)',
      icon: <Users className="w-5 h-5 text-blue-400" />
    },
    {
      id: 'smartboard',
      name: 'Google Interactive Smartboard',
      category: 'tech',
      level: 1,
      maxLevel: 5,
      baseCost: 280,
      incomePerSec: 3,
      desc: 'Displays the "Who Did It?" rule in glowing high-definition. (+3$/sec)',
      icon: <Tv className="w-5 h-5 text-emerald-400" />
    },
    {
      id: 'bookshelf',
      name: 'Action Verb Library Shelf',
      category: 'furniture',
      level: 1,
      maxLevel: 5,
      baseCost: 200,
      incomePerSec: 2,
      desc: 'Filled with dynamic action thesauruses that replace weak "to be" verbs. (+2$/sec)',
      icon: <BookOpen className="w-5 h-5 text-amber-400" />
    },
    {
      id: 'espresso',
      name: 'Teacher Espresso Station',
      category: 'furniture',
      level: 0,
      maxLevel: 4,
      baseCost: 450,
      incomePerSec: 5,
      desc: 'Caffeine power keeps teachers grading active voice essays. (+5$/sec)',
      icon: <Coffee className="w-5 h-5 text-rose-400" />
    },
    {
      id: 'professor',
      name: 'Lead Grammar Professor',
      category: 'staff',
      level: 0,
      maxLevel: 3,
      baseCost: 800,
      incomePerSec: 10,
      desc: 'A master grammarian who trains students in concise active storytelling. (+10$/sec)',
      icon: <GraduationCap className="w-5 h-5 text-purple-400" />
    },
    {
      id: 'hall',
      name: 'Academy Expansion Wing',
      category: 'room',
      level: 1,
      maxLevel: 3,
      baseCost: 1500,
      incomePerSec: 18,
      desc: 'Expands the classroom to an architectural lecture hall for large cohorts. (+18$/sec)',
      icon: <Building2 className="w-5 h-5 text-sky-400" />
    }
  ]);

  // Active student assistance modal
  const [activeConsultation, setActiveConsultation] = useState<{
    student: StudentInClass;
    question: GrammarQuestion;
  } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  // Classroom visual students
  const [students, setStudents] = useState<StudentInClass[]>([
    { id: 1, name: 'Maya', avatarColor: '#3B82F6', deskIndex: 0, hasDilemma: true, questionIndex: 0 },
    { id: 2, name: 'Leo', avatarColor: '#10B981', deskIndex: 1, hasDilemma: false, questionIndex: 1 },
    { id: 3, name: 'Aria', avatarColor: '#F59E0B', deskIndex: 2, hasDilemma: false, questionIndex: 2 }
  ]);

  // Recalculate passive income based on upgrades (USER REQUEST: money come slower)
  useEffect(() => {
    let total = 1; // slower base income
    upgrades.forEach(u => {
      total += u.level * u.incomePerSec;
    });
    setPassiveIncome(total);
  }, [upgrades]);

  // Passive Income Ticker (every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCash(prev => prev + passiveIncome);
    }, 1000);
    return () => clearInterval(timer);
  }, [passiveIncome]);

  // Random Student Dilemma Ticker (USER REQUEST: student answer slower, every 14 seconds)
  useEffect(() => {
    const dilemmaTimer = setInterval(() => {
      setStudents(prev => {
        const next = [...prev];
        const deskCount = upgrades.find(u => u.id === 'desks')?.level || 2;

        // Ensure student count matches desk level
        while (next.length < deskCount) {
          const newId = next.length + 1;
          next.push({
            id: newId,
            name: STUDENT_NAMES[newId % STUDENT_NAMES.length],
            avatarColor: STUDENT_COLORS[newId % STUDENT_COLORS.length],
            deskIndex: next.length,
            hasDilemma: false,
            questionIndex: Math.floor(Math.random() * GRAMMAR_QUESTIONS.length)
          });
        }

        // Randomly set a dilemma on a student who doesn't have one
        const idleStudents = next.filter(s => !s.hasDilemma);
        if (idleStudents.length > 0) {
          const chosen = idleStudents[Math.floor(Math.random() * idleStudents.length)];
          chosen.hasDilemma = true;
          chosen.questionIndex = Math.floor(Math.random() * GRAMMAR_QUESTIONS.length);
        }
        return next;
      });
    }, 14000);

    return () => clearInterval(dilemmaTimer);
  }, [upgrades]);

  // Sound toggle
  const handleToggleSound = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  // Buy Upgrade
  const buyUpgrade = (upgradeId: string) => {
    const u = upgrades.find(item => item.id === upgradeId);
    if (!u) return;

    const currentCost = Math.floor(u.baseCost * Math.pow(1.4, u.level));
    if (cash < currentCost || u.level >= u.maxLevel) return;

    setCash(prev => prev - currentCost);
    sounds.playCoin();

    setUpgrades(prev => prev.map(item => {
      if (item.id === upgradeId) {
        return { ...item, level: item.level + 1 };
      }
      return item;
    }));

    setFame(prev => prev + 15);
    onMasteryScore?.(100);

    confetti({
      particleCount: 30,
      spread: 40,
      origin: { y: 0.7 }
    });
  };

  // Open consultation with student
  const openConsultation = (student: StudentInClass) => {
    const rawQ = GRAMMAR_QUESTIONS[student.questionIndex % GRAMMAR_QUESTIONS.length];
    const scrambledQ = getScrambledQuestion(rawQ);
    setActiveConsultation({
      student,
      question: scrambledQ
    });
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
  };

  // Submit Answer to student dilemma (USER REQUEST: student answer slower, money come slower)
  const handleAnswerConsultation = (optionIndex: number) => {
    if (answerSubmitted || !activeConsultation) return;
    setSelectedAnswer(optionIndex);
    setAnswerSubmitted(true);

    const isCorrect = optionIndex === activeConsultation.question.correctIndex;
    if (isCorrect) {
      sounds.playCorrect();
      sounds.playCoin();

      const rewardCash = 45 + Math.floor(fame * 0.7);
      const rewardFame = 15;

      setCash(prev => prev + rewardCash);
      setFame(prev => prev + rewardFame);
      onMasteryScore?.(rewardCash);
      onFundsEarned?.(rewardCash);
      onStudentHelped?.();

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 }
      });

      // Clear student's dilemma
      setStudents(prev => prev.map(s => {
        if (s.id === activeConsultation.student.id) {
          return { ...s, hasDilemma: false };
        }
        return s;
      }));
    } else {
      sounds.playWrong();
    }
  };

  const closeConsultation = () => {
    setActiveConsultation(null);
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
  };

  const deskLevel = upgrades.find(u => u.id === 'desks')?.level || 2;
  const smartboardLevel = upgrades.find(u => u.id === 'smartboard')?.level || 1;
  const bookshelfLevel = upgrades.find(u => u.id === 'bookshelf')?.level || 1;
  const espressoLevel = upgrades.find(u => u.id === 'espresso')?.level || 0;
  const professorLevel = upgrades.find(u => u.id === 'professor')?.level || 0;

  return (
    <div className="relative w-full h-[640px] rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* Top HUD Bar */}
      <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">ACADEMY FUNDS:</span>
            <span className="font-mono text-base font-black text-emerald-400 flex items-center tabular-nums">
              <DollarSign className="w-4 h-4 text-emerald-500 -mr-1" />
              {cash.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">TUITION REVENUE:</span>
            <span className="font-mono text-sm font-bold text-amber-400 tabular-nums">
              +${passiveIncome}/sec
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">GRAMMAR FAME:</span>
            <span className="font-mono text-sm font-bold text-blue-400 flex items-center gap-1 tabular-nums">
              <Award className="w-3.5 h-3.5 text-blue-400" />
              {fame} ⭐
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSound}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Split Body: Classroom Visual (Left) + Upgrades Shop (Right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left 60%: Interactive Isometric Classroom Simulation */}
        <div className="flex-[3] relative bg-[#0B132B] p-6 flex flex-col justify-between overflow-hidden border-r border-slate-800/80">
          {/* Floor Grid Texture */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Front Wall: Interactive Google Smartboard */}
          <div className="relative z-10 w-full max-w-xl mx-auto rounded-xl bg-slate-900 border-2 border-slate-700 p-4 shadow-xl mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2 font-display">
                  ACTIVE VOICE SMARTBOARD
                  <span className="text-[10px] text-emerald-400 font-mono font-normal">Tier {smartboardLevel} Online</span>
                </h4>
                <p className="text-[11px] text-slate-300">
                  {smartboardLevel >= 2 
                    ? 'Rule #1: "Find the Actor, Place Them Upfront!" · Multiplier 1.5x active'
                    : 'Displaying basic grammar guidelines. Upgrade for tuition multiplier!'}
                </p>
              </div>
            </div>

            {professorLevel > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs">
                <GraduationCap className="w-4 h-4 text-purple-400" />
                <span className="font-semibold">Prof. Actor Presiding</span>
              </div>
            )}
          </div>

          {/* Classroom Furniture & Student Desks Grid */}
          <div className="relative z-10 flex-1 grid grid-cols-4 gap-4 items-center justify-center p-2">
            {Array.from({ length: 8 }).map((_, idx) => {
              const isDeskUnlocked = idx < deskLevel;
              const student = students.find(s => s.deskIndex === idx);

              return (
                <div
                  key={idx}
                  className={`relative h-28 rounded-xl border flex flex-col items-center justify-center p-2 transition-all ${
                    isDeskUnlocked
                      ? 'bg-slate-900/90 border-slate-700 shadow-md'
                      : 'bg-slate-950/40 border-dashed border-slate-800 text-slate-600'
                  }`}
                >
                  {isDeskUnlocked ? (
                    student ? (
                      <div className="flex flex-col items-center relative">
                        {/* Student Question Bubble */}
                        {student.hasDilemma && (
                          <button
                            onClick={() => openConsultation(student)}
                            className="absolute -top-7 px-2 py-0.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] shadow-lg shadow-amber-500/30 flex items-center gap-1 animate-bounce cursor-pointer z-20 whitespace-nowrap"
                          >
                            <Sparkles className="w-3 h-3" />
                            Help: Fix Passive Voice!
                          </button>
                        )}

                        {/* Student Avatar */}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md border-2 border-white/20 mb-1"
                          style={{ backgroundColor: student.avatarColor }}
                        >
                          {student.name.charAt(0)}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-300">{student.name}</span>
                        <span className="text-[9px] text-slate-500">Writing Draft</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Users className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                        <span className="text-[10px] text-slate-500">Empty Desk</span>
                      </div>
                    )
                  ) : (
                    <div className="text-center">
                      <Plus className="w-5 h-5 text-slate-700 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-600">Locked Desk</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Perimeter Features: Bookshelf, Espresso Lounge, Podium */}
          <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Library Tier {bookshelfLevel} (Active Thesauruses)</span>
            </div>

            {espressoLevel > 0 && (
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-rose-400" />
                <span>Espresso Bar Level {espressoLevel}</span>
              </div>
            )}

            <div className="text-[11px] text-slate-500 font-mono">
              Click student bubbles above to earn Tuition Cash!
            </div>
          </div>
        </div>

        {/* Right 40%: Upgrades Shop & Hiring Desk */}
        <div className="flex-[2] bg-slate-900/95 p-5 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-sm font-display flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                Academy Upgrades Catalog
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Expand Your Studio</span>
            </div>

            <div className="space-y-3">
              {upgrades.map(u => {
                const currentCost = Math.floor(u.baseCost * Math.pow(1.4, u.level));
                const canAfford = cash >= currentCost && u.level < u.maxLevel;
                const isMax = u.level >= u.maxLevel;

                return (
                  <div
                    key={u.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                      {u.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-200 truncate">{u.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Lvl {u.level}/{u.maxLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight my-1">{u.desc}</p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60">
                        <span className="text-[11px] font-mono text-emerald-400 font-bold">
                          {isMax ? 'MAX LEVEL' : `$${currentCost.toLocaleString()}`}
                        </span>

                        {!isMax && (
                          <button
                            onClick={() => buyUpgrade(u.id)}
                            disabled={!canAfford}
                            className={`px-3 py-1 rounded-md text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer ${
                              canAfford
                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            Upgrade <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* STUDENT CONSULTATION / QUESTION MODAL */}
      {activeConsultation && (
        <div className="absolute inset-0 z-40 bg-slate-950/92 backdrop-blur-md flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: activeConsultation.student.avatarColor }}
                >
                  {activeConsultation.student.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {activeConsultation.student.name}'s Essay Consultation
                  </h3>
                  <span className="text-[10px] text-blue-400 font-mono">
                    Reward: +${180 + fame * 2} Tuition · +20 Fame ⭐
                  </span>
                </div>
              </div>
              <span className="text-xs text-amber-400 font-mono">{activeConsultation.question.categoryLabel}</span>
            </div>

            {activeConsultation.question.contextSentence && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 mb-4 text-xs font-mono text-slate-300">
                <span className="text-slate-500 text-[10px] block mb-1 uppercase tracking-wider">Student's Draft Sentence</span>
                "{activeConsultation.question.contextSentence}"
              </div>
            )}

            <p className="text-sm font-medium text-slate-100 mb-4 leading-snug">
              {activeConsultation.question.question}
            </p>

            <div className="space-y-2.5 mb-5">
              {activeConsultation.question.options.map((opt, idx) => {
                let btnStyle = 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800';
                if (answerSubmitted) {
                  if (idx === activeConsultation.question.correctIndex) {
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
                    onClick={() => handleAnswerConsultation(idx)}
                    className={`w-full p-3 text-left rounded-xl border text-xs transition flex items-start gap-3 cursor-pointer ${btnStyle}`}
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] shrink-0 font-mono mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {answerSubmitted && idx === activeConsultation.question.correctIndex && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {answerSubmitted && idx === selectedAnswer && idx !== activeConsultation.question.correctIndex && (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {answerSubmitted && (
              <div className="space-y-4 pt-3 border-t border-slate-800">
                <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                  selectedAnswer === activeConsultation.question.correctIndex
                    ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-200'
                    : 'bg-red-950/40 border border-red-800/60 text-red-200'
                }`}>
                  <span className="font-bold block mb-1">
                    {selectedAnswer === activeConsultation.question.correctIndex
                      ? '✓ Superb Advice! Student revision successful!'
                      : '✗ Needs Revision. Grammar coaching note:'}
                  </span>
                  <p className="mb-1">{activeConsultation.question.explanation}</p>
                  <p className="text-[11px] text-slate-400 italic">Tip: {activeConsultation.question.tip}</p>
                </div>

                <button
                  onClick={closeConsultation}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  Return to Classroom <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
