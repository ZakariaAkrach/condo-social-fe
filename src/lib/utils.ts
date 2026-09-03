import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return "Ora";
  if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? "i" : ""} fa`;
  if (diffHour < 24) return `${diffHour} ${diffHour === 1 ? "ora" : "ore"} fa`;
  if (diffDay < 30) return `${diffDay} ${diffDay === 1 ? "giorno" : "giorni"} fa`;
  if (diffMonth < 12) return `${diffMonth} ${diffMonth === 1 ? "mese" : "mesi"} fa`;
  return `${Math.floor(diffMonth / 12)} anni fa`;
}