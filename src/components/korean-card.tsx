"use client";

import { motion } from "framer-motion";
import { KoreanCard as KoreanCardType } from "@/types/card";
import { cn } from "@/lib/utils";

interface KoreanCardProps {
  card: KoreanCardType;
  onClick?: () => void;
  className?: string;
  isInCenter?: boolean;
}

export const KoreanCard = ({
  card,
  onClick,
  className,
  isInCenter,
}: KoreanCardProps) => {
  return (
    <motion.div
      className={cn(
        "relative w-16 h-24 bg-white border-2 border-gray-300 rounded-lg shadow-lg cursor-pointer",
        "hover:shadow-xl hover:scale-105 transition-all duration-200",
        "flex items-center justify-center text-2xl font-bold",
        card.type === "consonant"
          ? "bg-blue-50 border-blue-300"
          : "bg-red-50 border-red-300",
        isInCenter && "cursor-default",
        className
      )}
      onClick={onClick}
      whileHover={!isInCenter ? { scale: 1.05 } : {}}
      whileTap={!isInCenter ? { scale: 0.95 } : {}}
      layout
    >
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-800">{card.character}</div>
        <div className="text-xs text-gray-500 mt-1">
          {card.type === "consonant" ? "자음" : "모음"}
        </div>
      </div>
    </motion.div>
  );
};
