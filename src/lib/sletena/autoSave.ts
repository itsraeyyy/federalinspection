'use client';

import { useState, useEffect, useRef } from 'react';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void> | void;
  debounceMs?: number; // Default 1000ms (1 second)
  storageKey?: string; // Optional LocalStorage key fallback
}

export function useAutoSave<T>({
  data,
  onSave,
  debounceMs = 1000,
  storageKey,
}: AutoSaveOptions<T>) {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const isFirstRender = useRef(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Skip auto-save on initial mount to prevent immediate trigger
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setStatus('saving');

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      try {
        if (storageKey) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(data));
          } catch {
            // LocalStorage quota or access error handled gracefully
          }
        }
        await onSave(data);
        setStatus('saved');
        const now = new Date();
        setLastSavedTime(
          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      } catch {
        setStatus('error');
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, debounceMs, onSave, storageKey]);

  return {
    status,
    lastSavedTime,
  };
}
