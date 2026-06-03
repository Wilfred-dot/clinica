'use client';

import { useEffect, useState, type ReactNode } from 'react';

type ToastType = 'success' | 'warn' | 'error' | '';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
const listeners: ((toasts: ToastMessage[]) => void)[] = [];

function emit(toasts: ToastMessage[]) {
  listeners.forEach((fn) => fn(toasts));
}

export function toast(message: string, type: ToastType = '') {
  const id = ++toastId;
  const newToast = { id, message, type };
  const current = (window as any).__toasts__ || [];
  (window as any).__toasts__ = [...current, newToast];
  emit((window as any).__toasts__);
  setTimeout(() => {
    const updated = ((window as any).__toasts__ || []).filter((t: ToastMessage) => t.id !== id);
    (window as any).__toasts__ = updated;
    emit(updated);
  }, 3200);
}

const icons: Record<string, ReactNode> = {
  success: (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  warn: (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    (window as any).__toasts__ = (window as any).__toasts__ || [];
    setToasts((window as any).__toasts__);
    const handler = (newToasts: ToastMessage[]) => setToasts(newToasts);
    listeners.push(handler);
    return () => {
      const idx = listeners.indexOf(handler);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {icons[t.type] ?? icons.warn}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
