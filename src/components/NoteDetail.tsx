import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, Search, MoreVertical, Copy, Clock, FileText, Type } from "lucide-react";
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
}

const NoteDetail = ({ note, onBack }: NoteDetailProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

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
        <span className="text-sm font-medium text-foreground">Transcript</span>
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

      {/* Transcript segments */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-none">
        <div className="space-y-6 pt-2">
          {filteredSegments.map((segment, i) => (
            <div key={i}>
              <span className="text-xs text-primary font-mono mb-1.5 block">{segment.time}</span>
              <p className="text-[15px] text-foreground leading-relaxed">
                {highlightText(segment.text)}
              </p>
            </div>
          ))}
        </div>
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
