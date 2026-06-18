import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTalkTime(date: Date | string | null | undefined) {
  if (!date) return "TBD";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
