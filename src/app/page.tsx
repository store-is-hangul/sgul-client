
"use client";

import { generate8DigitId } from "@/utils";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handlePlayClick = () => {
    router.push(`/game/${generate8DigitId()}`);
  };

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-[url('/assets/background_main.webp')] bg-cover bg-center pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative z-10 flex items-end pl-[15%] pb-[24%] min-h-screen">
        <button
          onClick={handlePlayClick}
          className="bg-[url('/assets/btn_play.webp')] bg-contain bg-center bg-no-repeat w-64 h-20 transition-all duration-300 hover:opacity-80 hover:scale-110 cursor-pointer active:scale-105 focus:outline-none"
          aria-label="게임 시작"
          tabIndex={0}
        />
      </div>
    </div>
  );
}
