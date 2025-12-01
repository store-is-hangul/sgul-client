"use client";

import { motion } from "framer-motion";
import { KoreanCard as KoreanCardType, getCardImagePath } from "@/types/card";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
  const imagePath = getCardImagePath(card);

  return (
    <motion.div
      className={cn(
        "relative w-[15.6rem] h-[19.5rem] rounded-lg shadow-lg cursor-pointer overflow-hidden",
        "hover:shadow-xl transition-shadow duration-200",
        isInCenter && "cursor-default",
        className
      )}
      onClick={onClick}
      whileHover={!isInCenter ? { scale: 1.05 } : {}}
      whileTap={!isInCenter ? { scale: 0.95 } : {}}
      layout
    >
      <Image
        src={imagePath}
        alt={`${card.cardType} ${card.value} (${card.score}점)`}
        fill
        className="object-contain"
        priority={!isInCenter}
      />
    </motion.div>
  );
};
