import { GrammarQuestion } from '../types/grammar';

export const GRAMMAR_QUESTIONS: GrammarQuestion[] = [
  // ==========================================
  // STRATEGY 1: THE "WHO DID IT?" RULE
  // ==========================================
  {
    id: 'q1',
    category: 'who_did_it',
    categoryLabel: 'The "Who Did It?" Rule',
    question: 'Identify the real ACTOR in this sentence: "The secret vault was cracked by Detective Vance late last night."',
    contextSentence: 'The secret vault was cracked by Detective Vance late last night.',
    options: [
      'Detective Vance (the person performing the action)',
      'The secret vault (the object being opened)',
      'Late last night (the time indicator)',
      'The cracking action itself'
    ],
    correctIndex: 0,
    explanation: 'Detective Vance is the actor! In passive voice, the actor is tucked away after "by". To make it active and punchy, place Vance at the beginning: "Detective Vance cracked the secret vault late last night."',
    tip: 'Find the person or thing doing the verb, then move them right to the driver\'s seat at the front of the sentence.',
    ruleStrategy: 'who_did_it'
  },
  {
    id: 'q2',
    category: 'who_did_it',
    categoryLabel: 'The "Who Did It?" Rule',
    question: 'Why does this sentence hide the actor? "Mistakes were made during the system launch."',
    contextSentence: 'Mistakes were made during the system launch.',
    options: [
      'It omits who made the mistakes, dodging accountability and creating confusion',
      'It has too many strong dynamic action verbs',
      'It puts the actor at the very start of the clause',
      'It makes the sentence too short and punchy'
    ],
    correctIndex: 0,
    explanation: 'Passive sentences often hide the actor completely ("agentless passive"). The reader is left asking: Who made the mistakes? The engineering team? The director? Active voice forces clarity: "The engineers made mistakes during the system launch."',
    tip: 'When you want accountability and precision, name the actor first.',
    ruleStrategy: 'who_did_it'
  },
  {
    id: 'q3',
    category: 'who_did_it',
    categoryLabel: 'The "Who Did It?" Rule',
    question: 'Rewrite this sentence into active voice using the "Who Did It?" rule: "The championship trophy was lifted high by Captain Leo."',
    contextSentence: 'The championship trophy was lifted high by Captain Leo.',
    options: [
      'Captain Leo lifted the championship trophy high.',
      'The trophy was lifted by Captain Leo high in the air.',
      'High in the air was where the championship trophy was lifted.',
      'Being lifted by Captain Leo, the trophy shone.'
    ],
    correctIndex: 0,
    explanation: 'Placing the actor (Captain Leo) first immediately turns the passive verb ("was lifted by") into direct action ("lifted"). Notice how much more natural and energetic it sounds!',
    tip: 'Actor + Action Verb + Direct Object = Pure Active Power.',
    ruleStrategy: 'who_did_it'
  },
  {
    id: 'q4',
    category: 'who_did_it',
    categoryLabel: 'The "Who Did It?" Rule',
    question: 'In a medical emergency report, why is active voice crucial? "The antidote was administered immediately."',
    contextSentence: 'The antidote was administered immediately.',
    options: [
      'Because doctors and nurses need to know WHO administered it to prevent fatal double-dosing',
      'Because passive voice is always grammatically incorrect',
      'Because medical reports must always be at least 15 words per sentence',
      'Because the medicine itself is the conscious actor'
    ],
    correctIndex: 0,
    explanation: 'In high-stakes situations (medicine, aviation, legal contracts), ambiguity is dangerous. Knowing WHO took action ("Nurse Rivera administered the antidote") prevents errors and establishes clear accountability.',
    tip: 'Whenever responsibility matters, never let passive voice hide the doer.',
    ruleStrategy: 'who_did_it'
  },

  // ==========================================
  // STRATEGY 2: VERB REPLACEMENT TRAINING
  // ==========================================
  {
    id: 'q5',
    category: 'verb_replacement',
    categoryLabel: 'Verb Replacement Training',
    question: 'Hunt the weak "to be" verb + participle: "The coastal village was destroyed by the hurricane."',
    contextSentence: 'The coastal village was destroyed by the hurricane.',
    options: [
      '"was destroyed" (weak "to be" helper + past participle)',
      '"coastal village" (adjective + noun)',
      '"by the hurricane" (prepositional phrase)',
      'There is no "to be" verb in this sentence'
    ],
    correctIndex: 0,
    explanation: '"was destroyed" relies on the weak auxiliary "was" paired with the participle "destroyed". Swapping it for active voice creates a dynamic sentence: "The hurricane decimated the coastal village."',
    tip: 'Watch out for "is", "was", "were", "are", and "has been" teamed with a past participle (-ed/-en).',
    ruleStrategy: 'verb_replacement'
  },
  {
    id: 'q6',
    category: 'verb_replacement',
    categoryLabel: 'Verb Replacement Training',
    question: 'Which single, dynamic verb best replaces the sluggish phrase "was given an explanation by"?',
    contextSentence: 'The student was given an explanation by the tutor.',
    options: [
      'explained (e.g., "The tutor explained the formula to the student")',
      'was explaining by',
      'had been explained',
      'was getting explained'
    ],
    correctIndex: 0,
    explanation: 'Instead of five sluggish words ("was given an explanation by"), the single active verb "explained" cuts fluff and invigorates the sentence.',
    tip: 'Swap multi-word bureaucratic verb phrases for direct action verbs.',
    ruleStrategy: 'verb_replacement'
  },
  {
    id: 'q7',
    category: 'verb_replacement',
    categoryLabel: 'Verb Replacement Training',
    question: 'Transform this wordy passive sentence into a dynamic active sentence: "A decision was arrived at by the council."',
    contextSentence: 'A decision was arrived at by the council.',
    options: [
      'The council decided.',
      'A decision had been made by the council members.',
      'Arrival of a decision was achieved by the council.',
      'The council was in the process of arriving.'
    ],
    correctIndex: 0,
    explanation: 'From 8 bloated words down to 3 crisp words: "The council decided." Weak "to be" verbs inflate word count without adding meaning.',
    tip: 'Eliminate dummy nouns like "decision" when a strong verb like "decided" exists.',
    ruleStrategy: 'verb_replacement'
  },
  {
    id: 'q8',
    category: 'verb_replacement',
    categoryLabel: 'Verb Replacement Training',
    question: 'Which active verb replacement makes this sentence most cinematic? "The glass window was broken by the baseball."',
    contextSentence: 'The glass window was broken by the baseball.',
    options: [
      'shattered (e.g., "The baseball shattered the window")',
      'was caused to break',
      'became broken by',
      'was suffered to break'
    ],
    correctIndex: 0,
    explanation: '"The baseball shattered the window" is punchy, vivid, and lets the reader hear the glass breaking. "Was broken by" drains the visual energy.',
    tip: 'Choose strong sensory action verbs (shattered, pounced, devoured, ignited) over generic ones.',
    ruleStrategy: 'verb_replacement'
  },

  // ==========================================
  // CONCEPT: SENTENCE BLOAT & COMPLEXITY
  // ==========================================
  {
    id: 'q9',
    category: 'sentence_bloat',
    categoryLabel: 'Sentence Bloat & Wordiness',
    question: 'How does passive voice artificially inflate sentence length and complexity?',
    options: [
      'It requires auxiliary "to be" verbs, past participles, and "by" prepositional phrases',
      'It removes vowels from English words',
      'It forces sentences to only use compound adjectives',
      'It prevents writers from using commas'
    ],
    correctIndex: 0,
    explanation: 'Compare: "The ball was thrown by Maya" (6 words) vs "Maya threw the ball" (4 words). In a 10-page essay or book, this passive bloat adds thousands of needless filler words!',
    tip: 'Trim the fat: cut auxiliary "was/were" and the backward "by [actor]" trail.',
    ruleStrategy: 'verb_replacement'
  },
  {
    id: 'q10',
    category: 'sentence_bloat',
    categoryLabel: 'Sentence Bloat & Wordiness',
    question: 'Which of the following is the leanest, clearest active revision of this bloated memo sentence: "It has been recommended by the safety committee that goggles be worn by all lab assistants."',
    contextSentence: 'It has been recommended by the safety committee that goggles be worn by all lab assistants.',
    options: [
      'The safety committee recommends that all lab assistants wear goggles.',
      'A recommendation regarding goggles was delivered to lab assistants by the safety committee.',
      'Wearing of goggles has been made a recommendation by safety committee staff.',
      'It was decided by the committee that goggles will be required.'
    ],
    correctIndex: 0,
    explanation: 'The original has 18 bureaucratic words with double-passive layers ("has been recommended by", "be worn by"). The active revision is 10 words: direct, authoritative, and crystal clear.',
    tip: 'Double passives make sentences nearly unreadable. Root them out!',
    ruleStrategy: 'who_did_it'
  },

  // ==========================================
  // CONCEPT: NARRATIVE PUNCH & PERSUASION
  // ==========================================
  {
    id: 'q11',
    category: 'narrative_punch',
    categoryLabel: 'Narrative Punch & Storytelling',
    question: 'Why do fiction authors and speechwriters overwhelmingly prefer active voice during exciting scenes?',
    options: [
      'Active voice moves at high velocity, mirroring real-time action and emotion',
      'Passive voice is forbidden by law in published literature',
      'Active voice allows the writer to use fewer characters in the plot',
      'Passive voice makes characters seem too heroic'
    ],
    correctIndex: 0,
    explanation: 'Active voice creates forward kinetic momentum. When "The dragon lunged at Aria," readers react instantly. When "Aria was lunged at by the dragon," the psychological impact lags behind the grammar.',
    tip: 'In thrillers, horror, action, and climax moments, active verbs keep the reader\'s pulse racing.',
    ruleStrategy: 'context_comparison'
  },
  {
    id: 'q12',
    category: 'narrative_punch',
    categoryLabel: 'Narrative Punch & Storytelling',
    question: 'Compare these two story openings. Which one hooks the reader immediately?',
    options: [
      '"Siren blares pierced the midnight fog as Detective Cross kicked down the alley door."',
      '"The midnight fog was pierced by sirens while the alley door was being kicked down by Detective Cross."'
    ],
    correctIndex: 0,
    explanation: 'The first sentence places the immediate sensory sound ("siren blares") and the decisive hero ("Detective Cross kicked") in active motion. The second stumbles through passive participle sludge.',
    tip: 'Hook readers with subject-first action, not passive observations.',
    ruleStrategy: 'context_comparison'
  },

  // ==========================================
  // CONCEPT: INFORMAL & CONVERSATIONAL NATURALNESS
  // ==========================================
  {
    id: 'q13',
    category: 'informal_dialogue',
    categoryLabel: 'Natural Conversation vs. Stiff Passive',
    question: 'Why does passive voice sound stiff or robotic in casual conversation? E.g., "A delicious pizza was baked by me for us."',
    options: [
      'Because everyday human speech naturally defaults to the speaker performing actions ("I baked us pizza!")',
      'Because pizza cannot be placed in the grammatical subject position',
      'Because informal conversations must never contain past tense verbs',
      'Because listeners cannot comprehend words that end in "-ed"'
    ],
    correctIndex: 0,
    explanation: 'Nobody says "A compliment was paid to you by me." Normal human speech is actor-driven and authentic: "I baked a delicious pizza for us!" Passive voice sounds like a court deposition or a malfunctioning robot.',
    tip: 'If it sounds weird said aloud to a friend, rewrite it in active voice.',
    ruleStrategy: 'who_did_it'
  },
  {
    id: 'q14',
    category: 'informal_dialogue',
    categoryLabel: 'Natural Conversation vs. Stiff Passive',
    question: 'Which response sounds most natural in everyday workplace messaging (e.g. Slack/chat)?',
    options: [
      '"I fixed the login bug this morning."',
      '"The login bug was resolved by me this morning."',
      '"A resolution of the bug was arrived at by my efforts."',
      '"The bug was made to be nonexistent through my coding."'
    ],
    correctIndex: 0,
    explanation: '"I fixed the login bug" is concise, confident, and natural. Passive phrasing sounds evasive or needlessly pompous in team collaboration.',
    tip: 'Clarity and speed triumph in modern communication.',
    ruleStrategy: 'who_did_it'
  },

  // ==========================================
  // CONCEPT: READER FATIGUE & MENTAL OVERHEAD
  // ==========================================
  {
    id: 'q15',
    category: 'clarity_actor',
    categoryLabel: 'Reader Comprehension & Clarity',
    question: 'Why does excessive passive voice tire out readers\' brains?',
    options: [
      'The brain must mentally reverse the sentence to figure out who did what to whom',
      'Passive voice causes readers\' eye muscles to strain physically',
      'Passive voice only uses words of four syllables or longer',
      'Passive sentences require reading from right to left'
    ],
    correctIndex: 0,
    explanation: 'Cognitive research shows that humans naturally process cause-and-effect as [Actor -> Action -> Target]. Passive voice forces the brain to buffer the target, decode the helper verb, and backtrack to find the actor.',
    tip: 'Spare your reader the mental gymnastics—give them the actor upfront.',
    ruleStrategy: 'context_comparison'
  },
  {
    id: 'q16',
    category: 'clarity_actor',
    categoryLabel: 'Reader Comprehension & Clarity',
    question: 'In which sentence is the ACTIVE voice definitely clearer and less ambiguous?',
    options: [
      '"The city mayor approved the new bike lanes."',
      '"The new bike lanes were approved in the city yesterday."',
      '"It was seen to that bike lanes were put into approval."',
      '"Approval of bike lanes was brought about."'
    ],
    correctIndex: 0,
    explanation: 'Sentence A specifies exactly WHO authorized the lanes (the mayor). Sentences B, C, and D hide the actor, leaving citizens wondering if the council, voters, or mayor was responsible.',
    tip: 'Democracy and news reporting require active clarity: who approved it?',
    ruleStrategy: 'who_did_it'
  }
];

