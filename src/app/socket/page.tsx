"use client";

import { SocketStatus } from "@/components/socket-status";
import { SocketExample } from "@/components/socket-example";
import { SocketProvider } from "@/contexts/socket-context";

/**
 * 메인 홈 페이지 컴포넌트
 *
 * WebSocket 기능을 시연하는 데모 페이지로 다음을 포함:
 * - WebSocket 연결 상태 표시 및 제어
 * - 실시간 메시지 송수신 예제
 * - 방(Room) 기반 통신 예제
 * - 사용 방법 안내
 */
export default function SocketPage() {
  return (
    <SocketProvider autoConnect={false}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* 페이지 헤더 */}
          <header className="text-center">
            <h1 className="mb-2 text-4xl font-bold text-gray-900">
              WebSocket Demo
            </h1>
            <p className="text-gray-600">Socket.IO를 사용한 실시간 통신 예제</p>
          </header>

          {/* WebSocket 연결 상태 표시 */}
          <SocketStatus />

          {/* WebSocket 기능 예제 */}
          <SocketExample />

          {/* 사용 방법 안내 */}
          <footer className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold">사용 방법</h3>
            <ol className="list-inside list-decimal space-y-2 text-sm text-gray-700">
              <li>
                먼저 &quot;연결&quot; 버튼을 클릭하여 WebSocket 서버에
                연결합니다
              </li>
              <li>메시지를 입력하고 전송하여 서버와 통신합니다</li>
              <li>방 입장/퇴장 기능을 통해 룸 기반 통신을 테스트합니다</li>
              <li>수신 메시지 목록에서 서버로부터 받은 메시지를 확인합니다</li>
            </ol>
            {/* 환경 변수 설정 안내 */}
            <div className="mt-4 rounded-md bg-blue-50 p-3">
              <p className="text-xs text-blue-800">
                <strong>참고:</strong> 환경 변수{" "}
                <code className="rounded bg-blue-100 px-1">
                  NEXT_PUBLIC_SOCKET_URL
                </code>
                을 설정하여 WebSocket 서버 URL을 변경할 수 있습니다. (기본값:
                http://localhost:3001)
              </p>
            </div>
          </footer>
        </div>
      </div>
    </SocketProvider>
  );
}
