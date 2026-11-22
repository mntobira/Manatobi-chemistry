import { perUserKey } from '../utils/userStorageKeys';

export const MOCK_STORAGE_KEY_PREFIX = 'chem_mock_v1_';
export const mockStorageKey = (uid: string) => perUserKey(MOCK_STORAGE_KEY_PREFIX, uid);

export interface MockWritingEntry {
  text: string;
  checked: number[];
}

export interface MockInProgressSession {
  examId: string;
  answers: Record<string, number>;
  writing: Record<string, MockWritingEntry>;
  flags: string[];
  elapsedSec: number;
  timed: boolean;
  limitSec: number;
  currentIndex: number;
  updatedAt: number;
}

export interface MockSubmittedRecord {
  examId: string;
  correct: number;
  total: number;
  writingDone: number;
  writingTotal: number;
  elapsedSec: number;
  timed: boolean;
  answers: Record<string, number>;
  writing: Record<string, MockWritingEntry>;
  flags: string[];
  submittedAt: number;
}

export interface MockProgressState {
  version: 1;
  sessions: Record<string, MockInProgressSession>;
  history: Record<string, MockSubmittedRecord[]>;
}

export function emptyMockState(): MockProgressState {
  return { version: 1, sessions: {}, history: {} };
}

export function parseMockState(raw: string | null): MockProgressState {
  if (!raw) return emptyMockState();
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || typeof parsed !== 'object') return emptyMockState();
    const sessions: Record<string, MockInProgressSession> = {};
    if (parsed.sessions && typeof parsed.sessions === 'object' && !Array.isArray(parsed.sessions)) {
      for (const [id, val] of Object.entries(parsed.sessions)) {
        const s = val as MockInProgressSession;
        if (s && typeof s.examId === 'string' && s.answers && typeof s.answers === 'object') {
          sessions[id] = {
            examId: s.examId,
            answers: s.answers,
            writing: s.writing && typeof s.writing === 'object' ? s.writing : {},
            flags: Array.isArray(s.flags) ? s.flags.map(String) : [],
            elapsedSec: Number.isFinite(s.elapsedSec) ? Math.max(0, Math.floor(s.elapsedSec)) : 0,
            timed: Boolean(s.timed),
            limitSec: Number.isFinite(s.limitSec) ? Math.max(60, Math.floor(s.limitSec)) : 1800,
            currentIndex: Number.isFinite(s.currentIndex) ? Math.max(0, Math.floor(s.currentIndex)) : 0,
            updatedAt: Number.isFinite(s.updatedAt) ? s.updatedAt : Date.now(),
          };
        }
      }
    }
    const history: Record<string, MockSubmittedRecord[]> = {};
    if (parsed.history && typeof parsed.history === 'object' && !Array.isArray(parsed.history)) {
      for (const [id, list] of Object.entries(parsed.history)) {
        if (Array.isArray(list)) {
          history[id] = list
            .filter((r): r is MockSubmittedRecord => Boolean(r && typeof r === 'object' && typeof r.examId === 'string'))
            .slice(0, 5);
        }
      }
    }
    return { version: 1, sessions, history };
  } catch {
    return emptyMockState();
  }
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
