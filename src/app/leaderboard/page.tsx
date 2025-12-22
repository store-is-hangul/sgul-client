"use client";

import { useRouter } from "next/navigation";

const LeaderboardPage = () => {
  const router = useRouter();

  const handleBackClick = () => {
    router.push(`/`);
  };

  const rows = [
    { id: 1, rank: "1", name: "John Doe", score: 100 },
    { id: 2, rank: "2", name: "Jane Doe", score: 90 },
    { id: 3, rank: "3", name: "John Smith123123123", score: 80 },
  ];

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-[url('/assets/background_leaderboard.webp')] bg-cover bg-center pointer-events-none"
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
        <div className="flex flex-col items-center justify-center pt-[10rem] gap-[13rem]">
          <p className="font-galmuri font-extrabold text-[6.4rem] text-white uppercase [text-shadow:-4px_4px_0_rgba(0,0,0,0.25)]">
            LEADER BOARD
          </p>
          <ul className="w-[60rem]">
            {rows.map(row => (
              <li
                key={row.id}
                className="grid grid-cols-[7ch_minmax(0,1fr)_12ch] items-center gap-x-8 py-2 font-bold font-galmuri text-[3.2rem] text-white [text-shadow:-4px_4px_0_rgba(0,0,0,0.25)]"
              >
                {/* Rank: 왼쪽 시작점 고정 */}
                <span className="justify-self-start text-left font-bold tabular-nums">
                  {row.rank}TH
                </span>

                {/* Name: 왼쪽 시작점 고정 + 길면 말줄임 */}
                <span className="min-w-0 justify-self-start text-left truncate font-bold uppercase">
                  {row.name}
                </span>

                {/* Score: 오른쪽 끝점 고정 (시작점도 결과적으로 동일하게 보임) */}
                <span className="justify-self-end text-right font-bold tabular-nums">
                  {row.score.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
          <button
            onClick={handleBackClick}
            className="bg-[url('/assets/btn_before.webp')] bg-contain bg-center bg-no-repeat w-[18.2rem] h-[7.8rem] transition-all duration-300 hover:opacity-80 hover:scale-110 cursor-pointer active:scale-105 focus:outline-none cursor-pointer"
            aria-label="이전"
            tabIndex={0}
          />
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
