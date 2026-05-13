// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Priority } from '@/types/database'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
}

export function formatRelative(date: string | null | undefined): string {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })
}

export function isOverdue(date: string | null | undefined): boolean {
  if (!date) return false
  return isPast(new Date(date))
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  baixa: 'text-orka-neutral bg-orka-neutral/10',
  media: 'text-orka-accent bg-orka-accent/10',
  alta: 'text-orka-warning bg-orka-warning/10',
  urgente: 'text-orka-danger bg-orka-danger/10',
}

export const PRIORITY_DOT: Record<Priority, string> = {
  baixa: 'bg-orka-neutral',
  media: 'bg-orka-accent',
  alta: 'bg-orka-warning',
  urgente: 'bg-orka-danger',
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}
