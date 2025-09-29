import type { GameData } from './types';

export const GAME_DATA: GameData = {
  START: {
    title: 'The Whispering Scroll',
    text: 'You stand before a weathered pedestal in a forgotten temple. A single, ancient scroll rests upon it, humming with a faint energy.\n\nWhat do you do?',
    choices: [
      { text: 'Reach for the scroll', nextScene: 'SCROLL_CHALLENGE' },
    ],
  },
  SCROLL_CHALLENGE: {
    title: 'The First Seal',
    text: 'As your fingers touch the scroll, it remains tightly shut. A single, glowing character appears on its silken tie. To unravel the secrets within, you must prove your worth by writing it.',
    characterChallenge: {
      character: '水',
      pinyin: 'shuǐ',
      meaning: 'Water',
      onSuccess: 'SCROLL_OPEN',
      onFail: 'SCROLL_CHALLENGE'
    },
  },
  SCROLL_OPEN: {
    // FIX: Escaped the apostrophe in "River's" to prevent a syntax error. Although the error was reported on the next line, it was caused by this unclosed string literal.
    title: 'A River\'s Guidance',
    text: 'With the character correctly drawn, the knot unties itself. The scroll opens to reveal a map of a shimmering river. The path leads to a sturdy bridge, but the character to cross it has faded. You must restore it.',
    choices: [{ text: 'Approach the bridge', nextScene: 'BRIDGE_CHALLENGE' }],
  },
  BRIDGE_CHALLENGE: {
    title: 'The Bridge of Stability',
    text: 'At the foot of the bridge, a stone tablet awaits. The inscription is faint, but you can make out the shape of the required character. Writing it will solidify the bridge, allowing safe passage.',
    characterChallenge: {
      character: '木',
      pinyin: 'mù',
      meaning: 'Wood',
      onSuccess: 'FOREST_PATH',
      onFail: 'BRIDGE_CHALLENGE'
    },
  },
  FOREST_PATH: {
    title: 'The Sunlit Grove',
    text: 'You cross the sturdy wooden bridge and enter a tranquil forest. Sunlight streams through the canopy, illuminating a path forward. In a clearing, you find a small shrine with another puzzle.',
    choices: [{ text: 'Examine the shrine', nextScene: 'SHRINE_CHALLENGE' }],
  },
  SHRINE_CHALLENGE: {
    title: 'The Shrine of Fire',
    text: 'The shrine is dedicated to an ancient spirit of fire. To receive its blessing and continue your journey, you must draw the character for fire, igniting the ceremonial lanterns.',
    characterChallenge: {
      character: '火',
      pinyin: 'huǒ',
      meaning: 'Fire',
      onSuccess: 'JOURNEY_END',
      onFail: 'SHRINE_CHALLENGE'
    }
  },
  JOURNEY_END: {
    title: 'Mastery Achieved',
    text: 'As you complete the final character, the lanterns blaze to life, and the forest path transforms into a staircase of pure light. You have proven your understanding and skill.\n\nYour journey as a character master has only just begun.',
    isEnd: true,
  }
};
