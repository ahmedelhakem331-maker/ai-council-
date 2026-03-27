'use client';

/**
 * LocalStorage Utilities with safety checks
 */

interface StorageOptions {
  ttl?: number; // Time to live in milliseconds
  namespace?: string;
}

class LocalStorageManager {
  private defaultNamespace = 'ai_council';
  private isAvailable: boolean;

  constructor() {
    // Check if localStorage is available
    this.isAvailable = typeof window !== 'undefined' && !!window.localStorage;
  }

  /**
   * Get full storage key with namespace
   */
  private getKey(key: string, namespace: string = this.defaultNamespace): string {
    return `${namespace}:${key}`;
  }

  /**
   * Set value in localStorage
   */
  set<T>(key: string, value: T, options: StorageOptions = {}): boolean {
    if (!this.isAvailable) return false;

    try {
      const { namespace = this.defaultNamespace, ttl } = options;
      const fullKey = this.getKey(key, namespace);

      const data = {
        value,
        timestamp: Date.now(),
        ttl,
      };

      localStorage.setItem(fullKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn(`Failed to set localStorage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Get value from localStorage
   */
  get<T = any>(key: string, options: StorageOptions = {}): T | null {
    if (!this.isAvailable) return null;

    try {
      const { namespace = this.defaultNamespace } = options;
      const fullKey = this.getKey(key, namespace);

      const item = localStorage.getItem(fullKey);
      if (!item) return null;

      const data = JSON.parse(item);

      // Check if expired
      if (data.ttl && Date.now() - data.timestamp > data.ttl) {
        localStorage.removeItem(fullKey);
        return null;
      }

      return data.value as T;
    } catch (error) {
      console.warn(`Failed to get localStorage key "${key}":`, error);
      return null;
    }
  }

  /**
   * Remove value from localStorage
   */
  remove(key: string, options: StorageOptions = {}): boolean {
    if (!this.isAvailable) return false;

    try {
      const { namespace = this.defaultNamespace } = options;
      const fullKey = this.getKey(key, namespace);
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.warn(`Failed to remove localStorage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all keys for a namespace
   */
  clear(namespace: string = this.defaultNamespace): boolean {
    if (!this.isAvailable) return false;

    try {
      const prefix = `${namespace}:`;
      const keys = Object.keys(localStorage);

      for (const key of keys) {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      }
      return true;
    } catch (error) {
      console.warn(`Failed to clear localStorage namespace "${namespace}":`, error);
      return false;
    }
  }

  /**
   * Get all keys for a namespace
   */
  getAllKeys(namespace: string = this.defaultNamespace): string[] {
    if (!this.isAvailable) return [];

    try {
      const prefix = `${namespace}:`;
      return Object.keys(localStorage)
        .filter((key) => key.startsWith(prefix))
        .map((key) => key.substring(prefix.length));
    } catch (error) {
      console.warn('Failed to get localStorage keys:', error);
      return [];
    }
  }

  /**
   * Check if key exists
   */
  has(key: string, options: StorageOptions = {}): boolean {
    if (!this.isAvailable) return false;

    try {
      const { namespace = this.defaultNamespace } = options;
      const fullKey = this.getKey(key, namespace);
      const item = localStorage.getItem(fullKey);

      if (!item) return false;

      const data = JSON.parse(item);

      // Check if expired
      if (data.ttl && Date.now() - data.timestamp > data.ttl) {
        localStorage.removeItem(fullKey);
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}

export const storage = new LocalStorageManager();

/**
 * Hook for safe localStorage access in React with hydration safety
 */
import { useEffect, useState } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: StorageOptions = {}
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    const storedValue = storage.get<T>(key, options);
    if (storedValue !== null) {
      setValue(storedValue);
    }
    setIsHydrated(true);
  }, [key, options]);

  // Sync value to localStorage
  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    storage.set(key, newValue, options);
  };

  return [value, setStoredValue];
}
