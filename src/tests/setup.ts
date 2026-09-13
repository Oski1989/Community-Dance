if (typeof window === 'undefined') {
  (global as any).WebSocket = class MockWebSocket {
    close() {}
    send() {}
    addEventListener() {}
    removeEventListener() {}
  };
}
