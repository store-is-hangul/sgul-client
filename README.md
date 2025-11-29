This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

This project includes **STOMP over WebSocket** implementation for real-time bidirectional communication.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## WebSocket (STOMP) Configuration

This project uses STOMP protocol over WebSocket for real-time communication with the backend server.

### Environment Setup

1. Copy the example environment file:

```bash
cp env.example .env.local
```

2. Configure the WebSocket URL (default: `ws://localhost:3001/ws`):

```env
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001/ws
```

### Usage

#### 1. Wrap your app with SocketProvider

```tsx
import { SocketProvider } from "@/contexts/socket-context";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SocketProvider autoConnect={true}>{children}</SocketProvider>
      </body>
    </html>
  );
}
```

#### 2. Use STOMP Hooks in your components

**Subscribe to messages (Recommended STOMP style):**

```tsx
import { useStompSubscription } from "@/hooks/use-socket";
import { STOMP_DESTINATIONS, MessageData } from "@/types/socket";

function ChatComponent() {
  useStompSubscription<MessageData>(
    STOMP_DESTINATIONS.SUBSCRIBE.MESSAGE,
    data => {
      console.log("Received message:", data.content);
    }
  );
}
```

**Publish messages (Recommended STOMP style):**

```tsx
import { useStompPublish } from "@/hooks/use-socket";
import { STOMP_DESTINATIONS } from "@/types/socket";

function ChatComponent() {
  const { publish, isConnected } = useStompPublish();

  const sendMessage = () => {
    if (isConnected) {
      publish(STOMP_DESTINATIONS.PUBLISH.SEND_MESSAGE, {
        content: "Hello!",
        roomId: "room-1",
      });
    }
  };
}
```

**Legacy Socket.IO style (for compatibility):**

```tsx
import { useSocketEvent, useSocketEmit } from "@/hooks/use-socket";

function ChatComponent() {
  const { emit, isConnected } = useSocketEmit();

  // Subscribe
  useSocketEvent<MessageData>("message", data => {
    console.log(data.content);
  });

  // Publish
  const sendMessage = () => {
    emit("sendMessage", { content: "Hello!" });
  };
}
```

### STOMP Destinations

Pre-defined destinations are available in `src/types/socket.ts`:

**Subscribe (Server → Client):**

- `/topic/messages` - General messages
- `/topic/user-connected` - User connection events
- `/topic/user-disconnected` - User disconnection events
- `/topic/notifications` - Notifications
- `/topic/room/{roomId}` - Room-specific messages

**Publish (Client → Server):**

- `/app/sendMessage` - Send a message
- `/app/joinRoom` - Join a room
- `/app/leaveRoom` - Leave a room

### Server Requirements

Your STOMP server should:

1. Accept WebSocket connections at the configured URL
2. Support STOMP protocol (e.g., using Spring Boot with `spring-boot-starter-websocket`)
3. Handle the destinations defined in `src/types/socket.ts`

Example Spring Boot configuration:

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:3000")
                .withSockJS();
    }
}
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
