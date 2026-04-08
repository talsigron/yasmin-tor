'use client';

// ─── Browser Notification System ──────────────────────────
// Uses the browser Notification API for admin alerts
// when new appointments or customers are registered.

function getKey(tenantId?: string): string {
  return tenantId ? `${tenantId}_notifications_enabled` : 'notifications_enabled';
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(tenantId?: string): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  const result = await Notification.requestPermission();
  if (result === 'granted') {
    localStorage.setItem(getKey(tenantId), 'true');
  }
  return result === 'granted';
}

export function isNotificationEnabled(tenantId?: string): boolean {
  if (!isNotificationSupported()) return false;
  return (
    Notification.permission === 'granted' &&
    localStorage.getItem(getKey(tenantId)) === 'true'
  );
}

export function disableNotifications(tenantId?: string): void {
  localStorage.removeItem(getKey(tenantId));
}

export function sendNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    onClick?: () => void;
  }
): void {
  if (!isNotificationEnabled()) return;

  try {
    const notification = new Notification(title, {
      body: options?.body,
      icon: options?.icon || '/api/icon?size=192',
      tag: options?.tag,
      dir: 'rtl',
      lang: 'he',
    });

    if (options?.onClick) {
      notification.onclick = () => {
        window.focus();
        options.onClick?.();
        notification.close();
      };
    }

    // Auto-close after 8 seconds
    setTimeout(() => notification.close(), 8000);
  } catch {
    // Notification may fail in some contexts (e.g., service worker not available)
    console.warn('Failed to send notification');
  }
}

// ─── Notification types for the app ───────────────────────

export function notifyNewAppointment(customerName: string, serviceName: string, time: string): void {
  sendNotification('תור חדש!', {
    body: `${customerName} קבע/ה תור ל${serviceName} ב-${time}`,
    tag: 'new-appointment',
  });
}

export function notifyNewCustomer(customerName: string): void {
  sendNotification('לקוח/ה חדש/ה!', {
    body: `${customerName} נרשם/ה למערכת ומחכה לאישור`,
    tag: 'new-customer',
  });
}

export function notifyCancelledAppointment(customerName: string, time: string): void {
  sendNotification('ביטול תור', {
    body: `${customerName} ביטל/ה את התור ב-${time}`,
    tag: 'cancelled-appointment',
  });
}
