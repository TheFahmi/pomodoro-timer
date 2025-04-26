interface WorkboxEvent {
  type: string;
}

interface Workbox {
  addEventListener(event: string, callback: (event: WorkboxEvent) => void): void;
  register(): void;
}

declare global {
  interface Window {
    workbox: Workbox;
  }
}

export {};
