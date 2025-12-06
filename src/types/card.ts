export type CardType = "VOWEL" | "CONSONANT";

export interface KoreanCard {
  id: string;
  cardType: CardType;
  value: string; // "01", "02", "03", etc.
  point: number; // 2, 3, 4
}

export interface GameState {
  hand: KoreanCard[];
  centerCards: KoreanCard[];
  selectedCard: KoreanCard | null;
}

// 게임 시작 응답 타입
export interface GameStartResponse {
  userId: string;
  sessionId: string;
  desk: { cards: KoreanCard[] };
  deckCardsCount: number;
  hand: { cards: KoreanCard[] };
  totalScore: number;
  lastModifiedAt: string;
}
