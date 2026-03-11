import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Pause, Play } from "lucide-react";

const RecordButton = () => {
  const [state, setState] = useState<"idle" | "recording" | "paused">("idle");
  const [elapsed, setElapsed] = useState(0);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleRecord = () => {
    if (state === "idle") {
      setState("recording");
      setElapsed(0);
      // In real app, start recording here
    } else if (state === "recording") {
      setState("paused");
    } else {
      setState("recording");
    }
  };

  const handleStop = () => {
    setState("idle");
    setElapsed(0);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
      {/* Waveform / Status */}
      <div className="flex flex-col items-center gap-3">
        <AnimatePresence mode="wait">
          {state === "idle" ? (
            <motion.p
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-muted-foreground text-sm font-medium"
            >
              Tap to start recording
            </motion.p>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              {/* Waveform bars */}
              <div className="flex items-center gap-[3px] h-8">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] rounded-full bg-primary"
                    animate={
                      state === "recording"
                        ? {
                            height: [4, Math.random() * 28 + 4, 4],
                          }
                        : { height: 4 }
                    }
                    transition={{
                      duration: 0.6 + Math.random() * 0.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.05,
                    }}
                    style={{ height: 4 }}
                  />
                ))}
              </div>
              <span className="text-foreground font-mono text-2xl font-light tracking-wider">
                {formatTime(elapsed)}
              </span>
              <span className={`text-xs font-medium ${state === "recording" ? "text-primary" : "text-muted-foreground"}`}>
                {state === "recording" ? "Recording..." : "Paused"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main record button */}
      <div className="relative flex items-center justify-center">
        {/* Pulse rings when recording */}
        <AnimatePresence>
          {state === "recording" && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-[120px] h-[120px] rounded-full border border-primary/20"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.6,
                    ease: "easeOut",
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleRecord}
          className={`relative z-10 w-[120px] h-[120px] rounded-full flex items-center justify-center transition-colors ${
            state === "idle"
              ? "bg-primary glow-primary"
              : state === "recording"
              ? "bg-primary glow-primary"
              : "bg-muted"
          }`}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <AnimatePresence mode="wait">
            {state === "idle" ? (
              <motion.div key="mic" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                <Mic className="w-10 h-10 text-primary-foreground" />
              </motion.div>
            ) : state === "recording" ? (
              <motion.div key="pause" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                <Pause className="w-10 h-10 text-primary-foreground" />
              </motion.div>
            ) : (
              <motion.div key="play" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                <Play className="w-10 h-10 text-foreground ml-1" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Stop button (when recording/paused) */}
      <AnimatePresence>
        {state !== "idle" && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleStop}
            className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            <Square className="w-5 h-5 text-destructive-foreground fill-current" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Privacy badge */}
      <div className="glass rounded-full px-4 py-2 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-xs text-muted-foreground font-medium">100% Local · Private</span>
      </div>
    </div>
  );
};

export default RecordButton;
