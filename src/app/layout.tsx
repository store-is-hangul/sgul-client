import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "@/contexts/socket-context";
import { Toaster } from "@/components/ui/sonner";

// Geist Sans 폰트 설정
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Geist Mono 폰트 설정
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 페이지 메타데이터
export const metadata: Metadata = {
  title: "스토어는 한글이야",
  description: "자음과 모음 카드로 낱말을 만들어보세요",
};

/**
 * 루트 레이아웃 컴포넌트
 *
 * - 전역 폰트 설정
 * - SocketProvider를 통한 전역 WebSocket 상태 관리
 * - Toaster를 통한 전역 알림 시스템
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* WebSocket Provider: autoConnect=false로 수동 연결 모드 */}
        <SocketProvider autoConnect={false}>
          {children}
          {/* 토스트 알림 컴포넌트 */}
          <Toaster />
        </SocketProvider>
      </body>
    </html>
  );
}
