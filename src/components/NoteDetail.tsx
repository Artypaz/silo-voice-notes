import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { ArrowLeft, Play, Pause, Search, MoreVertical, Copy, Clock, FileText, Type, Sparkles, ListChecks, MessageSquareText, Pencil, Check, Plus, X, Trash2, Minus } from "lucide-react";
import type { VoiceNote } from "./VoiceNotesList";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface NoteDetailProps {
  note: VoiceNote;
  onBack: () => void;
  isSummarized?: boolean;
  onSeekTo?: (time: string) => void;
  defaultTab?: "transcript" | "summary";
  onUpdateTitle?: (id: string, title: string) => void;
}

const defaultSummary = {
  overview: "A reflective note about taking life slowly and appreciating the moment. Emphasizes the importance of not rushing through experiences.",
  actionItems: [
    "Practice mindfulness during daily activities",
    "Take time to appreciate small moments",
    "Avoid over-scheduling the week",
  ],
};

const NoteDetail = ({ note, onBack, isSummarized = false, onSeekTo, defaultTab, onUpdateTitle }: NoteDetailProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [fontSize, setFontSize] = useState(15);
  const [activeTab, setActiveTab] = useState<"transcript" | "summary">(
    defaultTab || "transcript"
  );
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);
  const [title, setTitle] = useState(note.title || "");
  const [editingTitle, setEditingTitle] = useState(false);

  // Swipe gesture
  const dragX = useMotionValue(0);

  // Editable summary state
  const [overview, setOverview] = useState(defaultSummary.overview);
  const [actionItems, setActionItems] = useState(defaultSummary.actionItems);
  const [editingOverview, setEditingOverview] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editBuffer, setEditBuffer] = useState("");
  const [newItemText, setNewItemText] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);

  const segments = note.segments || [{ time: "0:00", text: note.transcript }];

  const filteredSegments = searchQuery
    ? segments.filter((s) => s.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : segments;

  // Search within summary
  const overviewMatchesSearch = !searchQuery || overview.toLowerCase().includes(searchQuery.toLowerCase());
  const filteredActionItems = searchQuery
    ? actionItems.filter((item) => item.toLowerCase().includes(searchQuery.toLowerCase()))
    : actionItems;

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

  const copyOverview = useCallback(() => {
    navigator.clipboard.writeText(overview);
    toast.success("Overview copied");
  }, [overview]);

  const copyActionItems = useCallback(() => {
    const text = actionItems.map((item, i) => `${i + 1}. ${item}`).join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Action items copied");
  }, [actionItems]);

  const startEditOverview = () => {
    setEditBuffer(overview);
    setEditingOverview(true);
  };

  const saveOverview = () => {
    setOverview(editBuffer);
    setEditingOverview(false);
    toast.success("Overview updated");
  };

  const startEditItem = (index: number) => {
    setEditBuffer(actionItems[index]);
    setEditingItemIndex(index);
  };

  const saveItem = () => {
    if (editingItemIndex !== null) {
      setActionItems((prev) => prev.map((item, i) => (i === editingItemIndex ? editBuffer : item)));
      setEditingItemIndex(null);
      toast.success("Action item updated");
    }
  };

  const deleteItem = (index: number) => {
    setActionItems((prev) => prev.filter((_, i) => i !== index));
    setEditingItemIndex(null);
  };

  const addItem = () => {
    if (newItemText.trim()) {
      setActionItems((prev) => [...prev, newItemText.trim()]);
      setNewItemText("");
      setShowAddItem(false);
      toast.success("Action item added");
    }
  };

  const cancelAddItem = () => {
    setNewItemText("");
    setShowAddItem(false);
  };

  const handleSegmentClick = (index: number, time: string) => {
    setActiveSegmentIndex(index);
    onSeekTo?.(time);
  };

  const handleSwipeEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (!isSummarized) return;
    const threshold = 50;
    const swipe = info.offset.x;
    const velocity = info.velocity.x;

    if (swipe < -threshold || velocity < -500) {
      // Swiped left → go to transcript
      if (activeTab === "summary") setActiveTab("transcript");
    } else if (swipe > threshold || velocity > 500) {
      // Swiped right → go to summary
      if (activeTab === "transcript") setActiveTab("summary");
    }
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
        <div className="flex flex-col items-center">
          {editingTitle ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                setEditingTitle(false);
                onUpdateTitle?.(note.id, title);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditingTitle(false);
                  onUpdateTitle?.(note.id, title);
                }
              }}
              autoFocus
              placeholder="Add title..."
              className="text-sm font-medium text-foreground bg-transparent text-center outline-none border-b border-primary/30 focus:border-primary pb-0.5 placeholder:text-muted-foreground"
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="group flex flex-col items-center"
            >
              {title ? (
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{title}</span>
              ) : (
                <span className="text-xs text-muted-foreground hover:text-foreground transition-colors">+ Add title</span>
              )}
            </button>
          )}
          <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {note.date} · {note.time}
          </span>
        </div>
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

      {/* Swipeable tab indicator */}
      {isSummarized && (
        <div className="flex items-center mx-4 mb-2 shrink-0 border-b border-border">
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all duration-200 border-b-2 -mb-px ${
              activeTab === "summary"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Summary
          </button>
          <button
            onClick={() => setActiveTab("transcript")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all duration-200 border-b-2 -mb-px ${
              activeTab === "transcript"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
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
              placeholder={activeTab === "summary" ? "Search summary..." : "Search transcript..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        </motion.div>
      )}

      {/* Content - swipeable */}
      <motion.div
        className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-none"
        drag={isSummarized ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleSwipeEnd}
        style={{ x: dragX, touchAction: "pan-y" }}
      >
        <AnimatePresence mode="wait">
          {activeTab === "summary" && isSummarized ? (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
              className="space-y-4 pt-2"
            >
              {/* Overview */}
              {(overviewMatchesSearch || !searchQuery) && (
                <div className="glass rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">Overview</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {editingOverview ? (
                        <button onClick={saveOverview} className="p-1.5 rounded-full hover:bg-muted/50 transition-colors">
                          <Check className="w-3.5 h-3.5 text-primary" />
                        </button>
                      ) : (
                        <>
                          <button onClick={startEditOverview} className="p-1.5 rounded-full hover:bg-muted/50 transition-colors">
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                          <button onClick={copyOverview} className="p-1.5 rounded-full hover:bg-muted/50 transition-colors">
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {editingOverview ? (
                    <textarea
                      value={editBuffer}
                      onChange={(e) => setEditBuffer(e.target.value)}
                      autoFocus
                      rows={4}
                      className="w-full bg-muted/30 rounded-xl text-sm text-foreground/90 leading-relaxed p-2 outline-none resize-none border border-primary/20 focus:border-primary/50 transition-colors"
                    />
                  ) : (
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {highlightText(overview)}
                    </p>
                  )}
                </div>
              )}

              {/* Action Items */}
              {(filteredActionItems.length > 0 || !searchQuery) && (
                <div className="glass rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">Action Items</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setShowAddItem(!showAddItem)} className="p-1.5 rounded-full hover:bg-muted/50 transition-colors">
                        <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={copyActionItems} className="p-1.5 rounded-full hover:bg-muted/50 transition-colors">
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {(searchQuery ? filteredActionItems : actionItems).map((item, i) => {
                      const realIndex = searchQuery ? actionItems.indexOf(item) : i;
                      return (
                        <div key={realIndex} className="flex items-start gap-2.5 group">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-primary">{realIndex + 1}</span>
                          </div>
                          {editingItemIndex === realIndex ? (
                            <div className="flex-1 flex items-center gap-1.5">
                              <input
                                value={editBuffer}
                                onChange={(e) => setEditBuffer(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => e.key === "Enter" && saveItem()}
                                className="flex-1 bg-muted/30 rounded-lg text-sm text-foreground/90 px-2 py-1 outline-none border border-primary/20 focus:border-primary/50 transition-colors"
                              />
                              <button onClick={saveItem} className="p-1 rounded-full hover:bg-muted/50">
                                <Check className="w-3.5 h-3.5 text-primary" />
                              </button>
                              <button onClick={() => setEditingItemIndex(null)} className="p-1 rounded-full hover:bg-muted/50">
                                <X className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex-1 flex items-start justify-between">
                              <p className="text-sm text-foreground/90 leading-relaxed flex-1">
                                {highlightText(item)}
                              </p>
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                                <button onClick={() => startEditItem(realIndex)} className="p-1 rounded-full hover:bg-muted/50">
                                  <Pencil className="w-3 h-3 text-muted-foreground" />
                                </button>
                                <button onClick={() => deleteItem(realIndex)} className="p-1 rounded-full hover:bg-muted/50">
                                  <Trash2 className="w-3 h-3 text-destructive" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Add new item */}
                    {showAddItem && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="flex items-center gap-2 pt-1"
                      >
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Plus className="w-3 h-3 text-primary" />
                        </div>
                        <input
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") addItem();
                            if (e.key === "Escape") cancelAddItem();
                          }}
                          placeholder="New action item..."
                          autoFocus
                          className="flex-1 bg-muted/30 rounded-lg text-sm text-foreground/90 px-2 py-1 outline-none border border-primary/20 focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
                        />
                        <button onClick={addItem} className="p-1 rounded-full hover:bg-muted/50">
                          <Check className="w-3.5 h-3.5 text-primary" />
                        </button>
                        <button onClick={cancelAddItem} className="p-1 rounded-full hover:bg-muted/50">
                          <X className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="transcript"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.15 }}
              className="space-y-1 pt-2"
            >
              {filteredSegments.map((segment, i) => (
                <button
                  key={i}
                  onClick={() => handleSegmentClick(i, segment.time)}
                  className={`w-full text-left rounded-xl px-3 py-3 transition-colors duration-200 ${
                    activeSegmentIndex === i
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/30"
                  }`}
                >
                  <span className={`text-xs font-mono mb-1.5 block transition-colors ${
                    activeSegmentIndex === i ? "text-primary font-semibold" : "text-primary/70"
                  }`}>
                    {segment.time}
                  </span>
                  <p className={`text-[15px] leading-relaxed transition-colors ${
                    activeSegmentIndex === i ? "text-primary" : "text-foreground"
                  }`}>
                    {highlightText(segment.text)}
                  </p>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

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
