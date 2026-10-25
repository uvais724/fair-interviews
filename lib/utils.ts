import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function minutesToSeconds(minutes: number) {
  return Math.round(minutes * 60)
}

export function secondsToMinutes(seconds: number) {
  return Math.round((seconds / 60) * 10) / 10
}
