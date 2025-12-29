"use client";

import { use } from "react";
import { SocketProvider } from "@/contexts/socket-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface GameLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
}

export default function GameLayout({ children, params }: GameLayoutProps) {
  const { id: userId } = use(params);
  const router = useRouter();

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
