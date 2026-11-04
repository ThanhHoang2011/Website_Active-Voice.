export type RuleCategory = 
  | 'who_did_it'          // The "Who Did It?" rule - finding the actor
  | 'verb_replacement'    // Hunt weak "to be" verbs + past participle -> dynamic action verbs
  | 'clarity_actor'       // Hidden actors creating confusion / lack of accountability
  | 'sentence_bloat'      // Unnecessary length and complexity
  | 'narrative_punch'     // Engaging stories & persuasive power
  | 'informal_dialogue';  // Natural conversation tone vs robotic passive

export interface GrammarQuestion {
  id: string;
  category: RuleCategory;
  categoryLabel: string;
  question: string;
  contextSentence?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  tip: string;
  ruleStrategy: 'who_did_it' | 'verb_replacement' | 'context_comparison';
}

export interface ZombieWeapon {
  id: string;
  name: string;
  tier: number;
  fireRate: number;     // shots per second
  damage: number;
  bulletSpeed: number;
  bulletCount: number;  // 1 = single, 3 = spread, etc.
  spreadAngle: number;
  color: string;
  desc: string;
}

export interface RacerBuff {
  id: 'nitro' | 'shield' | 'overtake' | 'traction';
  name: string;
  durationMs: number;
  icon: string;
  color: string;
  description: string;
}

export interface ClassroomItem {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  incomePerSec: number;
  fameBonus: number;
  description: string;
  category: 'furniture' | 'tech' | 'staff' | 'decor';
  icon: string;
  unlockedAtFame: number;
}

export interface StudentTask {
  id: string;
  studentName: string;
  avatarSeed: number;
  passiveDraft: string;
  question: string;
  options: string[];
  correctIndex: number;
  rewardMoney: number;
  rewardFame: number;
  explanation: string;
}

export interface StoryComparison {
  id: string;
  title: string;
  genre: string;
  passiveVersion: string;
  activeVersion: string;
  passiveWordCount: number;
  activeWordCount: number;
  passiveWeakVerbs: string[];
  activeStrongVerbs: string[];
  critique: string;
}
