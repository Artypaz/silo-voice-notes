import { useState, useCallback, useEffect } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Play, Pause, MoreHorizontal, Sparkles, Search, Trash2, Loader2, Copy, Star, Pencil, Share, RefreshCw, CheckCircle2 } from "lucide-react";
import NoteDetail from "./NoteDetail";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAllNotes, deleteNote as deleteStoredNote, seedIfEmpty, type StoredNote } from "@/services/storageService";
import { summarizeTranscript } from "@/services/aiService";
import { toast } from "sonner";

export interface VoiceNote {
  id: string;
  title?: string;
  date: string;
  time: string;
  transcript: string;
  duration: string;
  hasSummary: boolean;
  segments?: { time: string; text: string }[];
}

/** Convert a StoredNote to the UI VoiceNote shape */
function toVoiceNote(s: StoredNote): VoiceNote {
  const d = new Date(s.timestamp);
  return {
    id: s.id,
    title: s.title,
    date: d.toISOString().split("T")[0],
    time: d.toTimeString().slice(0, 5),
    transcript: s.rawTranscript,
    duration: s.duration || "00:00",
    hasSummary: !!s.aiSummary,
    segments: s.segments || [{ time: "0:00", text: s.rawTranscript }],
  };
}

const DELETE_THRESHOLD = -80;

const SwipeableNoteCard = ({
  note,
  index,
  playingId,
  onTogglePlay,
  onDelete,
  onOpen,
  onOpenSummary,
  summaryState,
  onSummarize,
  onCopy,
}: {
  note: VoiceNote;
  index: number;
  playingId: string | null;
  onTogglePlay: (id: string) => void;
  onDelete: (id: string) => void;
  onOpen: (note: VoiceNote) => void;
  onOpenSummary: (note: VoiceNote) => void;
  summaryState: "idle" | "loading" | "done";
  onSummarize: (id: string) => void;
  onCopy: (id: string) => void;
}) => {
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-100, -60, 0], [1, 0.8, 0]);
  const deleteScale = useTransform(x, [-100, -60, 0], [1, 0.8, 0.5]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < DELETE_THRESHOLD) {
      x.set(-90);
    } else {
      x.set(0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.25 }}
      className="relative overflow-hidden rounded-2xl"
    >
      {/* Delete button behind */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-20 bg-destructive rounded-2xl"
        style={{ opacity: deleteOpacity, scale: deleteScale }}
      >
        <button onClick={() => onDelete(note.id)} className="flex flex-col items-center gap-1">
          <Trash2 className="w-5 h-5 text-destructive-foreground" />
          <span className="text-[10px] font-medium text-destructive-foreground">Delete</span>
        </button>
      </motion.div>

      {/* Card */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -90, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className="glass rounded-2xl p-4 active:scale-[0.98] transition-transform relative z-10 cursor-grab"
        onClick={() => {
          if (x.get() > -10) onOpen(note);
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex flex-col min-w-0 flex-1">
            {note.title && (
              <h3 className="text-sm font-semibold text-foreground truncate">{note.title}</h3>
            )}
            <span className="text-xs text-muted-foreground font-mono">
              {note.date} {note.time}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 rounded-full hover:bg-muted/50 transition-colors shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCopy(note.id); }}>
                <Copy className="w-4 h-4 mr-2" /> Copy Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Star className="w-4 h-4 mr-2" /> Add to Favorites
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Share className="w-4 h-4 mr-2" /> Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <RefreshCw className="w-4 h-4 mr-2" /> Re-Transcribe
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Multi-Select
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Transcript */}
        <p className="text-sm text-foreground/90 leading-relaxed line-clamp-2 mb-3">
          {note.transcript}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {summaryState === "done" ? (
              <button
                onClick={(e) => { e.stopPropagation(); onOpenSummary(note); }}
                className="flex items-center gap-1 text-primary hover:opacity-80 transition-opacity"
              >
                <Sparkles className="w-3 h-3" />
                <span className="text-[10px] font-medium">Summarized</span>
              </button>
            ) : summaryState === "loading" ? (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                  </div>
                  <span className="text-[10px] font-medium">Summarizing…</span>
                </div>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSummarize(note.id);
                }}
                className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span className="text-[10px] font-medium">Summarize</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay(note.id);
              }}
              className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              {playingId === note.id ? (
                <Pause className="w-3 h-3 text-primary" />
              ) : (
                <Play className="w-3 h-3 text-primary ml-0.5" />
              )}
            </button>
            <span className="text-xs text-muted-foreground font-mono">
              {note.duration}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface VoiceNotesListProps {
  refreshKey?: number;
}

