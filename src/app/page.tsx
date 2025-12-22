"use client";

import { generate8DigitId } from "@/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handlePlayClick = () => {
    router.push(`/game/${generate8DigitId()}`);
  };

  const handleLeaderboardClick = () => {
    router.push(`/leaderboard`);
  };

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-[url('/assets/background_main.webp')] bg-cover bg-center pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col justify-between pl-[15%] py-[18%] min-h-screen">
        <Image
          src="/assets/main_logo.webp"
          alt="logo"
          width={568}
          height={354}
        />
        <div className="flex flex-col gap-[2.4rem]">
          <button
            onClick={handlePlayClick}
            className="bg-[url('/assets/btn_play.webp')] bg-contain bg-center bg-no-repeat w-[27rem] h-[11rem] transition-all duration-300 hover:opacity-80 hover:scale-110 cursor-pointer active:scale-105 focus:outline-none cursor-pointer"
            aria-label="게임 시작"
            tabIndex={0}
          />
          <button
            onClick={handleLeaderboardClick}
            className="bg-[url('/assets/btn_leaderboard.webp')] bg-contain bg-center bg-no-repeat w-[27rem] h-[11rem] transition-all duration-300 hover:opacity-80 hover:scale-110 cursor-pointer active:scale-105 focus:outline-none cursor-pointer"
            aria-label="리더 보드"
            tabIndex={0}
          />
        </div>
      </div>
    </div>
  );
}