export const WEAPON_UPGRADES: { [tier: number]: { name: string; desc: string; fireRate: number; damage: number; bulletCount: number; color: string } } = {
  1: { name: 'Direct Pistol', desc: 'Standard semi-automatic with clear active precision.', fireRate: 2.2, damage: 25, bulletCount: 1, color: '#60A5FA' },
  2: { name: 'Dynamic SMG', desc: 'Rapid-firing dynamic verb accelerator.', fireRate: 4.8, damage: 32, bulletCount: 1, color: '#34D399' },
  3: { name: 'Actor Tri-Shot', desc: 'Triple spread projectiles targeting all passive zombies.', fireRate: 3.5, damage: 38, bulletCount: 3, color: '#FBBF24' },
  4: { name: 'Decisive Plasma Blaster', desc: 'High-energy piercing plasma that vaporizes wordy hordes.', fireRate: 4.2, damage: 55, bulletCount: 2, color: '#F43F5E' },
  5: { name: 'Quantum Railgun', desc: 'Unstoppable hyper-velocity active beam cutting through all ranks.', fireRate: 3.0, damage: 120, bulletCount: 3, color: '#A855F7' }
};

/**
 * Returns a copy of the grammar question with shuffled/scrambled options
 * and an accurately updated correctIndex.
 */
export function getScrambledQuestion(q: GrammarQuestion): GrammarQuestion {
  const correctAnswer = q.options[q.correctIndex];
  const shuffledOptions = [...q.options];
  for (let i = shuffledOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffledOptions[i];
    shuffledOptions[i] = shuffledOptions[j];
    shuffledOptions[j] = temp;
  }
  const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
  return {
    ...q,
    options: shuffledOptions,
    correctIndex: newCorrectIndex
  };
}

