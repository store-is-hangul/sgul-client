/**
 * WebSocket 연결 상태
 */
export type SocketStatus =
  | "connected"
  | "disconnected"
  | "connecting"
  | "error";

/**
 * STOMP 메시지 타입 정의
 */

/**
 * 메시지 데이터 타입
 */
export interface MessageData {
  content: string;
  userId: string;
  timestamp: number;
}

/**
 * 사용자 접속 데이터 타입
 */
export interface UserConnectedData {
  userId: string;
  username: string;
}

/**
 * 사용자 연결 해제 데이터 타입
 */
export interface UserDisconnectedData {
  userId: string;
}

/**
 * 알림 데이터 타입
 */
export interface NotificationData {
  type: string;
  message: string;
}

/**
 * 메시지 전송 데이터 타입
 */
export interface SendMessageData {
  content: string;
  roomId?: string;
}

/**
 * 방 입장/퇴장 데이터 타입
 */
export interface RoomData {
  roomId: string;
}

/**
 * STOMP Destination 경로 정의
 */
export const STOMP_DESTINATIONS = {
  // 구독 경로 (서버 -> 클라이언트)
  SUBSCRIBE: {
    /** 메시지 수신 */
    MESSAGE: "/topic/messages",
    /** 사용자 접속 */
    USER_CONNECTED: "/topic/user-connected",
    /** 사용자 연결 해제 */
    USER_DISCONNECTED: "/topic/user-disconnected",
    /** 알림 수신 */
    NOTIFICATION: "/topic/notifications",
    /** 특정 방의 메시지 (동적) */
    ROOM_MESSAGE: (roomId: string) => `/topic/room/${roomId}`,
  },
  // 발행 경로 (클라이언트 -> 서버)
  PUBLISH: {
    /** 메시지 전송 */
    SEND_MESSAGE: "/app/sendMessage",
    /** 방 입장 */
    JOIN_ROOM: "/app/joinRoom",
    /** 방 퇴장 */
    LEAVE_ROOM: "/app/leaveRoom",
  },
} as const;

/**
 * 레거시 Socket.IO 호환 타입 (deprecated)
 * @deprecated STOMP에서는 위의 타입들을 직접 사용하는 것을 권장합니다
 */

/**
 * 서버에서 클라이언트로 전송되는 이벤트 타입 정의 (레거시)
 */
export interface ServerToClientEvents {
  /** 메시지 수신 이벤트 */
  message: (data: MessageData) => void;
  /** 사용자 접속 이벤트 */
  userConnected: (data: UserConnectedData) => void;
  /** 사용자 연결 해제 이벤트 */
  userDisconnected: (data: UserDisconnectedData) => void;
  /** 알림 수신 이벤트 */
  notification: (data: NotificationData) => void;
}

/**
 * 클라이언트에서 서버로 전송되는 이벤트 타입 정의 (레거시)
 */
export interface ClientToServerEvents {
  /** 메시지 전송 이벤트 */
  sendMessage: (data: SendMessageData) => void;
  /** 방 입장 이벤트 */
  joinRoom: (roomId: string) => void;
  /** 방 퇴장 이벤트 */
  leaveRoom: (roomId: string) => void;
}
