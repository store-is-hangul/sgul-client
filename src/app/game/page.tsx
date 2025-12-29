"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { KoreanCardGame } from "@/components/korean-card-game";
import { SocketProvider } from "@/contexts/socket-context";

function GameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("id");

  useEffect(() => {
    if (!userId || userId.trim() === "") {
      router.replace("/");
    }
  }, [userId, router]);

  if (!userId || userId.trim() === "") {
    return null;
  }

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

export default function GamePage() {
  return (
    <Suspense fallback={null}>
      <GameContent />
    </Suspense>
  );
}
