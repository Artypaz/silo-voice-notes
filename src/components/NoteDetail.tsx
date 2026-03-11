import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Pause, Search, MoreVertical, Copy, Clock, FileText, Type, Sparkles, ListChecks, MessageSquareText } from "lucide-react";
import type { VoiceNote } from "./VoiceNotesList";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NoteDetailProps {
  note: VoiceNote;
  onBack: () => void;
  isSummarized?: boolean;
}

const mockSummary = {
  overview: "A reflective note about taking life slowly and appreciating the moment. Emphasizes the importance of not rushing through experiences.",
  actionItems: [
    "Practice mindfulness during daily activities",
    "Take time to appreciate small moments",
    "Avoid over-scheduling the week",
  ],
};

const NoteDetail = ({ note, onBack, isSummarized = false }: NoteDetailProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<"transcript" | "summary">(
    isSummarized ? "summary" : "transcript"
  );

  const segments = note.segments || [{ time: "0:00", text: note.transcript }];

  const filteredSegments = searchQuery
    ? segments.filter((s) => s.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : segments;

  const highlightText = (text: string) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-primary/30 text-foreground rounded-sm px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col min-h-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <span className="text-sm font-medium text-foreground">
          {note.date} · {note.time}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <Search className="w-4.5 h-4.5 text-muted-foreground" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-full hover:bg-muted/50 transition-colors">
                <MoreVertical className="w-4.5 h-4.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem>
                <Copy className="w-4 h-4 mr-2" /> Copy Text
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Clock className="w-4 h-4 mr-2" /> Copy with Timestamps
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileText className="w-4 h-4 mr-2" /> Export SRT
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="w-4 h-4 mr-2" /> Export TXT
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Type className="w-4 h-4 mr-2" /> Font Size
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tab switcher - only show if summarized */}
      {isSummarized && (
        <div className="flex items-center gap-1 px-4 pb-2 shrink-0">
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === "summary"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Summary
          </button>
          <button
            onClick={() => setActiveTab("transcript")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === "transcript"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquareText className="w-3 h-3" />
            Transcript
          </button>
        </div>
      )}

      {/* Search bar */}
      {showSearch && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-2"
        >
          <div className="glass rounded-xl flex items-center gap-2 px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-none">
        <AnimatePresence mode="wait">
          {activeTab === "summary" && isSummarized ? (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-4 pt-2"
            >
              {/* Overview */}
              <div className="glass rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Overview</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {mockSummary.overview}
                </p>
              </div>

              {/* Action Items */}
              <div className="glass rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ListChecks className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Action Items</span>
                </div>
                <div className="space-y-2.5">
                  {mockSummary.actionItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="transcript"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-6 pt-2"
            >
              {filteredSegments.map((segment, i) => (
                <div key={i}>
                  <span className="text-xs text-primary font-mono mb-1.5 block">{segment.time}</span>
                  <p className="text-[15px] text-foreground leading-relaxed">
                    {highlightText(segment.text)}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Playback bar */}
      <div className="shrink-0 px-4 pb-4 safe-bottom">
        <div className="glass-strong rounded-2xl p-3 flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-primary-foreground" />
            ) : (
              <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
            )}
          </button>

          {/* Waveform placeholder */}
          <div className="flex-1 flex items-center gap-[2px] h-8">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-full bg-muted-foreground/30"
                style={{ height: `${Math.random() * 24 + 4}px` }}
              />
            ))}
          </div>

          <span className="text-xs text-muted-foreground font-mono shrink-0">
            00:00 / {note.duration}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default NoteDetail;
