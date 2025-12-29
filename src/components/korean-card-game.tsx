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
import { useRouter } from "next/navigation";

interface KoreanCardGameProps {
  gameId: string;
}

export const KoreanCardGame = ({ gameId }: KoreanCardGameProps) => {
  const { isConnected } = useSocket();
  const { publish } = useStompPublish();
  const router = useRouter();
  const [hand, setHand] = useState<KoreanCardType[]>([]);
  const [desk, setDesk] = useState<KoreanCardType[]>([]);
  const [deckCardsCount, setDeckCardsCount] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [sessionId, setSessionId] = useState<string>("");
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [isErrorOpen, setIsErrorOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [mathematicalExpression, setMathematicalExpression] =
    useState<string>("");

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
      // 수식 표현 표시
      if (data.mathematicalExpression) {
        setMathematicalExpression(data.mathematicalExpression);
      }
      console.log("[Point] ✅ Point state updated successfully");
    } else {
      console.error("[Point] ❌ Failed to submit card");
      setErrorMessage("카드 제출에 실패했습니다.");
      updateGameState(data);
      setIsErrorOpen(true);
    }
  });

  // 수식 표현 2초 후 사라지게
  useEffect(() => {
    if (mathematicalExpression) {
      const timer = setTimeout(() => {
        setMathematicalExpression("");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [mathematicalExpression]);

  // 게임 시작 요청 (구독 설정 완료 후 실행되도록 딜레이 추가)
  useEffect(() => {
    console.log("[Game] useEffect triggered:", {
      isConnected,
      isGameStarted,
      shouldRequest: isConnected && !isGameStarted,
    });

    if (isConnected && !isGameStarted) {
      // React의 useEffect 실행 순서를 고려하여 subscription이 먼저 설정되도록
      // 짧은 딜레이를 추가하여 타이밍 이슈 방지
      // useStompSubscription의 useEffect가 먼저 실행되도록 보장
      const timer = setTimeout(() => {
        console.log("[Game] 🎮 Requesting game start...");
        const success = publish("/app/game/start", {});
        console.log("[Game] Publish result:", success);
      }, 150); // 150ms 딜레이로 subscription 설정 시간 확보

      return () => clearTimeout(timer);
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

  const handleExitGame = () => {
    router.push("game/score?id=" + gameId);
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
          <div className="min-w-80 min-h-60 flex items-center justify-center p-4">
            {mathematicalExpression ? (
              <motion.p
                key={mathematicalExpression}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="font-galmuri font-extrabold text-[8rem] text-white"
              >
                {mathematicalExpression}
              </motion.p>
            ) : desk.length === 0 ? null : (
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
      <div className="flex justify-center pr-48">
        <div className="p-6">
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
      <div className="absolute right-12 bottom-[-4rem] flex flex-col items-end gap-[4rem]">
        <button
          className="bg-[url('/assets/btn_submit.webp')] bg-contain bg-center bg-no-repeat w-[15.6rem] h-[7.8rem] transition-all duration-300 hover:opacity-80 hover:scale-110 cursor-pointer active:scale-105 focus:outline-none"
          aria-label="카드 제출"
          tabIndex={0}
          onClick={handleSubmitCard}
        />
        {totalScore > 0 && (
          <button
            className="bg-[url('/assets/btn_exit.webp')] bg-contain bg-center bg-no-repeat w-[15.6rem] h-[7.8rem] transition-all duration-300 hover:opacity-80 hover:scale-110 cursor-pointer active:scale-105 focus:outline-none"
            aria-label="게임 종료"
            tabIndex={0}
            onClick={handleExitGame}
          />
        )}
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
