/**
 * Shared API & WebSocket URL Configuration
 * ─────────────────────────────────────────
 * Configures HTTP and WebSocket endpoints dynamically based on environment variables.
 * - NEXT_PUBLIC_API_URL: Full base URL for REST API (e.g. 'https://api.yourdomain.com/api/v1' or 'http://localhost:8000/api/v1')
 * - NEXT_PUBLIC_WS_URL: Base URL for WebSocket connection (e.g. 'wss://api.yourdomain.com' or 'ws://localhost:8000')
 */

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  return 'http://localhost:8000/api/v1';
}

export function getWsBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL.replace(/\/+$/, '');
  }

  // If NEXT_PUBLIC_API_URL is provided, derive WS URL from it
  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const parsed = new URL(process.env.NEXT_PUBLIC_API_URL);
      const wsProto = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${wsProto}//${parsed.host}`;
    } catch {
      // Fallback below
    }
  }

  // Development default
  return 'ws://localhost:8000';
}
