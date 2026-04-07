'use client';

import { Customer } from './types';

// Per-tenant localStorage key
function customerKey(tenantId: string): string {
  return `${tenantId}_current_customer`;
}

export function getCurrentCustomer(tenantId: string): Customer | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(customerKey(tenantId));
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}

export function setCurrentCustomer(tenantId: string, customer: Customer | null): void {
  if (typeof window === 'undefined') return;
  if (customer) {
    localStorage.setItem(customerKey(tenantId), JSON.stringify(customer));
  } else {
    localStorage.removeItem(customerKey(tenantId));
  }
}

export function logoutCustomer(tenantId: string): void {
  setCurrentCustomer(tenantId, null);
}

export function isAdminLoggedIn(tenantId: string): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(`${tenantId}_admin_session`) === 'true';
}

export function adminLogin(tenantId: string, password: string, correctPassword: string): boolean {
  if (password === correctPassword) {
    sessionStorage.setItem(`${tenantId}_admin_session`, 'true');
    return true;
  }
  return false;
}

export function adminLogout(tenantId: string): void {
  sessionStorage.removeItem(`${tenantId}_admin_session`);
}
