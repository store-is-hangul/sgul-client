"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { KoreanCardGame } from "@/components/korean-card-game";

function GameContent() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  if (!userId || userId.trim() === "") {
    router.replace("/");
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
        {userId && <KoreanCardGame gameId={userId} />}
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
