"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KoreanCard } from "./korean-card";
import { KoreanCard as KoreanCardType, getRandomHand } from "@/types/card";

type CenterCard = KoreanCardType & { originalIndex: number };

export const KoreanCardGame = () => {
  const [hand, setHand] = useState<KoreanCardType[]>(() => getRandomHand(8));
  const [centerCards, setCenterCards] = useState<CenterCard[]>([]);

  const handleCardClick = (card: KoreanCardType, cardIndex: number) => {
    // 손패에서 카드 제거
    setHand((prev) => prev.filter((c) => c.id !== card.id));
    // 중앙에 카드 추가 (카드 인덱스 정보도 함께 저장)
    const centerCard: CenterCard = { ...card, originalIndex: cardIndex };
    setCenterCards((prev) => [...prev, centerCard]);
  };

  const handleResetGame = () => {
    setHand(getRandomHand(8));
    setCenterCards([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 p-8 flex flex-col">
      {/* 게임 제목 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          한글 카드 게임
        </h1>
        <p className="text-gray-600">카드를 클릭해서 중앙으로 내보세요!</p>
      </div>

      {/* 중앙 영역 */}
      <div className="flex-1 flex items-center justify-center mb-8">
        <div className="relative">
          <div className="w-80 h-60 border-4 border-dashed border-gray-400 rounded-xl bg-white/50 flex items-center justify-center">
            <p className="text-gray-500 text-lg font-medium">
              카드를 여기에 내세요
            </p>
          </div>

          {/* 중앙에 놓인 카드들 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-wrap gap-2 items-center justify-center">
              <AnimatePresence>
                {centerCards.map((card, index) => {
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
                        rotate: (index - centerCards.length / 2) * 6, // 자연스러운 각도
                        scale: 1,
                        transition: {
                          duration: 0.8, // 더 느리게
                          ease: [0.25, 0.46, 0.45, 0.94],
                          y: {
                            type: "spring",
                            stiffness: 200, // 더 부드럽게
                            damping: 30,
                          },
                          rotate: {
                            type: "spring",
                            stiffness: 150,
                            damping: 25,
                          },
                        },
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0,
                        transition: { duration: 0.4 },
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
            내 카드 ({hand.length}장)
          </h3>
          <div className="flex gap-3 justify-center flex-wrap">
            <AnimatePresence>
              {hand.map((card, index) => (
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
                  whileHover={{ y: -10 }}
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
