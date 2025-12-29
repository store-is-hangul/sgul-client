"use client";

import { generate8DigitId } from "@/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handlePlayClick = () => {
    router.push(`/game?id=${generate8DigitId()}`);
  };

  const handleLeaderboardClick = () => {
    router.push(`/leaderboard`);
  };

  return (
    <div className="relative h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-[url('/assets/background_main.webp')] bg-cover bg-center pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col justify-between items-start pl-[15%] py-[8%] sm:py-[12%] md:py-[18%] h-full min-h-0">
        <div className="flex-shrink-0">
          <Image
            src="/assets/main_logo.webp"
            alt="logo"
            width={568}
            height={354}
            className="w-auto h-auto max-w-[90vw] sm:max-w-[568px] max-h-[35vh] sm:max-h-[354px] object-contain"
          />
        </div>
        <div className="flex flex-col gap-[2.4rem] w-full max-w-[27rem] pb-[8%] sm:pb-0 flex-shrink-0">
          <button
            onClick={handlePlayClick}
            className="bg-[url('/assets/btn_play.webp')] bg-contain bg-center bg-no-repeat w-full max-w-[27rem] aspect-[27/11] transition-all duration-300 hover:opacity-80 hover:scale-110 active:scale-105 focus:outline-none cursor-pointer"
            aria-label="게임 시작"
            tabIndex={0}
          />
          <button
            onClick={handleLeaderboardClick}
            className="bg-[url('/assets/btn_leaderboard.webp')] bg-contain bg-center bg-no-repeat w-full max-w-[27rem] aspect-[27/11] transition-all duration-300 hover:opacity-80 hover:scale-110 active:scale-105 focus:outline-none cursor-pointer"
            aria-label="리더 보드"
            tabIndex={0}
          />
        </div>
      </div>
    </div>
  );
}
