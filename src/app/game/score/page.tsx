"use client";

import { useStompPublish, useStompSubscription } from "@/hooks/use-socket";
import { LeaderboardUser } from "@/types/leaderboard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const KOREAN_TO_ENGLISH_MAP: Record<string, string> = {
  // 자음
  ㄱ: "R",
  ㄲ: "R",
  ㄴ: "S",
  ㄷ: "E",
  ㄸ: "E",
  ㄹ: "F",
  ㅁ: "A",
  ㅂ: "Q",
  ㅃ: "Q",
  ㅅ: "T",
  ㅆ: "T",
  ㅇ: "D",
  ㅈ: "W",
  ㅉ: "W",
  ㅊ: "C",
  ㅋ: "Z",
  ㅌ: "X",
  ㅍ: "V",
  ㅎ: "G",
  // 모음
  ㅏ: "K",
  ㅐ: "O",
  ㅑ: "I",
  ㅒ: "O",
  ㅓ: "J",
  ㅔ: "P",
  ㅕ: "U",
  ㅖ: "P",
  ㅗ: "H",
  ㅛ: "Y",
  ㅜ: "N",
  ㅠ: "B",
  ㅡ: "M",
  ㅣ: "L",
};

const ScorePage = () => {
  const [nickname, setNickname] = useState("");
  const router = useRouter();

  const { publish } = useStompPublish();

  const handleSubmitNickname = () => {
    publish("/leaderboard/save", { userName: nickname, score: 100 });
  };

  useStompSubscription<LeaderboardUser>(
    "/user/queue/leaderboard/save",
    data => {
      console.log("[RESPONSE] 닉네임 저장 응답:", data);
      if (data) {
        router.push("/leaderboard");
      }
    }
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // 백스페이스 처리
      if (e.key === "Backspace") {
        setNickname(prev => prev.slice(0, -1));
        return;
      }

      // 한글 자음/모음을 영어로 변환
      if (KOREAN_TO_ENGLISH_MAP[e.key]) {
        setNickname(prev => (prev + KOREAN_TO_ENGLISH_MAP[e.key]).slice(0, 10));
        return;
      }

      // 일반 문자 입력 (영문/숫자만, 대문자로 변환)
      if (/^[a-zA-Z0-9]$/.test(e.key)) {
        setNickname(prev => (prev + e.key.toUpperCase()).slice(0, 10)); // 길이 제한 10
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [nickname]);

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-[url('/assets/background_score.webp')] bg-cover bg-center pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col items-center justify-center h-screen gap-64">
        <div className="font-galmuri font-bold text-[6.4rem] text-white stroke-[#262f35] uppercase">
          ENTER YOUR NAME
        </div>
        <div className="font-galmuri font-bold text-[12rem] text-white stroke-[#262f35] h-[16rem] tracking-[3.2rem] uppercase flex">
          <span>{nickname}</span>
          {nickname.length < 10 && (
            <span className="border-b-[0.8rem] border-white w-[9.6rem] animate-blink" />
          )}
        </div>
        <div>
          <button
            onClick={handleSubmitNickname}
            className="bg-[url('/assets/btn_input.webp')] bg-contain bg-center bg-no-repeat w-[27rem] h-[11rem] transition-all duration-300 hover:opacity-80 hover:scale-110 cursor-pointer active:scale-105 focus:outline-none"
            aria-label="점수 입력"
            tabIndex={0}
          />
        </div>
      </div>
    </div>
  );
};

export default ScorePage;
