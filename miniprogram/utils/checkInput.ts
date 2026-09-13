import type { CheckInput, CheckInputKind } from '../types/index'

export const EMPTY_INPUT_HINT = '先粘贴一个链接或内容'

const OBVIOUS_URL_RE = /^(https?:\/\/[^\s]+)/i
const WWW_URL_RE = /^(www\.[^\s]+\.[a-z]{2,}[^\s]*)/i

export function isHttpUrl(text: string): boolean {
  return /^https?:\/\/\S+$/i.test(text.trim())
}

export function looksLikeUrlAttempt(text: string): boolean {
  const value = text.trim()
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value) || WWW_URL_RE.test(value)
}

export function isObviousUrl(text: string): boolean {
  const value = text.trim()
  return OBVIOUS_URL_RE.test(value) || WWW_URL_RE.test(value)
}

export function detectCheckKind(text: string): CheckInputKind {
  return isHttpUrl(text) ? 'url' : 'text'
}

export function parseCheckInput(raw: string): CheckInput | { error: string } {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { error: EMPTY_INPUT_HINT }
  }
  if (looksLikeUrlAttempt(trimmed) && !isHttpUrl(trimmed)) {
    return { error: '链接格式不正确' }
  }
  return {
    raw: trimmed,
    kind: detectCheckKind(trimmed),
  }
}
