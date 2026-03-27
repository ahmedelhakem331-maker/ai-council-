'use client';

/**
 * JWT Token Management Utilities
 */

interface JWTPayload {
  sub: string;
  iat: number;
  exp: number;
  [key: string]: any;
}

class JWTManager {
  private tokenKey = 'ai_council_jwt';

  /**
   * Store JWT token
   */
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  /**
   * Retrieve JWT token
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  /**
   * Remove JWT token
   */
  clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
  }

  /**
   * Decode JWT (without verification - for client-side use only)
   */
  decode(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const decoded = JSON.parse(atob(parts[1]));
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isExpired(token: string): boolean {
    const payload = this.decode(token);
    if (!payload || !payload.exp) return true;

    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  }

  /**
   * Get time remaining until expiration
   */
  getTimeUntilExpiry(token: string): number {
    const payload = this.decode(token);
    if (!payload || !payload.exp) return 0;

    const expirationTime = payload.exp * 1000;
    return Math.max(0, expirationTime - Date.now());
  }

  /**
   * Get authorization header
   */
  getAuthHeader(): { Authorization: string } | null {
    const token = this.getToken();
    if (!token || this.isExpired(token)) {
      return null;
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Get WebSocket URL with token
   */
  getWebSocketUrl(baseUrl: string): string {
    const token = this.getToken();
    if (!token) return baseUrl;

    const url = new URL(baseUrl, typeof window !== 'undefined' ? window.location.href : 'http://localhost');
    url.searchParams.append('token', token);
    return url.toString();
  }
}

export const jwtManager = new JWTManager();
