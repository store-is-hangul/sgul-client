import { KoreanCardGame } from "@/components/korean-card-game";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-[url('/assets/background.webp')] bg-cover bg-center pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[url('/assets/background_filter.webp')] bg-cover bg-center mix-blend-color opacity-20 pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative z-10">
        <KoreanCardGame />
      </div>
    </div>
  );
}
