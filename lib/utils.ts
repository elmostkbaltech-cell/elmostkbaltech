import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface RemainingTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isNearExpiry: boolean; // less than 30 days
  totalSeconds: number;
}

export function calculateRemainingTime(expiryDateString: string): RemainingTime {
  const target = new Date(expiryDateString).getTime();
  const now = new Date().getTime();
  const diff = target - now;

  if (diff <= 0 || isNaN(diff)) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      isNearExpiry: true,
      totalSeconds: 0,
    };
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    isNearExpiry: days <= 30,
    totalSeconds: Math.floor(diff / 1000),
  };
}

export function formatDate(dateString: string, lang: 'ar' | 'en'): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}
