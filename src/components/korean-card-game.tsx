"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KoreanCard } from "./korean-card";
import { KoreanCard as KoreanCardType, GameStartResponse } from "@/types/card";
import {
  useSocket,
  useStompSubscription,
  useStompPublish,
} from "@/hooks/use-socket";
import { SocketStatus } from "./socket-status";

type CenterCard = KoreanCardType & { originalIndex: number };

interface KoreanCardGameProps {
  gameId: string;
}

export const KoreanCardGame = ({ gameId }: KoreanCardGameProps) => {
  const { isConnected } = useSocket();
  const { publish } = useStompPublish();
  const [hand, setHand] = useState<KoreanCardType[]>([]);
  const [centerCards, setCenterCards] = useState<CenterCard[]>([]);
  const [desk, setDesk] = useState<KoreanCardType[]>([]);
  const [deckCardsCount, setDeckCardsCount] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [sessionId, setSessionId] = useState<string>("");
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);

  // 게임 상태 응답 구독 (/user/queue/game)
  useStompSubscription<GameStartResponse>("/user/queue/game", data => {
    console.log("[Game] 📦 Received game state:", {
      userId: data.userId,
      sessionId: data.sessionId,
      handCount: data.hand?.cards?.length,
      deskCount: data.desk?.cards?.length,
      deckCardsCount: data.deckCardsCount,
      totalScore: data.totalScore,
      fullData: data,
    });

    // 안전하게 배열 체크
    if (!data) {
      console.error("[Game] ❌ Received null/undefined data");
      return;
    }

    if (!Array.isArray(data.hand.cards)) {
      console.error("[Game] ❌ hand is not an array:", data.hand);
      setHand([]);
    } else {
      setHand(data.hand.cards);
    }

    if (!Array.isArray(data.desk.cards)) {
      console.error("[Game] ❌ desk is not an array:", data.desk);
      setDesk([]);
    } else {
      setDesk(data.desk.cards);
    }

    setDeckCardsCount(data.deckCardsCount || 0);
    setTotalScore(data.totalScore || 0);
    setSessionId(data.sessionId || "");
    setIsGameStarted(true);

    console.log("[Game] ✅ Game state updated successfully");
  });

  // 게임 시작 요청
  useEffect(() => {
    console.log("[Game] useEffect triggered:", {
      isConnected,
      isGameStarted,
      shouldRequest: isConnected && !isGameStarted,
    });

    if (isConnected && !isGameStarted) {
      console.log("[Game] 🎮 Requesting game start...");
      // 빈 본문 명시적으로 전달
      const success = publish("/app/game/start", {});
      console.log("[Game] Publish result:", success);
    }
  }, [isConnected, isGameStarted, publish]);

  const handleCardClick = (card: KoreanCardType, cardIndex: number) => {
    // 손패에서 카드 제거
    setHand(prev => prev.filter(c => c.id !== card.id));
    // 중앙에 카드 추가 (카드 인덱스 정보도 함께 저장)
    const centerCard: CenterCard = { ...card, originalIndex: cardIndex };
    setCenterCards(prev => [...prev, centerCard]);

    // TODO: 서버에 카드 플레이 요청 (API 명세 추가 시 구현)
    if (isConnected) {
      console.log("[Game] Card played:", card);
    }
  };

  const handleResetGame = () => {
    // 게임 재시작 요청
    setIsGameStarted(false);
    setCenterCards([]);
    if (isConnected) {
      publish("/app/game/start");
      console.log("[Game] Game restart requested");
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col">
      {/* 소켓 상태 표시 */}
      <div className="fixed top-4 right-4 z-50">
        <SocketStatus />
      </div>

      {/* 게임 정보 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          한글 카드 게임
        </h1>
        <div className="flex justify-center gap-6 text-sm text-gray-600">
          <p>게임 ID: {gameId}</p>
          {sessionId && <p>세션 ID: {sessionId}</p>}
          <p>남은 카드: {deckCardsCount}장</p>
          <p>총점: {totalScore}점</p>
        </div>
      </div>

      {/* 중앙 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center mb-8 gap-8">
        {/* Desk 카드들 (서버에서 받은 공개 카드) */}
        {Array.isArray(desk) && desk.length > 0 && (
          <div className="bg-white/20 rounded-xl p-4">
            <h3 className="text-center text-sm font-semibold text-gray-700 mb-3">
              공개된 카드 (Desk)
            </h3>
            <div className="flex gap-2 justify-center">
              {desk.map(card => (
                <div key={card.id} className="transform scale-75">
                  <KoreanCard card={card} isInCenter />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative">
          <div className="w-80 h-60 border-4 border-dashed border-gray-400 rounded-xl bg-white/50 flex items-center justify-center">
            <p className="text-gray-500 text-lg font-medium">
              카드를 여기에 내세요
            </p>
          </div>

          {/* 중앙에 놓인 카드들 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center justify-center">
              <AnimatePresence>
                {Array.isArray(centerCards) &&
                  centerCards.map((card, index) => {
                    // 카드가 원래 있던 위치 계산 (손패에서의 위치)
                    const originalIndex = card.originalIndex;
                    const handSize = 8; // 초기 손패 크기
                    const cardWidth = 76; // w-16 + gap-3 (64 + 12)
                    const startX =
                      (originalIndex - (handSize - 1) / 2) * cardWidth;

                    return (
                      <motion.div
                        key={card.id}
                        initial={{
                          opacity: 1,
                          x: startX, // 실제 카드가 있던 x 위치
                          y: 280, // 손패 위치에서 시작
                          rotate: 0,
                          scale: 1,
                        }}
                        animate={{
                          opacity: 1,
                          x: (index - centerCards.length / 2) * 12, // 중앙에서 살짝 퍼지게
                          y: 0,
                          rotate: 0, // 회전 없이 평평하게
                          scale: 1,
                          transition: {
                            duration: 0.8, // 더 느리게
                            ease: [0.25, 0.46, 0.45, 0.94],
                            y: {
                              type: "spring",
                              stiffness: 200, // 더 부드럽게
                              damping: 30,
                            },
                          },
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0,
                          transition: { duration: 0.4 },
                        }}
                        style={{
                          filter: "drop-shadow(2px 4px 8px rgba(0, 0, 0, 0.8))",
                        }}
                      >
                        <KoreanCard card={card} isInCenter />
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* 손패 (하단 카드들) */}
      <div className="flex justify-center">
        <div className="bg-white/30 rounded-2xl p-6 shadow-lg">
          <h3 className="text-center text-lg font-semibold text-gray-700 mb-4">
            내 카드 ({Array.isArray(hand) ? hand.length : 0}장)
          </h3>
          <div className="flex justify-center flex-wrap">
            <AnimatePresence>
              {Array.isArray(hand) &&
                hand.map((card, index) => (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{
                      opacity: 0,
                      scale: 0.8,
                      y: -100,
                      transition: { duration: 0.5 },
                    }}
                    whileHover={{ y: -10, zIndex: 10 }}
                    style={{
                      marginLeft: index === 0 ? 0 : "-2rem",
                      filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.6))",
                    }}
                    className="relative"
                  >
                    <KoreanCard
                      card={card}
                      onClick={() => handleCardClick(card, index)}
                    />
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 리셋 버튼 */}
      <div className="text-center mt-8">
        <button
          onClick={handleResetGame}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200"
        >
          게임 리셋
        </button>
      </div>
    </div>
  );
};
