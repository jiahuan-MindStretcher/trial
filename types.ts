
export interface Choice {
  text: string;
  nextScene: string;
}

export interface CharacterChallenge {
  character: string;
  pinyin: string;
  meaning: string;
  onSuccess: string;
  onFail?: string; 
}

export interface Scene {
  title: string;
  text: string;
  choices?: Choice[];
  characterChallenge?: CharacterChallenge;
  isEnd?: boolean;
}

export interface GameData {
  [key: string]: Scene;
}

export interface EvaluationResult {
  score: number;
  feedback: string;
  isCorrect: boolean;
}
