import React, { useState } from 'react';
import { 
  BookOpen, 
  Target, 
  Zap, 
  Layers, 
  Volume2, 
  ArrowRight, 
  Check, 
  Sparkles,
  HelpCircle,
  Clock,
  Flame,
  MessageSquare,
  FileText
} from 'lucide-react';
import { CONTEXT_STORIES } from '../data/contextStories';
import { sounds } from '../utils/sound';

export const StrategyCodex: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'strategy1' | 'strategy2' | 'strategy3' | 'faq'>('strategy1');
  const [selectedStoryId, setSelectedStoryId] = useState('heist');
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  // Strategy 1 Interactive Playground: Who Did It?
  const [currentActorSentence, setCurrentActorSentence] = useState(0);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [actorSuccess, setActorSuccess] = useState<boolean | null>(null);

  const actorSentences = [
    {
      tokens: ['The', 'treasure', 'chest', 'was', 'discovered', 'by', 'the', 'young', 'archaeologist', 'deep', 'inside', 'the', 'cave.'],
      actorIndices: [6, 7, 8], // "the young archaeologist"
      activeVersion: 'The young archaeologist discovered the treasure chest deep inside the cave.',
      explanation: 'The archaeologist is the actor performing the discovery! In active voice, placing them first makes the sentence direct.'
    },
    {
      tokens: ['A', 'speeding', 'ticket', 'was', 'issued', 'to', 'the', 'driver', 'by', 'Officer', 'Chen.'],
      actorIndices: [9, 10], // "Officer Chen"
      activeVersion: 'Officer Chen issued a speeding ticket to the driver.',
      explanation: 'Officer Chen is the authority taking action. Moving her upfront establishes clear legal responsibility.'
    },
    {
      tokens: ['The', 'championship-winning', 'goal', 'was', 'scored', 'by', 'Elena', 'in', 'the', 'final', 'second.'],
      actorIndices: [6], // "Elena"
      activeVersion: 'Elena scored the championship-winning goal in the final second.',
      explanation: 'Elena is the heroine! Putting her at the start creates high-energy sports storytelling.'
    }
  ];

  // Strategy 2 Interactive Playground: Verb Replacement
  const [weakVerbSentences, setWeakVerbSentences] = useState([
    {
      id: 1,
      passive: 'The ancient wooden bridge was destroyed by the violent floodwaters.',
      weakPhrase: 'was destroyed by',
      strongVerbs: ['obliterated', 'washed away', 'demolished', 'crushed'],
      chosenStrong: '',
      isReplaced: false
    },
    {
      id: 2,
      passive: 'A thorough investigation was conducted by the federal agents.',
      weakPhrase: 'was conducted by',
      strongVerbs: ['investigated', 'probed', 'audited', 'uncovered'],
      chosenStrong: '',
      isReplaced: false
    },
    {
      id: 3,
      passive: 'A stern warning was given to the trespassers by the park ranger.',
      weakPhrase: 'was given to ... by',
      strongVerbs: ['warned', 'cautioned', 'reprimanded', 'confronted'],
      chosenStrong: '',
      isReplaced: false
    }
  ]);

  const handleActorClick = (tokenIdx: number) => {
    setSelectedWordIndex(tokenIdx);
    const curr = actorSentences[currentActorSentence];
    if (curr.actorIndices.includes(tokenIdx)) {
      setActorSuccess(true);
      sounds.playCorrect();
    } else {
      setActorSuccess(false);
      sounds.playWrong();
    }
  };

  const handleSwapVerb = (sentenceId: number, dynamicVerb: string) => {
    sounds.playUpgrade();
    setWeakVerbSentences(prev => prev.map(s => {
      if (s.id === sentenceId) {
        return { ...s, chosenStrong: dynamicVerb, isReplaced: true };
      }
      return s;
    }));
  };

  // Text-to-speech for context comparison reading aloud
  const handleReadAloud = (text: string) => {
    if ('speechSynthesis' in window) {
      if (speakingText === text) {
        window.speechSynthesis.cancel();
        setSpeakingText(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setSpeakingText(null);
      utterance.onerror = () => setSpeakingText(null);
      setSpeakingText(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const selectedStory = CONTEXT_STORIES.find(s => s.id === selectedStoryId) || CONTEXT_STORIES[0];

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Top Header & Navigation Segmented Controls */}
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Active Voice Masterclass Codex
          </h2>
          <span className="text-xs text-slate-400">
            Interactive training methods to eliminate weak passive phrasing and boost writing clarity
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('strategy1')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'strategy1' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            1. "Who Did It?" Rule
          </button>

          <button
            onClick={() => setActiveTab('strategy2')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'strategy2' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            2. Verb Replacement
          </button>

          <button
            onClick={() => setActiveTab('strategy3')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'strategy3' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            3. Context Comparison
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'faq' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Why & When Guide
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* ============================================================== */}
        {/* STRATEGY 1: THE "WHO DID IT?" RULE */}
        {/* ============================================================== */}
        {activeTab === 'strategy1' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-5 rounded-2xl bg-blue-950/30 border border-blue-500/30">
              <span className="text-xs text-blue-400 font-bold uppercase tracking-wider block mb-1">
                Teaching Strategy 1
              </span>
              <h3 className="text-xl font-bold text-white mb-2 font-display">
                The "Who Did It?" Rule: Train Students to Lead with the Actor
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                In passive voice, the true performer of the action is often tucked at the end of the sentence behind the preposition <span className="text-amber-400 font-mono">"by"</span>—or omitted completely ("agentless passive"). To fix unclear phrasing, teach students to identify the actor and move them directly to the front.
              </p>

              {/* Anatomy Diagram */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-900 border border-red-500/30 text-slate-300">
                  <span className="text-red-400 font-bold block mb-1 uppercase text-[10px]">❌ Passive (Backwards)</span>
                  <p className="mb-2">"The vault <span className="text-red-300 underline">was cracked by</span> <span className="text-blue-300 font-bold">Detective Vance</span>."</p>
                  <span className="text-slate-500 text-[11px] font-sans block">Receiver first, actor trapped at the back.</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-slate-300">
                  <span className="text-emerald-400 font-bold block mb-1 uppercase text-[10px]">✅ Active (Direct & Clear)</span>
                  <p className="mb-2">"<span className="text-blue-300 font-bold">Detective Vance</span> <span className="text-emerald-300 underline">cracked</span> the vault."</p>
                  <span className="text-slate-500 text-[11px] font-sans block">Actor leads, verb drives action forward!</span>
                </div>
              </div>
            </div>

            {/* Interactive "Find the Actor" Simulator */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Interactive Exercise: Tap the "Actor" (The Performer of the Action)
                </h4>
                <div className="flex gap-2">
                  {actorSentences.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentActorSentence(i);
                        setSelectedWordIndex(null);
                        setActorSuccess(null);
                      }}
                      className={`px-2.5 py-1 text-xs rounded-md transition cursor-pointer ${
                        currentActorSentence === i ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Sentence {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Token sentence */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-4 flex flex-wrap gap-2 items-center min-h-[70px]">
                {actorSentences[currentActorSentence].tokens.map((token, idx) => {
                  const isSelected = selectedWordIndex === idx;
                  const isActorToken = actorSentences[currentActorSentence].actorIndices.includes(idx);
                  let style = 'bg-slate-900 border-slate-700 text-slate-200 hover:border-blue-400 hover:bg-slate-850';

                  if (isSelected) {
                    style = isActorToken
                      ? 'bg-emerald-600 border-emerald-400 text-white font-bold ring-2 ring-emerald-400/50'
                      : 'bg-red-600 border-red-400 text-white font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleActorClick(idx)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs transition cursor-pointer select-none font-mono ${style}`}
                    >
                      {token}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Block */}
              {actorSuccess !== null && (
                <div className={`p-4 rounded-xl text-xs leading-relaxed animate-fadeIn ${
                  actorSuccess ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200' : 'bg-red-950/40 border border-red-500/40 text-red-200'
                }`}>
                  <div className="font-bold mb-1">
                    {actorSuccess ? '✓ Excellent! You identified the actor!' : '✗ Not the actor! Try finding who actually performed the deed.'}
                  </div>
                  <p className="mb-2">{actorSentences[currentActorSentence].explanation}</p>
                  <div className="pt-2 border-t border-slate-800/60 font-semibold text-white">
                    🎯 Active Transformation: "{actorSentences[currentActorSentence].activeVersion}"
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STRATEGY 2: VERB REPLACEMENT TRAINING */}
        {/* ============================================================== */}
        {activeTab === 'strategy2' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                Teaching Strategy 2
              </span>
              <h3 className="text-xl font-bold text-white mb-2 font-display">
                Verb Replacement: Hunt "To Be" Verbs & Swap for Dynamic Action
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Passive sentences almost always lean on weak auxiliary "to be" verbs: <code className="text-emerald-400 font-mono">is, was, were, are, has been</code> followed by a past participle (<code className="text-amber-400 font-mono">-ed / -en</code>). These compound phrases bloat sentences and dilute momentum. Teach students to replace the entire phrase with a single, vigorous action verb.
              </p>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Weak Compound Phrase</span>
                  <p className="text-red-400 font-mono line-through">"was destroyed by"</p>
                  <span className="text-emerald-400 font-mono font-bold mt-1 block">→ demolished</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Weak Compound Phrase</span>
                  <p className="text-red-400 font-mono line-through">"was given a fine by"</p>
                  <span className="text-emerald-400 font-mono font-bold mt-1 block">→ fined</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Weak Compound Phrase</span>
                  <p className="text-red-400 font-mono line-through">"a decision was made by"</p>
                  <span className="text-emerald-400 font-mono font-bold mt-1 block">→ decided</span>
                </div>
              </div>
            </div>

            {/* Interactive Dynamic Verb Swapper */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Interactive Workshop: Click a Strong Verb to Revitalize the Sentence
              </h4>

              <div className="space-y-4">
                {weakVerbSentences.map(item => (
                  <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-xs font-mono text-slate-300 mb-2">
                      <span className="text-slate-500 uppercase text-[10px] block">Passive Sentence:</span>
                      "{item.passive}"
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mt-3">
                      <span className="text-[11px] text-slate-400">Swap <code className="text-red-400">"{item.weakPhrase}"</code> with:</span>
                      {item.strongVerbs.map((v, i) => (
                        <button
                          key={i}
                          onClick={() => handleSwapVerb(item.id, v)}
                          className={`px-3 py-1 text-xs rounded-lg font-mono font-medium border transition cursor-pointer ${
                            item.chosenStrong === v
                              ? 'bg-emerald-600 border-emerald-400 text-white shadow-sm'
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-emerald-400 hover:text-white'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>

                    {item.isReplaced && (
                      <div className="mt-3 pt-2 border-t border-slate-800 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Revitalized with dynamic verb: <strong className="text-white">"{item.chosenStrong}"</strong> cuts fluff and increases dramatic tension!</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STRATEGY 3: CONTEXT COMPARISON READING */}
        {/* ============================================================== */}
        {activeTab === 'strategy3' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block mb-1">
                    Teaching Strategy 3
                  </span>
                  <h3 className="text-xl font-bold text-white font-display">
                    Context Comparison: Read Both Aloud & Feel the Difference
                  </h3>
                </div>

                {/* Story selector */}
                <div className="flex gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
                  {CONTEXT_STORIES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStoryId(s.id)}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition cursor-pointer ${
                        selectedStoryId === s.id ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Students rarely realize how sluggish passive voice is until they read it aloud back-to-back with active voice. Notice how the passive version drags like an administrative police report, while the active version accelerates with cinematic velocity.
              </p>

              {/* Side-by-Side Story Comparison */}
              <div className="grid grid-cols-2 gap-4">
                {/* Passive Column */}
                <div className="p-4 rounded-xl bg-slate-900 border border-red-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                      <span className="text-xs font-bold text-red-400">Passive Voice Version (Drab & Bloated)</span>
                      <button
                        onClick={() => handleReadAloud(selectedStory.passiveVersion)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                        title="Read Aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed italic mb-4">
                      "{selectedStory.passiveVersion}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                    <span>Word Count: <strong className="text-red-400">{selectedStory.passiveWordCount}</strong> words</span>
                    <span className="text-red-400">Pace: Sluggish 🐢</span>
                  </div>
                </div>

                {/* Active Column */}
                <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                      <span className="text-xs font-bold text-emerald-400">Active Voice Version (Lean & Punchy)</span>
                      <button
                        onClick={() => handleReadAloud(selectedStory.activeVersion)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                        title="Read Aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-medium mb-4">
                      "{selectedStory.activeVersion}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                    <span>Word Count: <strong className="text-emerald-400">{selectedStory.activeWordCount}</strong> words</span>
                    <span className="text-emerald-400">
                      Saved {selectedStory.passiveWordCount - selectedStory.activeWordCount} words ⚡
                    </span>
                  </div>
                </div>
              </div>

              {/* Literary Analysis Box */}
              <div className="mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-white block mb-1">Teacher's Critical Analysis:</span>
                <p>{selectedStory.critique}</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* WHY & WHEN REFERENCE GUIDE */}
        {/* ============================================================== */}
        {activeTab === 'faq' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                Why can the passive voice make sentences unclear? When is active voice clearer?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Passive voice often drops the actor entirely ("agentless passive"), leading to mysterious sentences like <code className="text-amber-400 font-mono">"The report was deleted"</code> or <code className="text-amber-400 font-mono">"Rules were broken."</code> Readers cannot tell who performed the action. Active voice makes the actor crystal clear: <code className="text-emerald-400 font-mono">"The intern deleted the report."</code>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                How can the passive voice make sentences longer or more complicated?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Passive voice requires multiple grammatical crutches: a form of the auxiliary verb "to be" (is/was/were/has been), a past participle, and the prepositional phrase "by [actor]". In contrast, active voice links subject directly to action, trimming 20–35% of needless word fluff across essays and books.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-amber-400" />
                Why is the active voice more engaging in stories or persuasive writing?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Active verbs create immediate visceral impact. When a hero kicks, sprints, or uncovers a secret, readers experience the action in real time. Passive voice forces the reader's brain to process the receiver first, then the helper verb, and finally backtrack to the actor—slowing the pulse of the narrative.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-rose-400" />
                Does the passive voice sound unnatural in informal situations like conversations?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Yes! Everyday speech is naturally active. If a friend says, "A great meal was cooked by me for us," they sound like a Victorian contract lawyer. Saying "I made us a great meal!" sounds human, warm, and authentic.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                When do you need to be clear about who did the action?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                In aviation, medicine, law, engineering, and news reporting, knowing WHO took an action is literally a matter of life, safety, and accountability. E.g., "The valve was opened" is dangerous; "Technician Ramos opened the valve" creates an audit trail and prevents disaster.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
