import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 정적 HTML로 내보내기 (exe 빌드용)
  output: "export",

  // Image 컴포넌트 최적화 비활성화 (static export 필수)
  images: {
    unoptimized: true,
  },

  // 빌드 출력 경로 (기본: out)
  distDir: "out",

  // 환경 변수 설정 (빌드 시점에 번들에 포함됨)
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
    NEXT_PUBLIC_WEBSOCKET_URL:
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3001/ws",
  },

  // 동적 라우트 허용 (static export와 함께 사용 시 제한적)
  // 동적 라우트는 generateStaticParams가 필요하지만,
  // "use client"와 함께 사용할 수 없으므로 빈 배열 반환
};

export default nextConfig;
