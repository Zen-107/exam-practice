/**
 * ตั้งค่าตัวตรวจ AI ของผู้ใช้แต่ละคน (เก็บในเบราว์เซอร์เครื่องนี้เท่านั้น ไม่ส่งไป server ของเว็บ)
 * - server : ใช้ตัวตรวจของเว็บ (ค่าเริ่มต้น)
 * - local  : เบราว์เซอร์เรียก AI ในเครื่องผู้ใช้เองโดยตรง (LM Studio / Ollama / vLLM …)
 * - custom : เบราว์เซอร์เรียก API ของผู้ใช้เองด้วย key ของผู้ใช้ (Groq / Gemini / OpenRouter …)
 */
export type AiMode = 'server' | 'local' | 'custom';

export interface AiSettings {
  mode: AiMode;
  preset: string;
  baseUrl: string;
  model: string;
  apiKey: string;
  /** ส่ง response_format=json_object (ถ้า server ไม่รับ จะลองใหม่แบบไม่ส่งให้เอง) */
  jsonMode: boolean;
  timeoutMs: number;
  /** ส่งเฉลยให้ตัวตรวจกี่ตัวอักษร (โมเดลเล็ก/context สั้นใช้ค่าน้อย) */
  answerKeyChars: number;
  /** AI ของฉันใช้ไม่ได้ → ใช้ตัวตรวจของเว็บแทน */
  fallbackToServer: boolean;
}

export interface Preset {
  id: string;
  name: string;
  mode: Exclude<AiMode, 'server'>;
  baseUrl: string;
  model?: string;
  answerKeyChars?: number;
  /** false = server ไม่รับ response_format */
  jsonMode?: boolean;
  /** หน้าเว็บสำหรับเอา key / ดาวน์โหลด */
  link?: string;
}

export const PRESETS: Preset[] = [
  { id: 'lmstudio', name: 'LM Studio', mode: 'local', baseUrl: 'http://localhost:1234/v1', link: 'https://lmstudio.ai' },
  { id: 'ollama', name: 'Ollama', mode: 'local', baseUrl: 'http://localhost:11434/v1', model: 'qwen2.5:7b', answerKeyChars: 2000, link: 'https://ollama.com' },
  { id: 'vllm', name: 'vLLM', mode: 'local', baseUrl: 'http://localhost:8000/v1' },
  { id: 'llamacpp', name: 'llama.cpp', mode: 'local', baseUrl: 'http://localhost:8080/v1' },
  { id: 'jan', name: 'Jan', mode: 'local', baseUrl: 'http://localhost:1337/v1', link: 'https://jan.ai' },
  { id: 'swu', name: 'SWU AI (นิสิต มศว)', mode: 'custom', baseUrl: 'https://swuai.swu.ac.th/swu/api/service', model: 'anthropic/claude-sonnet-5.5', jsonMode: false, link: 'https://swuai.swu.ac.th' },
  { id: 'groq', name: 'Groq', mode: 'custom', baseUrl: 'https://api.groq.com/openai/v1', model: 'openai/gpt-oss-120b', link: 'https://console.groq.com/keys' },
  { id: 'gemini', name: 'Gemini', mode: 'custom', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.5-flash', link: 'https://aistudio.google.com/apikey' },
  { id: 'openrouter', name: 'OpenRouter', mode: 'custom', baseUrl: 'https://openrouter.ai/api/v1', link: 'https://openrouter.ai/keys' },
  { id: 'other', name: 'อื่นๆ (OpenAI-compatible)', mode: 'custom', baseUrl: '' },
];

export const DEFAULT_SETTINGS: AiSettings = {
  mode: 'server', preset: 'lmstudio', baseUrl: 'http://localhost:1234/v1', model: '', apiKey: '',
  jsonMode: true, timeoutMs: 300_000, answerKeyChars: 4000, fallbackToServer: true,
};

const KEY = 'cpe310.ai.v1';

export function getAiSettings(): AiSettings {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    return raw ? { ...DEFAULT_SETTINGS, ...raw } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAiSettings(s: AiSettings) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage ถูกปิด */ }
}

export const usesOwnAi = (s: AiSettings) => s.mode !== 'server' && !!s.baseUrl && !!s.model;
