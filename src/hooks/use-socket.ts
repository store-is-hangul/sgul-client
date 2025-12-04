"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSocketContext } from "@/contexts/socket-context";
import { stompService } from "@/lib/socket";
import type { IMessage, StompHeaders } from "@stomp/stompjs";

/**
 * STOMP WebSocket 연결 및 상태 관리를 위한 Hook
 *
 * @returns STOMP 클라이언트 인스턴스, 상태, 연결/해제 메서드를 포함하는 객체
 *
 * @example
 * ```tsx
 * const { isConnected, connect, disconnect } = useSocket();
 * ```
 */
export const useSocket = () => {
  const { client, status, connect, disconnect, isConnected } =
    useSocketContext();

  return {
    client,
    socket: client, // 별칭: Socket.IO 스타일 호환성
    status,
    connect,
    disconnect,
    isConnected,
  };
};

/**
 * STOMP destination 구독을 위한 Hook
 *
 * @template T - 메시지 데이터의 타입
 * @param destination - 구독할 destination (예: "/topic/messages")
 * @param handler - 메시지 수신 시 실행될 핸들러 함수
 * @param headers - 추가 구독 헤더 (선택사항)
 *
 * @example
 * ```tsx
 * useStompSubscription<{ content: string }>("/topic/chat", (data) => {
 *   console.log(data.content);
 * });
 * ```
 */
export const useStompSubscription = <T = unknown>(
  destination: string,
  handler: (data: T) => void,
  headers?: StompHeaders
) => {
  const { isConnected } = useSocketContext();
  const savedHandler = useRef(handler);

  // 최신 핸들러를 ref에 저장하여 의존성 문제 방지
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!isConnected) {
      console.log(`[Subscription] Waiting for connection: ${destination}`);
      return;
    }

    console.log(`[Subscription] 📡 Subscribing to: ${destination}`);

    // STOMP 메시지 핸들러 래퍼
    const messageHandler = (message: IMessage) => {
      console.log(
        `[Subscription] 📨 Message received from ${destination}:`,
        message
      );
      try {
        // 메시지 본문을 JSON으로 파싱 시도
        const data = JSON.parse(message.body) as T;
        savedHandler.current(data);
      } catch (error) {
        console.warn(
          `[Subscription] Failed to parse JSON from ${destination}:`,
          error
        );
        // JSON 파싱 실패 시 원본 문자열 전달
        savedHandler.current(message.body as T);
      }
    };

    // destination 구독
    const unsubscribe = stompService.subscribe(
      destination,
      messageHandler,
      headers
    );

    console.log(`[Subscription] ✅ Subscribed successfully to: ${destination}`);

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      console.log(`[Subscription] 🔌 Unsubscribing from: ${destination}`);
      unsubscribe();
    };
  }, [destination, isConnected, headers]);
};

/**
 * STOMP 메시지 발행을 위한 Hook
 *
 * @returns publish 함수와 연결 상태를 포함하는 객체
 *
 * @example
 * ```tsx
 * const { publish } = useStompPublish();
 *
 * const sendMessage = () => {
 *   publish("/app/sendMessage", { content: "Hello!" });
 * };
 * ```
 */
export const useStompPublish = () => {
  const { isConnected } = useSocketContext();

  /**
   * STOMP 메시지를 발행하는 함수
   *
   * @template T - 전송할 데이터의 타입
   * @param destination - 메시지를 보낼 destination (예: "/app/sendMessage")
   * @param body - 메시지 본문
   * @param headers - 추가 헤더 (선택사항)
   * @returns 전송 성공 여부
   */
  const publish = useCallback(
    <T = unknown>(
      destination: string,
      body?: T,
      headers?: StompHeaders
    ): boolean => {
      console.log(`[Publish] Attempting to publish to "${destination}"`, {
        isConnected,
        body,
        headers,
      });

      if (!isConnected) {
        console.warn(
          `[STOMP] ❌ Cannot publish to "${destination}": Not connected`
        );
        return false;
      }

      stompService.publish(destination, body, headers);
      console.log(`[Publish] ✅ Published successfully to "${destination}"`);
      return true;
    },
    [isConnected]
  );

  return { publish, isConnected };
};
