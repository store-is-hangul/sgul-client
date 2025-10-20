/**
 * 서버에서 클라이언트로 전송되는 이벤트 타입 정의
 */
export interface ServerToClientEvents {
  /** 메시지 수신 이벤트 */
  message: (data: {
    content: string;
    userId: string;
    timestamp: number;
  }) => void;
  /** 사용자 접속 이벤트 */
  userConnected: (data: { userId: string; username: string }) => void;
  /** 사용자 연결 해제 이벤트 */
  userDisconnected: (data: { userId: string }) => void;
  /** 알림 수신 이벤트 */
  notification: (data: { type: string; message: string }) => void;
}

/**
 * 클라이언트에서 서버로 전송되는 이벤트 타입 정의
 */
export interface ClientToServerEvents {
  /** 메시지 전송 이벤트 */
  sendMessage: (data: { content: string; roomId?: string }) => void;
  /** 방 입장 이벤트 */
  joinRoom: (roomId: string) => void;
  /** 방 퇴장 이벤트 */
  leaveRoom: (roomId: string) => void;
}

/**
 * WebSocket 연결 상태
 */
export type SocketStatus =
  | "connected"
  | "disconnected"
  | "connecting"
  | "error";
