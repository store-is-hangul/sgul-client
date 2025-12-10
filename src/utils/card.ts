import { KoreanCard } from "@/types/card";

// Helper function to generate card SVG path
export const getCardImagePath = (card: KoreanCard): string => {
  const type = card.cardType.toLowerCase();
  return `/assets/cards/${type}_${card.value}_${card.point}.svg`;
};

// Generate all cards based on available SVG files
const generateAllCards = (): KoreanCard[] => {
  const cards: KoreanCard[] = [];

  // Consonants: 01-15, points: 2,3,4
  for (let i = 1; i <= 15; i++) {
    const value = i.toString().padStart(2, "0");
    for (const point of [2, 3, 4]) {
      cards.push({
        id: `consonant_${value}_${point}`,
        cardType: "CONSONANT",
        value,
        point,
      });
    }
  }

  // Vowels: 01-10, points: 2,3,4
  for (let i = 1; i <= 10; i++) {
    const value = i.toString().padStart(2, "0");
    for (const point of [2, 3, 4]) {
      cards.push({
        id: `vowel_${value}_${point}`,
        cardType: "VOWEL",
        value,
        point,
      });
    }
  }

  return cards;
};

// 전체 카드 풀 (총 75장: 자음 45장 + 모음 30장)
export const ALL_CARDS: KoreanCard[] = generateAllCards();

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
