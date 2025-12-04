"use client";

import { use, useMemo } from "react";
import { KoreanCardGame } from "@/components/korean-card-game";
import { SocketProvider } from "@/contexts/socket-context";
import { generate8DigitId } from "@/utils";

interface GamePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function GamePage({ params }: GamePageProps) {
  const { id: gameId } = use(params);

  // userId 생성 (새로고침해도 유지되도록 sessionStorage 활용)
  const userId = useMemo(() => {
    if (typeof window !== "undefined") {
      let storedUserId = sessionStorage.getItem("userId");
      if (!storedUserId) {
        storedUserId = generate8DigitId();
        sessionStorage.setItem("userId", storedUserId);
      }
      return storedUserId;
    }
    return generate8DigitId();
  }, []);

  return (
    <SocketProvider autoConnect={true} userId={userId}>
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
          <KoreanCardGame gameId={gameId} />
        </div>
      </div>
    </SocketProvider>
  );
}
