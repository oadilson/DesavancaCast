import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Separa os acentos das letras
    .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/[^\w-]+/g, '') // Remove caracteres não alfanuméricos (exceto hífens)
    .replace(/--+/g, '-'); // Remove hífens duplicados
}

export function formatDuration(duration: string): string {
  if (!duration) return '';

  let totalSeconds = 0;
  // Handle case where duration is just a number (seconds)
  if (!isNaN(Number(duration))) {
    totalSeconds = parseInt(duration, 10);
  } 
  // Handle HH:MM:SS, MM:SS, etc.
  else if (duration.includes(':')) {
    const parts = duration.split(':').reverse(); // [ss, mm, hh]
    totalSeconds += parseInt(parts[0] || '0', 10);
    if (parts[1]) totalSeconds += parseInt(parts[1], 10) * 60;
    if (parts[2]) totalSeconds += parseInt(parts[2], 10) * 3600;
  } else {
    return duration; // Fallback for unknown formats
  }

  if (isNaN(totalSeconds) || totalSeconds <= 0) return '';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  if (minutes > 0) {
    return `${minutes} min`;
  }
  return `< 1 min`;
}