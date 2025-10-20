"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSocketContext } from "@/contexts/socket-context";
import type { Socket } from "socket.io-client";

/**
 * WebSocket 연결 및 상태 관리를 위한 Hook
 *
 * @returns 소켓 인스턴스, 상태, 연결/해제 메서드를 포함하는 객체
 *
 * @example
 * ```tsx
 * const { isConnected, connect, disconnect } = useSocket();
 * ```
 */
export const useSocket = () => {
  const { socket, status, connect, disconnect, isConnected } =
    useSocketContext();

  return {
    socket,
    status,
    connect,
    disconnect,
    isConnected,
  };
};

/**
 * 서버로부터 특정 이벤트를 수신하는 Hook
 *
 * @template T - 이벤트 데이터의 타입
 * @param event - 수신할 이벤트 이름
 * @param handler - 이벤트 발생 시 실행될 핸들러 함수
 *
 * @example
 * ```tsx
 * useSocketEvent<{ message: string }>("chat", (data) => {
 *   console.log(data.message);
 * });
 * ```
 */
export const useSocketEvent = <T = unknown>(
  event: string,
  handler: (data: T) => void
) => {
  const { socket, isConnected } = useSocketContext();
  const savedHandler = useRef(handler);

  // 최신 핸들러를 ref에 저장하여 의존성 문제 방지
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // 타입 안전한 이벤트 핸들러 래퍼
    const eventHandler = (data: T) => {
      savedHandler.current(data);
    };

    // Socket.IO의 untyped 이벤트 시스템 사용
    const untypedSocket = socket as unknown as Socket;
    untypedSocket.on(event, eventHandler);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      untypedSocket.off(event, eventHandler);
    };
  }, [socket, event, isConnected]);
};

/**
 * 서버로 이벤트를 전송하는 Hook
 *
 * @returns emit 함수와 연결 상태를 포함하는 객체
 *
 * @example
 * ```tsx
 * const { emit } = useSocketEmit();
 *
 * const sendMessage = () => {
 *   emit("sendMessage", { content: "Hello!" });
 * };
 * ```
 */
export const useSocketEmit = () => {
  const { socket, isConnected } = useSocketContext();

  /**
   * 서버로 이벤트를 전송하는 함수
   *
   * @template T - 전송할 데이터의 타입
   * @param event - 전송할 이벤트 이름
   * @param data - 전송할 데이터 (선택사항)
   * @returns 전송 성공 여부
   */
  const emit = useCallback(
    <T = unknown>(event: string, data?: T): boolean => {
      if (!socket || !isConnected) {
        console.warn(`[Socket] Cannot emit "${event}": Socket not connected`);
        return false;
      }

      const untypedSocket = socket as unknown as Socket;

      if (data !== undefined) {
        untypedSocket.emit(event, data);
      } else {
        untypedSocket.emit(event);
      }

      return true;
    },
    [socket, isConnected]
  );

  return { emit, isConnected };
};
