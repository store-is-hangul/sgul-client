import { io, Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/types/socket";

/**
 * 타입이 지정된 Socket.IO 클라이언트 타입
 */
export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// 환경 변수에서 소켓 서버 URL 가져오기 (기본값: http://localhost:3001)
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

/**
 * WebSocket 연결을 관리하는 싱글톤 서비스 클래스
 * 소켓 초기화, 연결/해제, 재연결 로직을 담당
 */
class SocketService {
  private socket: TypedSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  /**
   * Socket.IO 클라이언트를 초기화하고 반환
   * 이미 연결된 소켓이 있으면 기존 소켓 반환
   *
   * @returns 초기화된 Socket.IO 클라이언트 인스턴스
   */
  initialize(): TypedSocket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"], // WebSocket 우선, Polling 대체
      autoConnect: false, // 수동 연결 모드
      reconnection: true, // 자동 재연결 활성화
      reconnectionDelay: 1000, // 재연결 시도 간격 (ms)
      reconnectionDelayMax: 5000, // 최대 재연결 대기 시간 (ms)
      reconnectionAttempts: this.maxReconnectAttempts, // 최대 재연결 시도 횟수
    });

    this.setupEventHandlers();

    return this.socket;
  }

  /**
   * 소켓 이벤트 핸들러 설정
   * 연결, 연결 해제, 에러 등의 기본 이벤트 처리
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // 연결 성공 시
    this.socket.on("connect", () => {
      console.log("[Socket] Connected:", this.socket?.id);
      this.reconnectAttempts = 0; // 재연결 카운터 초기화
    });

    // 연결 해제 시
    this.socket.on("disconnect", (reason: string) => {
      console.log("[Socket] Disconnected:", reason);
    });

    // 연결 에러 시
    this.socket.on("connect_error", (error: Error) => {
      console.error("[Socket] Connection error:", error);
      this.reconnectAttempts++;

      // 최대 재연결 시도 횟수 초과 시 연결 중단
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("[Socket] Max reconnection attempts reached");
        this.socket?.disconnect();
      }
    });
  }

  /**
   * 소켓 연결 시작
   */
  connect(): void {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  /**
   * 소켓 연결 해제
   */
  disconnect(): void {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
  }

  /**
   * 현재 소켓 인스턴스 반환
   *
   * @returns 소켓 인스턴스 또는 null
   */
  getSocket(): TypedSocket | null {
    return this.socket;
  }

  /**
   * 소켓 연결 상태 확인
   *
   * @returns 연결 여부
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

/**
 * 전역에서 사용할 소켓 서비스 싱글톤 인스턴스
 */
export const socketService = new SocketService();
