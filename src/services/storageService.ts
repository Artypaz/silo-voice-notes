/**
 * Storage Service — localStorage-based persistence for voice notes.
 * This is a mock for the future native SQLite database.
 * Replace with @capacitor-community/sqlite or similar when going native.
 */

export interface StoredNote {
  id: string;
  timestamp: number;
  audioPath: string;
  rawTranscript: string;
  aiSummary: string | null;
  title?: string;
  duration?: string;
  segments?: { time: string; text: string }[];
}

const STORAGE_KEY = "silo_notes";

function readAll(): StoredNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(notes: StoredNote[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function getAllNotes(): StoredNote[] {
  return readAll().sort((a, b) => b.timestamp - a.timestamp);
}

export function getNoteById(id: string): StoredNote | undefined {
  return readAll().find((n) => n.id === id);
}

export function saveNote(note: StoredNote): void {
  const notes = readAll();
  const existingIndex = notes.findIndex((n) => n.id === note.id);
  if (existingIndex >= 0) {
    notes[existingIndex] = note;
  } else {
    notes.unshift(note);
  }
  writeAll(notes);
}

export function updateNote(id: string, updates: Partial<StoredNote>): void {
  const notes = readAll();
  const index = notes.findIndex((n) => n.id === id);
  if (index >= 0) {
    notes[index] = { ...notes[index], ...updates };
    writeAll(notes);
  }
}

export function deleteNote(id: string): void {
  writeAll(readAll().filter((n) => n.id !== id));
}

export function clearAllNotes(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Seed default mock notes if storage is empty.
 */
export function seedIfEmpty(): void {
  if (readAll().length > 0) return;

  const seeds: StoredNote[] = [
    {
      id: "1",
      timestamp: new Date("2025-03-11T14:32:00").getTime(),
      audioPath: "local://recordings/note-1.m4a",
      rawTranscript: "You are only here for a short visit. Don't hurry, don't worry, and be sure to smell the flowers along the way.",
      aiSummary: null,
      title: "Morning Reflection",
      duration: "00:10",
      segments: [
        { time: "0:00", text: "You are only here for a short visit." },
        { time: "0:04", text: "Don't hurry, don't worry, and be sure to smell the flowers along the way." },
      ],
    },
    {
      id: "2",
      timestamp: new Date("2025-03-11T12:15:00").getTime(),
      audioPath: "local://recordings/note-2.m4a",
      rawTranscript: "I use this app every day to capture voice memos and quick thoughts while walking. It's become an essential part of my workflow.",
      aiSummary: null,
      title: undefined,
      duration: "00:23",
      segments: [
        { time: "0:00", text: "I use this app every day to capture voice memos and quick thoughts while walking." },
        { time: "0:12", text: "It's become an essential part of my workflow." },
      ],
    },
    {
      id: "3",
      timestamp: new Date("2025-03-10T18:27:00").getTime(),
      audioPath: "local://recordings/note-3.m4a",
      rawTranscript: "Winter is coming and we need to prepare for it. We can start by gathering supplies and reinforcing the walls of the dead garden.",
      aiSummary: null,
      duration: "00:15",
      segments: [
        { time: "0:00", text: "Winter is coming and we need to prepare for it." },
        { time: "0:06", text: "We can start by gathering supplies and reinforcing the walls of the dead garden." },
      ],
    },
    {
      id: "4",
      timestamp: new Date("2025-03-10T09:44:00").getTime(),
      audioPath: "local://recordings/note-4.m4a",
      rawTranscript: "Meeting notes: discussed the new product launch timeline. Need to finalize designs by Friday and send to manufacturing by end of month.",
      aiSummary: null,
      title: undefined,
      duration: "00:42",
      segments: [
        { time: "0:00", text: "Meeting notes: discussed the new product launch timeline." },
        { time: "0:15", text: "Need to finalize designs by Friday and send to manufacturing by end of month." },
      ],
    },
  ];

  writeAll(seeds);
}
