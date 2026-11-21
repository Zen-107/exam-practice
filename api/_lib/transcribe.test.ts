import { describe, expect, it } from 'vitest';
import { echoesPrompt } from '../transcribe.js';

describe('echoesPrompt', () => {
  const vocab = ['Expert System', 'Problem Solving', 'human expert', 'Knowledge Base'];
  it('detects Whisper repeating the vocabulary prompt', () => {
    expect(echoesPrompt('Expert System คำตอบ เช่น Expert System, Problem Solving, human expert, Knowledge Base', vocab)).toBe(true);
  });
  it('does not flag a normal answer using the same terms', () => {
    expect(echoesPrompt('Expert System มี Knowledge Base กับ Inference Engine ใช้แก้ปัญหาแบบ human expert', vocab)).toBe(false);
  });
});
