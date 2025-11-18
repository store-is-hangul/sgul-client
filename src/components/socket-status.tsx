"use client";

import { useSocket, useStompPublish } from "@/hooks/use-socket";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { SocketStatus as SocketStatusType } from "@/types/socket";
import { stompService } from "@/lib/socket";

/**
 * 소켓 상태별 UI 설정
 */
const STATUS_CONFIG: Record<
  SocketStatusType,
  { label: string; color: string; bgColor: string }
> = {
  connected: {
    label: "연결됨",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  disconnected: {
    label: "연결 끊김",
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
  },
  connecting: {
    label: "연결 중...",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  error: {
    label: "연결 오류",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
} as const;

/**
 * WebSocket 연결 상태를 표시하고 제어하는 컴포넌트
 *
 * - 현재 연결 상태를 시각적으로 표시
 * - 소켓 ID 표시 (연결 시)
 * - 연결/해제 토글 버튼 제공
 */
export const SocketStatus = () => {
  const { status, connect, disconnect, isConnected, socket } = useSocket();

  const statusConfig = STATUS_CONFIG[status];

  /**
   * 연결/해제 토글 핸들러
   */
  const handleToggleConnection = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  const { publish } = useStompPublish();

  /**
   * 구독 상태 확인 핸들러
   */
  const handleCheckSubscriptions = () => {
    const subscriptions = stompService.getSubscriptions();
    console.log("=== 구독 상태 확인 ===");
    console.log(`총 구독 수: ${subscriptions.length}`);
    console.log("구독 목록:", subscriptions);
    console.log(
      "/user/queue/game 구독 여부:",
      stompService.isSubscribed("/user/queue/game")
    );
    console.log("====================");
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        {/* 상태 인디케이터 */}
        <div className="flex items-center gap-3">
          {/* 상태 표시 점 */}
          <div className={`h-3 w-3 rounded-full ${statusConfig.bgColor}`}>
            <div
              className={`h-full w-full rounded-full ${statusConfig.color.replace("text-", "bg-")} ${isConnected ? "animate-pulse" : ""}`}
            />
          </div>
          {/* 상태 텍스트 */}
          <div>
            <p className="text-sm font-medium">
              WebSocket 상태 {process.env.NEXT_PUBLIC_WEBSOCKET_URL}
            </p>
            <p className={`text-xs ${statusConfig.color}`}>
              {statusConfig.label}
              {/* 연결 시 추가 정보 표시 */}
              {isConnected && socket && (
                <span className="ml-2 text-gray-500">
                  (STOMP {socket.connected ? "active" : "inactive"})
                </span>
              )}
            </p>
          </div>
        </div>
        {/* 연결/해제 버튼 */}
        <Button
          onClick={handleToggleConnection}
          variant={isConnected ? "destructive" : "default"}
          size="sm"
          disabled={status === "connecting"}
        >
          {isConnected ? "연결 해제" : "연결"}
        </Button>

        <Button
          onClick={() => publish("/app/game/start")}
          variant="default"
          size="sm"
        >
          Game Start
        </Button>

        <Button onClick={handleCheckSubscriptions} variant="outline" size="sm">
          구독 확인
        </Button>
      </div>
    </Card>
  );
};
