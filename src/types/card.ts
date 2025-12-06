export type CardType = "VOWEL" | "CONSONANT";

/**
 * 한글 카드 타입
 */
export interface KoreanCard {
  id: string;
  cardType: CardType;
  value: string; // "01", "02", "03", etc.
  point: number; // 2, 3, 4
}

/**
 * 게임 상태 타잭
 */
export interface GameState {
  hand: KoreanCard[];
  centerCards: KoreanCard[];
  selectedCard: KoreanCard | null;
}

/**
 * 게임 시작 응답 타입
 */
export interface GameStartResponse {
  userId: string;
  sessionId: string;
  desk: { cards: KoreanCard[] };
  deckCardsCount: number;
  hand: { cards: KoreanCard[] };
  totalScore: number;
  lastModifiedAt: string;
}

/**
 * 데스크 액션 타입
 */
export type DeskActionType = "PUT" | "REMOVE";

/**
 * 데스크 요청 타입
 */
export interface DeskRequest {
  type: DeskActionType;
  cardId: string;
}

/**
 * 데스크 응답 타입
 */
export interface DeskResponse {
  userId: string;
  sessionId: string;
  desk: { cards: KoreanCard[] };
  deckCardsCount: number;
  hand: { cards: KoreanCard[] };
  totalScore: number;
  lastModifiedAt: string;
}

/**
 * 덱 카드 드로우 응답 타입
 */
export interface DrawDeckResponse {
  userId: string;
  sessionId: string;
  desk: { cards: KoreanCard[] };
  deckCardsCount: number;
  hand: { cards: KoreanCard[] };
  totalScore: number;
  lastModifiedAt: string;
}
