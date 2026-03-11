import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, MoreHorizontal, Sparkles, Search } from "lucide-react";

interface VoiceNote {
  id: string;
  date: string;
  time: string;
  transcript: string;
  duration: string;
  hasSummary: boolean;
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
  },
  {
    id: "2",
    date: "2025-03-11",
    time: "12:15",
    transcript:
      "I use this app every day to capture voice memos and quick thoughts while walking. It's become an essential part of my workflow.",
    duration: "00:23",
    hasSummary: true,
  },
  {
    id: "3",
    date: "2025-03-10",
    time: "18:27",
    transcript:
      "Winter is coming and we need to prepare for it. We can start by gathering supplies and reinforcing the walls of the dead garden.",
    duration: "00:15",
    hasSummary: false,
  },
  {
    id: "4",
    date: "2025-03-10",
    time: "09:44",
    transcript:
      "Meeting notes: discussed the new product launch timeline. Need to finalize designs by Friday and send to manufacturing by end of month.",
    duration: "00:42",
    hasSummary: true,
  },
];

const VoiceNotesList = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = mockNotes.filter((n) =>
    n.transcript.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.25 }}
            className="glass rounded-2xl p-4 active:scale-[0.98] transition-transform"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-mono">
                {note.date} {note.time}
              </span>
              <button className="p-1 rounded-full hover:bg-muted/50 transition-colors">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Transcript */}
            <p className="text-sm text-foreground/90 leading-relaxed line-clamp-3 mb-3">
              {note.transcript}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {note.hasSummary && (
                  <div className="flex items-center gap-1 text-primary">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-[10px] font-medium">Summarized</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPlayingId(playingId === note.id ? null : note.id)
                  }
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
        ))}
      </div>
    </div>
  );
};

export default VoiceNotesList;
