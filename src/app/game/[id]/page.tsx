"use client";

import { use } from "react";
import { KoreanCardGame } from "@/components/korean-card-game";

interface GamePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function GamePage({ params }: GamePageProps) {
  const { id: userId } = use(params);

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-[url('/assets/background.webp')] bg-cover bg-center pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[url('/assets/background_filter_crt.webp')] bg-cover bg-center mix-blend-color opacity-20 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[url('/assets/background_filter_vig.webp')] bg-cover bg-center opacity-60 pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative z-10">
        <KoreanCardGame gameId={userId} />
      </div>
    </div>
  );
}
