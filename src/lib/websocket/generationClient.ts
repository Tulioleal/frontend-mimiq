import type { GenerationEvent, GenerationPayload } from "@/lib/api/types";

export type GenerationClient = { send: (payload: GenerationPayload) => void; cancel: () => void };

export function createGenerationClient(wsBaseUrl: string, onEvent: (event: GenerationEvent) => void): GenerationClient {
  let socket: WebSocket | null = new WebSocket(`${wsBaseUrl.replace(/\/$/, "")}/ws/generations/stream`);

  socket.binaryType = "blob";
  socket.onopen = () => onEvent({ type: "ready" });
  socket.onmessage = (message) => {
    if (message.data instanceof Blob) {
      onEvent({ type: "chunk", chunk: message.data });
      return;
    }
    try {
      onEvent(JSON.parse(String(message.data)) as GenerationEvent);
    } catch {
      onEvent({ type: "error", message: "Received an unreadable streaming event." });
    }
  };
  socket.onerror = () => onEvent({ type: "error", message: "WebSocket stream failed." });
  socket.onclose = () => {
    socket = null;
    onEvent({ type: "closed" });
  };

  return {
    send: (payload) => socket?.readyState === WebSocket.OPEN && socket.send(JSON.stringify(payload)),
    cancel: () => {
      if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: "cancel" }));
      socket?.close();
      socket = null;
    }
  };
}
