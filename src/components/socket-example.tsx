"use client";

import { useState } from "react";
import {
  useStompSubscription,
  useStompPublish,
  useSocket,
} from "@/hooks/use-socket";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { MessageData, STOMP_DESTINATIONS } from "@/types/socket";

/**
 * STOMP WebSocket 기능을 시연하는 예제 컴포넌트
 *
 * 주요 기능:
 * - 메시지 송수신 (STOMP 프로토콜)
 * - 방(Room) 입장/퇴장
 * - 실시간 알림 수신
 * - 사용자 접속/퇴장 이벤트 처리
 *
 * @example
 * // 구독 (Subscribe)
 * useStompSubscription<MessageData>(
 *   STOMP_DESTINATIONS.SUBSCRIBE.MESSAGE,
 *   (data) => console.log(data)
 * );
 *
 * // 발행 (Publish)
 * const { publish } = useStompPublish();
 * publish(STOMP_DESTINATIONS.PUBLISH.SEND_MESSAGE, { content: "Hello!" });
 */
export const SocketExample = () => {
  const [messages] = useState<MessageData[]>([]);
  const [inputValue, setInputValue] = useState("");
  const { publish, isConnected } = useStompPublish();

  // useStompSubscription<MessageData>(
  //   STOMP_DESTINATIONS.SUBSCRIBE.MESSAGE,
  //   (data) => {
  //     setMessages((prev) => [...prev, data]);
  //     toast.success(`새 메시지: ${data.content}`);
  //   }
  // );

  useStompSubscription("/user/queue/game", data => {
    console.log(data);
  });

  useStompSubscription("/queue/errors", data => {
    console.log("Subscription Error:", data);
  });

  /**
   * 메시지 전송 핸들러
   * 빈 메시지는 전송하지 않음
   */
  const handleSendMessage = () => {
    if (!inputValue.trim()) {
      toast.error("메시지를 입력해주세요");
      return;
    }

    const success = publish(STOMP_DESTINATIONS.PUBLISH.SEND_MESSAGE, {
      content: inputValue,
    });

    if (success) {
      setInputValue("");
      toast.success("메시지 전송 완료");
    } else {
      toast.error("메시지 전송 실패: 소켓 연결 필요");
    }
  };

  /**
   * 방 입장 핸들러
   */
  const handleJoinRoom = () => {
    const roomId = "room-1";
    publish(STOMP_DESTINATIONS.PUBLISH.JOIN_ROOM, { roomId });
    toast.success(`방 ${roomId}에 입장했습니다`);
  };

  /**
   * 방 퇴장 핸들러
   */
  const handleLeaveRoom = () => {
    const roomId = "room-1";
    publish(STOMP_DESTINATIONS.PUBLISH.LEAVE_ROOM, { roomId });
    toast.info(`방 ${roomId}에서 퇴장했습니다`);
  };

  /**
   * Enter 키 입력 시 메시지 전송
   * Shift+Enter는 전송하지 않음
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-4">
      {/* 메시지 전송 섹션 */}
      <Card className="p-4">
        <h3 className="mb-4 text-lg font-semibold">메시지 전송</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            disabled={!isConnected}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="메시지 입력"
          />
          <Button onClick={handleSendMessage} disabled={!isConnected} size="sm">
            전송
          </Button>
        </div>
      </Card>

      {/* 방 관리 섹션 */}
      <Card className="p-4">
        <h3 className="mb-4 text-lg font-semibold">방 관리</h3>
        <div className="flex gap-2">
          <Button
            onClick={handleJoinRoom}
            disabled={!isConnected}
            variant="outline"
            size="sm"
          >
            방 입장
          </Button>
          <Button
            onClick={handleLeaveRoom}
            disabled={!isConnected}
            variant="outline"
            size="sm"
          >
            방 퇴장
          </Button>
        </div>
      </Card>

      {/* 수신 메시지 목록 섹션 */}
      <Card className="p-4">
        <h3 className="mb-4 text-lg font-semibold">
          수신 메시지{" "}
          <span className="text-sm text-gray-500">({messages.length})</span>
        </h3>
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {messages.length === 0 ? (
            // 메시지가 없을 때 빈 상태 표시
            <p className="text-center text-sm text-gray-500">
              받은 메시지가 없습니다
            </p>
          ) : (
            // 메시지 목록 렌더링
            messages.map((msg, index) => (
              <div
                key={`${msg.timestamp}-${index}`}
                className="rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                <p className="text-sm">{msg.content}</p>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                  <span>User: {msg.userId.slice(0, 8)}</span>
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString("ko-KR")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
