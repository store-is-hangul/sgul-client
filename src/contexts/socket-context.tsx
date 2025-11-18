"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { stompService, StompClient } from "@/lib/socket";
import type { SocketStatus } from "@/types/socket";

/**
 * Socket Context의 값 타입 정의
 */
interface SocketContextValue {
  /** STOMP 클라이언트 인스턴스 */
  client: StompClient | null;
  /** 현재 WebSocket 연결 상태 */
  status: SocketStatus;
  /** WebSocket 연결 함수 */
  connect: () => void;
  /** WebSocket 연결 해제 함수 */
  disconnect: () => void;
  /** 연결 여부 (편의성을 위한 boolean 값) */
  isConnected: boolean;
}

/**
 * Socket Context - 전역 STOMP 상태 관리를 위한 Context
 */
const SocketContext = createContext<SocketContextValue | undefined>(undefined);

/**
 * SocketProvider의 props 타입
 */
interface SocketProviderProps {
  children: React.ReactNode;
  /** 자동 연결 여부 (기본값: false) */
  autoConnect?: boolean;
}

/**
 * STOMP WebSocket 연결 상태를 전역으로 관리하는 Provider 컴포넌트
 *
 * @param children - 자식 컴포넌트
 * @param autoConnect - true일 경우 마운트 시 자동으로 WebSocket 연결 (기본값: false)
 *
 * @example
 * ```tsx
 * <SocketProvider autoConnect={true}>
 *   <App />
 * </SocketProvider>
 * ```
 */
export const SocketProvider = ({
  children,
  autoConnect = false,
}: SocketProviderProps) => {
  const [client, setClient] = useState<StompClient | null>(null);
  const [status, setStatus] = useState<SocketStatus>("disconnected");

  useEffect(() => {
    // STOMP 클라이언트 초기화
    const newClient = stompService.initialize();
    setClient(newClient);

    // 연결 성공 핸들러
    stompService.onConnect(() => {
      setStatus("connected");
    });

    // 연결 해제 핸들러
    stompService.onDisconnect(() => {
      setStatus("disconnected");
    });

    // 연결 에러 핸들러
    stompService.onError(() => {
      setStatus("error");
    });

    // autoConnect가 true면 자동으로 연결
    if (autoConnect) {
      setStatus("connecting");
      stompService.connect();
    }

    // 클린업: STOMP 연결 해제
    return () => {
      stompService.disconnect();
    };
  }, [autoConnect]);

  /**
   * STOMP 연결을 시작하는 함수
   */
  const connect = useCallback(() => {
    setStatus("connecting");
    stompService.connect();
  }, []);

  /**
   * STOMP 연결을 해제하는 함수
   */
  const disconnect = useCallback(() => {
    stompService.disconnect();
  }, []);

  // 연결 상태를 boolean으로 변환
  const isConnected = status === "connected";

  const value: SocketContextValue = {
    client,
    status,
    connect,
    disconnect,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

/**
 * Socket Context를 사용하는 Hook
 * SocketProvider 내부에서만 사용 가능
 *
 * @throws SocketProvider 외부에서 사용 시 에러 발생
 * @returns Socket Context 값
 */
export const useSocketContext = () => {
  const context = useContext(SocketContext);

  if (context === undefined) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }

  return context;
};