const VoiceNotesList = ({ refreshKey }: VoiceNotesListProps) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<VoiceNote | null>(null);
  const [openOnSummary, setOpenOnSummary] = useState(false);
  const [summaryStates, setSummaryStates] = useState<Record<string, "idle" | "loading" | "done">>({});

  // Load notes from localStorage
  const loadNotes = useCallback(() => {
    seedIfEmpty();
    const stored = getAllNotes();
    const voiceNotes = stored.map(toVoiceNote);
    setNotes(voiceNotes);

    const states: Record<string, "idle" | "loading" | "done"> = {};
    stored.forEach((n) => {
      states[n.id] = n.aiSummary ? "done" : "idle";
    });
    setSummaryStates(states);
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes, refreshKey]);

  const handleSummarize = useCallback(async (id: string) => {
    setSummaryStates((prev) => ({ ...prev, [id]: "loading" }));
    const note = notes.find((n) => n.id === id);
    if (note) {
      try {
        await summarizeTranscript(note.transcript);
        setSummaryStates((prev) => ({ ...prev, [id]: "done" }));
      } catch {
        setSummaryStates((prev) => ({ ...prev, [id]: "idle" }));
        toast.error("Failed to summarize");
      }
    }
  }, [notes]);

  const filteredNotes = notes.filter((n) =>
    n.transcript.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    deleteStoredNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleCopy = useCallback((id: string) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      navigator.clipboard.writeText(note.transcript);
      toast.success("Copied to clipboard");
    }
  }, [notes]);

  const handleOpen = useCallback((note: VoiceNote) => {
    setOpenOnSummary(false);
    setSelectedNote(note);
  }, []);

  const handleOpenSummary = useCallback((note: VoiceNote) => {
    setOpenOnSummary(true);
    setSelectedNote(note);
  }, []);

  const handleUpdateTitle = useCallback((id: string, newTitle: string) => {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, title: newTitle } : n));
    setSelectedNote((prev) => prev && prev.id === id ? { ...prev, title: newTitle } : prev);
  }, []);

  if (selectedNote) {
    return (
      <NoteDetail
        note={selectedNote}
        onBack={() => setSelectedNote(null)}
        isSummarized={summaryStates[selectedNote.id] === "done"}
        defaultTab={openOnSummary ? "summary" : "transcript"}
        onUpdateTitle={handleUpdateTitle}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 px-4 gap-3">
      {/* Search bar */}
      <div className="glass rounded-xl flex items-center gap-2 px-3 py-2.5 shrink-0">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pb-2 scrollbar-none">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">No notes yet</p>
            <p className="text-xs mt-1">Record your first voice note!</p>
          </div>
        ) : (
          filteredNotes.map((note, index) => (
            <SwipeableNoteCard
              key={note.id}
              note={note}
              index={index}
              playingId={playingId}
              onTogglePlay={(id) => setPlayingId(playingId === id ? null : id)}
              onDelete={handleDelete}
              onOpen={handleOpen}
              onOpenSummary={handleOpenSummary}
              summaryState={summaryStates[note.id] || "idle"}
              onSummarize={handleSummarize}
              onCopy={handleCopy}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default VoiceNotesList;
