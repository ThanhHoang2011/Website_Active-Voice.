import { StoryComparison } from '../types/grammar';

export const CONTEXT_STORIES: StoryComparison[] = [
  {
    id: 'heist',
    title: 'The Neon Alley Escape',
    genre: 'Cyberpunk Action / Heist',
    passiveVersion: `The rusty steel ladder was climbed hastily by Agent Kael as sirens were heard echoing through the drenched neon alley. A heavy laser bolt was fired by an unseen guard, and the brick chimney near his head was clipped with explosive force. The zip-line harness was secured by Kael with trembling fingers, and the leap was taken by him into the misty abyss. The rooftop below was reached successfully, but the encrypted memory drive was dropped by him into a puddle of oily sludge.`,
    activeVersion: `Agent Kael scrambled up the rusty steel ladder as sirens echoed through the drenched neon alley. An unseen guard fired a heavy laser bolt, shattering the brick chimney inches from Kael's ear. With trembling fingers, Kael snapped the zip-line harness shut and leaped into the misty abyss. He hit the rooftop below at a hard roll, but fumbled the encrypted memory drive directly into a puddle of oily sludge.`,
    passiveWordCount: 80,
    activeWordCount: 68,
    passiveWeakVerbs: ['was climbed by', 'were heard echoing', 'was fired by', 'was clipped', 'was secured by', 'was taken by', 'was reached', 'was dropped by'],
    activeStrongVerbs: ['scrambled', 'echoed', 'fired', 'shattering', 'snapped', 'leaped', 'hit', 'fumbled'],
    critique: 'Notice how the passive version drags: every action happens backwards ("the ladder was climbed by Kael"). The active version puts Kael in direct physical motion, cutting 12 sluggish words and boosting narrative momentum!'
  },
  {
    id: 'storm',
    title: 'The Ghost Ship at Midnight',
    genre: 'Maritime Suspense',
    passiveVersion: `The wooden helm was gripped tightly by Captain Sean while violent thirty-foot waves were thrown against the battered hull by the Atlantic storm. The main sail was ripped to shreds by howling gale winds, and distress flares were launched into the pitch-black sky by the first mate. A jagged coral reef was spotted ahead by the lookout, but no evasion could be executed by the crippled vessel.`,
    activeVersion: `Captain Sean gripped the wooden helm as thirty-foot waves slammed against the battered hull. Howling gale winds shredded the main sail, while the first mate fired distress flares into the pitch-black sky. The lookout spotted a jagged coral reef dead ahead, but the crippled vessel could not evade the rocks.`,
    passiveWordCount: 71,
    activeWordCount: 52,
    passiveWeakVerbs: ['was gripped tightly by', 'were thrown against', 'was ripped by', 'were launched by', 'was spotted by', 'could be executed by'],
    activeStrongVerbs: ['gripped', 'slammed', 'shredded', 'fired', 'spotted', 'could not evade'],
    critique: 'The active version saves 19 words (nearly 27% leaner!). In life-or-death suspense, strong verbs like "slammed" and "shredded" convey immediate danger, whereas "was ripped by" reads like an insurance claim report.'
  },
  {
    id: 'detective',
    title: 'The Midnight Manor Mystery',
    genre: 'Classic Detective Fiction',
    passiveVersion: `The library door was opened with caution by Inspector Holmes. The velvet curtains had been drawn closed by an unknown hand, and a faint smell of bitter almonds was detected by him in the chilly room. The mahogany writing desk was examined by Holmes, where a half-burned letter was discovered tucked beneath the bronze inkwell. The charred envelope was picked up by his magnifying glass, and a cryptic warning was read aloud.`,
    activeVersion: `Inspector Holmes pushed open the library door with caution. An unknown hand had drawn the velvet curtains, and Holmes detected a faint whiff of bitter almonds in the chilly air. He examined the mahogany writing desk, uncovering a half-burned letter tucked beneath the bronze inkwell. Holmes picked up the charred envelope with his magnifying glass and whispered the cryptic warning.`,
    passiveWordCount: 76,
    activeWordCount: 61,
    passiveWeakVerbs: ['was opened by', 'had been drawn closed by', 'was detected by', 'was examined by', 'was discovered', 'was picked up by', 'was read aloud'],
    activeStrongVerbs: ['pushed open', 'had drawn', 'detected', 'examined', 'uncovering', 'picked up', 'whispered'],
    critique: 'Passive voice separates the detective from his observations. In active voice, Holmes directly senses, touches, and reacts to the crime scene, making readers feel like they are standing beside him.'
  }
];
