"use client";

import { SocketProvider } from "@/contexts/socket-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface GameLayoutProps {
  children: React.ReactNode;
}

export default function GameLayout({ children }: GameLayoutProps) {
  const router = useRouter();

  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  useEffect(() => {
    if (!userId || userId.trim() === "") {
      router.replace("/");
    }
  }, [userId, router]);

  if (!userId || userId.trim() === "") {
    return null;
  }

  return (
    <SocketProvider autoConnect={true} userId={userId}>
      {children}
    </SocketProvider>
  );
}
