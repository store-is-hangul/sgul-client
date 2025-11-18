export type CardType = "consonant" | "vowel";

export interface KoreanCard {
  id: string;
  character: string;
  type: CardType;
  romanization: string; // 로마자 표기 (참고용)
}

export interface GameState {
  hand: KoreanCard[];
  centerCards: KoreanCard[];
  selectedCard: KoreanCard | null;
}

// 한글 자음
export const CONSONANTS: KoreanCard[] = [
  { id: "ㄱ", character: "ㄱ", type: "consonant", romanization: "g/k" },
  { id: "ㄴ", character: "ㄴ", type: "consonant", romanization: "n" },
  { id: "ㄷ", character: "ㄷ", type: "consonant", romanization: "d/t" },
  { id: "ㄹ", character: "ㄹ", type: "consonant", romanization: "r/l" },
  { id: "ㅁ", character: "ㅁ", type: "consonant", romanization: "m" },
  { id: "ㅂ", character: "ㅂ", type: "consonant", romanization: "b/p" },
  { id: "ㅅ", character: "ㅅ", type: "consonant", romanization: "s" },
  { id: "ㅇ", character: "ㅇ", type: "consonant", romanization: "ng" },
  { id: "ㅈ", character: "ㅈ", type: "consonant", romanization: "j" },
  { id: "ㅊ", character: "ㅊ", type: "consonant", romanization: "ch" },
  { id: "ㅋ", character: "ㅋ", type: "consonant", romanization: "k" },
  { id: "ㅌ", character: "ㅌ", type: "consonant", romanization: "t" },
  { id: "ㅍ", character: "ㅍ", type: "consonant", romanization: "p" },
  { id: "ㅎ", character: "ㅎ", type: "consonant", romanization: "h" },
];

// 한글 모음
export const VOWELS: KoreanCard[] = [
  { id: "ㅏ", character: "ㅏ", type: "vowel", romanization: "a" },
  { id: "ㅑ", character: "ㅑ", type: "vowel", romanization: "ya" },
  { id: "ㅓ", character: "ㅓ", type: "vowel", romanization: "eo" },
  { id: "ㅕ", character: "ㅕ", type: "vowel", romanization: "yeo" },
  { id: "ㅗ", character: "ㅗ", type: "vowel", romanization: "o" },
  { id: "ㅛ", character: "ㅛ", type: "vowel", romanization: "yo" },
  { id: "ㅜ", character: "ㅜ", type: "vowel", romanization: "u" },
  { id: "ㅠ", character: "ㅠ", type: "vowel", romanization: "yu" },
  { id: "ㅡ", character: "ㅡ", type: "vowel", romanization: "eu" },
  { id: "ㅣ", character: "ㅣ", type: "vowel", romanization: "i" },
];

// 전체 카드 풀
export const ALL_CARDS: KoreanCard[] = [...CONSONANTS, ...VOWELS];

// 게임 유틸리티 함수들
export const shuffleCards = (cards: KoreanCard[]): KoreanCard[] => {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getRandomHand = (count: number = 8): KoreanCard[] => {
  const shuffled = shuffleCards(ALL_CARDS);
  return shuffled.slice(0, count);
};
