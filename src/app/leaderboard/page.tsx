"use client";

import { useFetch } from "@/hooks/use-fetch";
import { LeaderboardResponse } from "@/types/leaderboard";
import { useRouter } from "next/navigation";

const LeaderboardPage = () => {
  const router = useRouter();

  const handleBackClick = () => {
    router.push(`/`);
  };

  const { data, isLoading, error } = useFetch<LeaderboardResponse>(
    "leaderboard/ranks?count=10"
  );

  // 디버깅 정보
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const baseUrl = apiUrl || "";
  const trimmedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const trimmedPath = "leaderboard/ranks?count=10".startsWith("/")
    ? "leaderboard/ranks?count=10"
    : `/leaderboard/ranks?count=10`;
  const fullUrl = `${trimmedBase}${trimmedPath}`;

  console.log("=== Leaderboard Debug Info ===");
  console.log("API URL:", apiUrl);
  console.log("Base URL (trimmed):", trimmedBase);
  console.log("Path:", trimmedPath);
  console.log("Full URL:", fullUrl);
  console.log("Error:", error);

  return (
    <div className="relative h-screen overflow-hidden">
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
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex flex-col items-center justify-between h-full py-8 md:py-12">
          <p className="font-galmuri font-extrabold text-[2.4rem] md:text-[6.4rem] text-white uppercase [text-shadow:-4px_4px_0_rgba(0,0,0,0.25)] px-4 text-center flex-shrink-0">
            LEADER BOARD
          </p>

          <div className="w-full max-w-[60rem] px-4 md:px-8 flex-1 overflow-y-auto my-4 md:my-8">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <p className="font-galmuri text-[1.6rem] md:text-[2.4rem] text-white [text-shadow:-4px_4px_0_rgba(0,0,0,0.25)]">
                  Loading...
                </p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center h-full gap-4 overflow-y-auto">
                <p className="font-galmuri text-[1.6rem] md:text-[2.4rem] text-red-400 [text-shadow:-4px_4px_0_rgba(0,0,0,0.25)] text-center px-4">
                  Error: {error.message}
                </p>
                <div className="font-galmuri text-[1rem] md:text-[1.4rem] text-white/80 text-left px-4 max-w-[90%] space-y-2">
                  <p className="break-all">
                    <span className="text-yellow-400">API URL:</span>{" "}
                    {apiUrl || "undefined"}
                  </p>
                  <p className="break-all">
                    <span className="text-yellow-400">Base (trimmed):</span>{" "}
                    {trimmedBase || "empty"}
                  </p>
                  <p className="break-all">
                    <span className="text-yellow-400">Path:</span> {trimmedPath}
                  </p>
                  <p className="break-all">
                    <span className="text-yellow-400">Full URL:</span> {fullUrl}
                  </p>
                  {error.stack && (
                    <p className="text-[0.8rem] text-white/50 break-all mt-4">
                      {error.stack}
                    </p>
                  )}
                </div>
              </div>
            )}

            {!isLoading && !error && data?.ranks && data.ranks.length > 0 && (
              <ul className="w-full">
                {data.ranks.map((row, index) => (
                  <li
                    key={row.userName + index}
                    className="grid grid-cols-[5ch_minmax(0,1fr)_10ch] md:grid-cols-[7ch_minmax(0,1fr)_12ch] items-center gap-x-4 md:gap-x-8 py-1.5 md:py-2 font-bold font-galmuri text-[1.6rem] md:text-[3.2rem] text-white [text-shadow:-4px_4px_0_rgba(0,0,0,0.25)]"
                  >
                    {/* Rank: 왼쪽 시작점 고정 */}
                    <span className="justify-self-start text-left font-bold tabular-nums">
                      {row.rank}TH
                    </span>

                    {/* Name: 왼쪽 시작점 고정 + 길면 말줄임 */}
                    <span className="min-w-0 justify-self-start text-left truncate font-bold uppercase">
                      {row.userName}
                    </span>

                    {/* Score: 오른쪽 끝점 고정 (시작점도 결과적으로 동일하게 보임) */}
                    <span className="justify-self-end text-right font-bold tabular-nums">
                      {row.score.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {!isLoading &&
              !error &&
              (!data?.ranks || data.ranks.length === 0) && (
                <div className="flex items-center justify-center h-full">
                  <p className="font-galmuri text-[1.6rem] md:text-[2.4rem] text-white [text-shadow:-4px_4px_0_rgba(0,0,0,0.25)]">
                    No data available
                  </p>
                </div>
              )}
          </div>

          <button
            onClick={handleBackClick}
            className="bg-[url('/assets/btn_before.webp')] bg-contain bg-center bg-no-repeat w-[12rem] h-[5.2rem] md:w-[18.2rem] md:h-[7.8rem] transition-all duration-300 hover:opacity-80 hover:scale-110 cursor-pointer active:scale-105 focus:outline-none flex-shrink-0"
            aria-label="이전"
            tabIndex={0}
          />
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
