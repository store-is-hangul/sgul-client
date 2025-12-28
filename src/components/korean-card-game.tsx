"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KoreanCard } from "./korean-card";
import {
  KoreanCard as KoreanCardType,
  GameStartResponse,
  DeskRequest,
  DeskResponse,
  DrawDeckResponse,
  PointResponse,
} from "@/types/card";
import {
  useSocket,
  useStompSubscription,
  useStompPublish,
} from "@/hooks/use-socket";
import { SocketStatus } from "./socket-status";
import Image from "next/image";
import ErrorDialog from "@/components/dialog/error-dialog";

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
  const [isErrorOpen, setIsErrorOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // 게임 상태 업데이트 헬퍼 함수
  const updateGameState = (
    data: DeskResponse | DrawDeckResponse | PointResponse
  ) => {
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

  // 덱 카드 드로우 응답 구독 (/user/queue/draw)
  useStompSubscription<DrawDeckResponse>("/user/queue/draw", data => {
    console.log("[RESPONSE] 덱 카드 드로우 응답:", data);

    if (!data) {
      console.error("[Draw] ❌ Received null/undefined data");
      return;
    }

    updateGameState(data);
    console.log("[Draw] ✅ Draw state updated successfully");
  });

  useStompSubscription<PointResponse>("/user/queue/point", data => {
    console.log("[RESPONSE] 점수 응답:", data);
    if (!data) {
      console.error("[Point] ❌ Received null/undefined data");
      setErrorMessage("데이터를 받지 못했습니다.");
      setIsErrorOpen(true);
      return;
    }
    if (data.success) {
      setTotalScore(data.totalScore);
      updateGameState(data);
      console.log("[Point] ✅ Point state updated successfully");
    } else {
      console.error("[Point] ❌ Failed to submit card");
      setErrorMessage("카드 제출에 실패했습니다.");
      updateGameState(data);
      setIsErrorOpen(true);
    }
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

  const handleDrawDeck = () => {
    if (!isConnected) {
      console.error("[Deck] ❌ Not connected to server");
      return;
    }

    publish("/app/game/draw", {
      counts: 1,
    });
  };

  const handleSubmitCard = () => {
    if (!isConnected) {
      console.error("[Submit] ❌ Not connected to server");
      return;
    }
    publish("/app/game/point", {});
  };

  const handleResetGame = () => {
    // 게임 재시작 요청
    setIsGameStarted(false);
    if (isConnected) {
      publish("/app/game/start", {});
      console.log("[Game] Game restart requested");
    }
  };

  const getDeckLayers = (): number => {
    if (deckCardsCount >= 73) return 4;
    if (deckCardsCount >= 49) return 3;
    if (deckCardsCount >= 25) return 2;
    return 1;
  };

  return (
    <div className="relative min-h-screen p-8 flex flex-col">
      {/* 소켓 상태 표시 */}
      <div className="fixed top-4 right-4 z-50">
        <SocketStatus />
      </div>
      <div className="absolute left-8 top-8 font-galmuri font-bold text-[4rem] text-white stroke-[#262f35]">
        SCORE : {totalScore}
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
      <div className="absolute right-12 bottom-[-4rem] flex flex-col items-end gap-[4rem]">
        <button
          className="bg-[url('/assets/btn_submit.webp')] bg-contain bg-center bg-no-repeat w-[18.2rem] h-[7.8rem] transition-all duration-300 hover:opacity-80 hover:scale-110 cursor-pointer active:scale-105 focus:outline-none"
          aria-label="카드 제출"
          tabIndex={0}
          onClick={handleSubmitCard}
        />
        <button
          onClick={handleDrawDeck}
          className="relative w-[15.6rem] h-[19.5rem] transition-all duration-300 hover:opacity-80 hover:scale-110 cursor-pointer"
        >
          <Image
            src={`/assets/deck/deck_${getDeckLayers()}.svg`}
            alt="deck"
            fill
            className="object-contain"
          />
        </button>
      </div>

      {/* 에러 다이얼로그 */}
      <ErrorDialog
        isOpen={isErrorOpen}
        onOpenChange={setIsErrorOpen}
        message={errorMessage}
      />
    </div>
  );
};
