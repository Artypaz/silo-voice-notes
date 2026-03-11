import { useState, useCallback } from "react";
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

export interface VoiceNote {
  id: string;
  date: string;
  time: string;
  transcript: string;
  duration: string;
  hasSummary: boolean;
  segments?: { time: string; text: string }[];
}

const mockNotes: VoiceNote[] = [
  {
    id: "1",
    date: "2025-03-11",
    time: "14:32",
    transcript:
      "You are only here for a short visit. Don't hurry, don't worry, and be sure to smell the flowers along the way.",
    duration: "00:10",
    hasSummary: true,
    segments: [
      { time: "0:00", text: "You are only here for a short visit." },
      { time: "0:04", text: "Don't hurry, don't worry, and be sure to smell the flowers along the way." },
    ],
  },
  {
    id: "2",
    date: "2025-03-11",
    time: "12:15",
    transcript:
      "I use this app every day to capture voice memos and quick thoughts while walking. It's become an essential part of my workflow.",
    duration: "00:23",
    hasSummary: true,
    segments: [
      { time: "0:00", text: "I use this app every day to capture voice memos and quick thoughts while walking." },
      { time: "0:12", text: "It's become an essential part of my workflow." },
    ],
  },
  {
    id: "3",
    date: "2025-03-10",
    time: "18:27",
    transcript:
      "Winter is coming and we need to prepare for it. We can start by gathering supplies and reinforcing the walls of the dead garden.",
    duration: "00:15",
    hasSummary: false,
    segments: [
      { time: "0:00", text: "Winter is coming and we need to prepare for it." },
      { time: "0:06", text: "We can start by gathering supplies and reinforcing the walls of the dead garden." },
    ],
  },
  {
    id: "4",
    date: "2025-03-10",
    time: "09:44",
    transcript:
      "Meeting notes: discussed the new product launch timeline. Need to finalize designs by Friday and send to manufacturing by end of month.",
    duration: "00:42",
    hasSummary: true,
    segments: [
      { time: "0:00", text: "Meeting notes: discussed the new product launch timeline." },
      { time: "0:15", text: "Need to finalize designs by Friday and send to manufacturing by end of month." },
    ],
  },
];

const DELETE_THRESHOLD = -80;

const SwipeableNoteCard = ({
  note,
  index,
  playingId,
  onTogglePlay,
  onDelete,
  onOpen,
  summaryState,
  onSummarize,
}: {
  note: VoiceNote;
  index: number;
  playingId: string | null;
  onTogglePlay: (id: string) => void;
  onDelete: (id: string) => void;
  onOpen: (note: VoiceNote) => void;
  summaryState: "idle" | "loading" | "done";
  onSummarize: (id: string) => void;
  onCopy: (id: string) => void;
}) => {
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-100, -60, 0], [1, 0.8, 0]);
  const deleteScale = useTransform(x, [-100, -60, 0], [1, 0.8, 0.5]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < DELETE_THRESHOLD) {
      // Snap to show delete
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
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-mono">
            {note.date} {note.time}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 rounded-full hover:bg-muted/50 transition-colors"
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
        <p className="text-sm text-foreground/90 leading-relaxed line-clamp-3 mb-3">
          {note.transcript}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {summaryState === "done" ? (
              <div className="flex items-center gap-1 text-primary">
                <Sparkles className="w-3 h-3" />
                <span className="text-[10px] font-medium">Summarized</span>
              </div>
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

const VoiceNotesList = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState(mockNotes);
  const [selectedNote, setSelectedNote] = useState<VoiceNote | null>(null);
  const [summaryStates, setSummaryStates] = useState<Record<string, "idle" | "loading" | "done">>(() => {
    const initial: Record<string, "idle" | "loading" | "done"> = {};
    mockNotes.forEach((n) => {
      initial[n.id] = n.hasSummary ? "done" : "idle";
    });
    return initial;
  });

  const handleSummarize = useCallback((id: string) => {
    setSummaryStates((prev) => ({ ...prev, [id]: "loading" }));
    setTimeout(() => {
      setSummaryStates((prev) => ({ ...prev, [id]: "done" }));
    }, 2200);
  }, []);

  const filteredNotes = notes.filter((n) =>
    n.transcript.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  if (selectedNote) {
    return <NoteDetail note={selectedNote} onBack={() => setSelectedNote(null)} />;
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
        {filteredNotes.map((note, index) => (
          <SwipeableNoteCard
            key={note.id}
            note={note}
            index={index}
            playingId={playingId}
            onTogglePlay={(id) => setPlayingId(playingId === id ? null : id)}
            onDelete={handleDelete}
            onOpen={setSelectedNote}
            summaryState={summaryStates[note.id] || "idle"}
            onSummarize={handleSummarize}
          />
        ))}
      </div>
    </div>
  );
};

export default VoiceNotesList;
