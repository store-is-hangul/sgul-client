import { Client, IMessage, IFrame, StompHeaders } from "@stomp/stompjs";

/**
 * STOMP 클라이언트 타입
 */
export type StompClient = Client;

/**
 * 구독 콜백 타입
 */
export type SubscriptionCallback = (message: IMessage) => void;

/**
 * 구독 정보를 저장하는 인터페이스
 */
interface Subscription {
  destination: string;
  callback: SubscriptionCallback;
  unsubscribe: () => void;
}

// 환경 변수에서 WebSocket 서버 URL 가져오기 (기본값: ws://localhost:3001/ws)
const WEBSOCKET_URL =
  process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:3001/ws";

/**
 * WebSocket 연결을 관리하는 싱글톤 서비스 클래스 (STOMP 프로토콜 사용)
 * STOMP 클라이언트 초기화, 연결/해제, 구독/발행 로직을 담당
 */
class StompService {
  private client: Client | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private connectCallback: (() => void) | null = null;
  private disconnectCallback: (() => void) | null = null;
  private errorCallback: ((error: Error) => void) | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  /**
   * STOMP 클라이언트를 초기화하고 반환
   * 이미 연결된 클라이언트가 있으면 기존 클라이언트 반환
   *
   * @returns 초기화된 STOMP 클라이언트 인스턴스
   */
  initialize(): Client {
    if (this.client && this.client.connected) {
      return this.client;
    }

    this.client = new Client({
      brokerURL: WEBSOCKET_URL,
      connectHeaders: {
        // 필요한 경우 인증 헤더 추가
        // login: 'user',
        // passcode: 'password',
      },
      debug: (str: string) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[STOMP Debug]", str);
        }
      },
      reconnectDelay: 3000, // 재연결 시도 간격 (ms)
      heartbeatIncoming: 10000, // 서버로부터 heartbeat 수신 간격
      heartbeatOutgoing: 10000, // 서버로 heartbeat 전송 간격
    });

    this.setupEventHandlers();

    return this.client;
  }

  /**
   * STOMP 클라이언트 이벤트 핸들러 설정
   * 연결, 연결 해제, 에러 등의 기본 이벤트 처리
   */
  private setupEventHandlers(): void {
    if (!this.client) return;

    // 연결 성공 시
    this.client.onConnect = (frame: IFrame) => {
      console.log("[STOMP] Connected:", frame);
      this.reconnectAttempts = 0;

      // 이전에 등록된 구독들을 다시 활성화
      this.resubscribeAll();

      if (this.connectCallback) {
        this.connectCallback();
      }
    };

    // 연결 해제 시
    this.client.onDisconnect = (frame: IFrame) => {
      console.log("[STOMP] Disconnected:", frame);
      if (this.disconnectCallback) {
        this.disconnectCallback();
      }
    };

    // STOMP 에러 시
    this.client.onStompError = (frame: IFrame) => {
      console.error("[STOMP] Broker error:", frame.headers["message"]);
      console.error("[STOMP] Details:", frame.body);

      this.disconnect();

      const error = new Error(frame.headers["message"] || "STOMP error");
      if (this.errorCallback) {
        this.errorCallback(error);
      }
    };

    // WebSocket 에러 시
    this.client.onWebSocketError = (event: Event) => {
      console.error("[STOMP] WebSocket error:", event);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("[STOMP] Max reconnection attempts reached");
        this.disconnect();
      }

      const error = new Error("WebSocket connection error");
      if (this.errorCallback) {
        this.errorCallback(error);
      }
    };
  }

  /**
   * 연결이 끊긴 후 재연결 시 모든 구독을 다시 활성화
   */
  private resubscribeAll(): void {
    if (!this.client || !this.client.connected) return;

    this.subscriptions.forEach((subscription) => {
      const stompSubscription = this.client!.subscribe(
        subscription.destination,
        subscription.callback
      );

      // 언구독 함수 업데이트
      subscription.unsubscribe = () => {
        stompSubscription.unsubscribe();
      };
    });
  }

  /**
   * STOMP 연결 시작
   */
  connect(): void {
    if (this.client && !this.client.connected) {
      this.client.activate();
    }
  }

  /**
   * STOMP 연결 해제
   */
  disconnect(): void {
    if (this.client && this.client.connected) {
      this.client.deactivate();
    }
  }

  /**
   * 특정 destination 구독
   *
   * @param destination - 구독할 destination (예: "/topic/messages")
   * @param callback - 메시지 수신 시 실행될 콜백 함수
   * @param headers - 추가 구독 헤더 (선택사항)
   * @returns 구독 해제 함수
   */
  subscribe(
    destination: string,
    callback: SubscriptionCallback,
    headers?: StompHeaders
  ): () => void {
    if (!this.client) {
      console.warn("[STOMP] Client not initialized");
      return () => {};
    }

    const subscriptionKey = `${destination}-${Date.now()}`;

    if (this.client.connected) {
      const stompSubscription = this.client.subscribe(
        destination,
        callback,
        headers
      );

      const subscription: Subscription = {
        destination,
        callback,
        unsubscribe: () => {
          stompSubscription.unsubscribe();
          this.subscriptions.delete(subscriptionKey);
        },
      };

      this.subscriptions.set(subscriptionKey, subscription);

      return subscription.unsubscribe;
    } else {
      // 연결되지 않았을 때는 구독 정보만 저장
      const subscription: Subscription = {
        destination,
        callback,
        unsubscribe: () => {
          this.subscriptions.delete(subscriptionKey);
        },
      };

      this.subscriptions.set(subscriptionKey, subscription);

      return subscription.unsubscribe;
    }
  }

  /**
   * 메시지 발행
   *
   * @param destination - 메시지를 보낼 destination (예: "/app/sendMessage")
   * @param body - 메시지 본문 (문자열 또는 객체)
   * @param headers - 추가 헤더 (선택사항)
   */
  publish<T = unknown>(
    destination: string,
    body: T,
    headers?: StompHeaders
  ): void {
    if (!this.client || !this.client.connected) {
      console.warn("[STOMP] Cannot publish: Client not connected");
      return;
    }

    const messageBody = typeof body === "string" ? body : JSON.stringify(body);

    this.client.publish({
      destination,
      body: messageBody,
      headers: headers || {},
    });
  }

  /**
   * 현재 STOMP 클라이언트 인스턴스 반환
   *
   * @returns STOMP 클라이언트 인스턴스 또는 null
   */
  getClient(): Client | null {
    return this.client;
  }

  /**
   * STOMP 연결 상태 확인
   *
   * @returns 연결 여부
   */
  isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  /**
   * 연결 이벤트 콜백 등록
   */
  onConnect(callback: () => void): void {
    this.connectCallback = callback;
  }

  /**
   * 연결 해제 이벤트 콜백 등록
   */
  onDisconnect(callback: () => void): void {
    this.disconnectCallback = callback;
  }

  /**
   * 에러 이벤트 콜백 등록
   */
  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback;
  }
}

/**
 * 전역에서 사용할 STOMP 서비스 싱글톤 인스턴스
 */
export const stompService = new StompService();
