"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KoreanCard } from "./korean-card";
import {
  KoreanCard as KoreanCardType,
  GameStartResponse,
  DeskRequest,
  DeskResponse,
} from "@/types/card";
import {
  useSocket,
  useStompSubscription,
  useStompPublish,
} from "@/hooks/use-socket";
import { SocketStatus } from "./socket-status";

interface KoreanCardGameProps {
  gameId: string;
}

export const KoreanCardGame = ({ gameId }: KoreanCardGameProps) => {
  const { isConnected } = useSocket();
  const { publish } = useStompPublish();
  const [hand, setHand] = useState<KoreanCardType[]>([]);
  const [desk, setDesk] = useState<KoreanCardType[]>([]);
  const [deckCardsCount, setDeckCardsCount] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [sessionId, setSessionId] = useState<string>("");
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);

  // 게임 상태 업데이트 헬퍼 함수
  const updateGameState = (data: DeskResponse) => {
    setHand(Array.isArray(data.hand?.cards) ? data.hand.cards : []);
    setDesk(Array.isArray(data.desk?.cards) ? data.desk.cards : []);
    setDeckCardsCount(data.deckCardsCount || 0);
    setTotalScore(data.totalScore || 0);
    setSessionId(data.sessionId || "");
  };

  // 게임 시작 응답 구독 (/user/queue/game)
  useStompSubscription<GameStartResponse>("/user/queue/game", data => {
    console.log("[RESPONSE] 게임 시작 응답 (초기 카드)", data);

    if (!data) {
      console.error("[Game] ❌ Received null/undefined data");
      return;
    }

    // GameStartResponse 형식: hand와 desk가 { cards: [] } 구조
    const handCards = Array.isArray(data.hand?.cards) ? data.hand.cards : [];
    const deskCards = Array.isArray(data.desk?.cards) ? data.desk.cards : [];

    setHand(handCards);
    setDesk(deskCards);
    setDeckCardsCount(data.deckCardsCount || 0);
    setTotalScore(data.totalScore || 0);
    setSessionId(data.sessionId || "");
    setIsGameStarted(true);

    console.log("[Game] ✅ Game started successfully");
  });

  // 데스크 액션 응답 구독 (/user/queue/desk)
  useStompSubscription<DeskResponse>("/user/queue/desk", data => {
    console.log("[RESPONSE] 데스크 액션 응답:", data);

    if (!data) {
      console.error("[Desk] ❌ Received null/undefined data");
      return;
    }

    updateGameState(data);
    console.log("[Desk] ✅ Desk state updated successfully");
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

  // 손패에서 카드를 데스크로 내기 (PUT)
  const handlePutCard = (card: KoreanCardType) => {
    if (!isConnected) {
      console.error("[Desk] ❌ Not connected to server");
      return;
    }

    console.log("[Desk] 🃏 Putting card to desk:", card);

    const request: DeskRequest = {
      type: "PUT",
      cardId: card.id,
    };

    console.log("[Desk] 🃏 Putting card to desk:", request);
    publish("/app/game/desk", request);
  };

  // 데스크에서 카드를 손패로 가져오기 (REMOVE)
  const handleRemoveCard = (card: KoreanCardType) => {
    if (!isConnected) {
      console.error("[Desk] ❌ Not connected to server");
      return;
    }

    const request: DeskRequest = {
      type: "REMOVE",
      cardId: card.id,
    };

    console.log("[Desk] 🃏 Removing card from desk:", request);
    publish("/app/game/desk", request);
  };

  const handleResetGame = () => {
    // 게임 재시작 요청
    setIsGameStarted(false);
    if (isConnected) {
      publish("/app/game/start", {});
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

      {/* 중앙 영역 - 데스크 */}
      <div className="flex-1 flex flex-col items-center justify-center mb-8">
        <div className="relative">
          <div className="min-w-80 min-h-60 border-4 border-dashed border-gray-400 rounded-xl bg-white/50 flex items-center justify-center p-4">
            {desk.length === 0 ? (
              <p className="text-gray-500 text-lg font-medium">
                카드를 여기에 내세요
              </p>
            ) : (
              <div className="flex items-center justify-center">
                <AnimatePresence>
                  {desk.map((card, index) => (
                    <motion.div
                      key={card.id}
                      initial={{
                        opacity: 0,
                        y: 100,
                        scale: 0.8,
                      }}
                      animate={{
                        opacity: 1,
                        x: (index - desk.length / 2) * 20,
                        y: 0,
                        scale: 1,
                        transition: {
                          duration: 0.5,
                          ease: [0.25, 0.46, 0.45, 0.94],
                          y: {
                            type: "spring",
                            stiffness: 200,
                            damping: 30,
                          },
                        },
                      }}
                      exit={{
                        opacity: 0,
                        y: 100,
                        scale: 0.8,
                        transition: { duration: 0.3 },
                      }}
                      style={{
                        marginLeft: index === 0 ? 0 : "-4rem",
                        filter: "drop-shadow(2px 4px 8px rgba(0, 0, 0, 0.8))",
                      }}
                      className="relative"
                    >
                      <KoreanCard
                        card={card}
                        onClick={() => handleRemoveCard(card)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
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
                      onClick={() => handlePutCard(card)}
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
