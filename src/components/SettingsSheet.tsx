import { X, Globe, Moon, Sun, Mic, Shield, Database, ChevronRight, ArrowLeft, Trash2, Clock, HardDrive, FileText, Play, Activity } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import { getSettings, updateSettings } from "@/services/settingsService";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
}

type AutoDeleteOption = "off" | "30" | "90" | "365";
type StorageFilter = "all" | "recordings" | "largest";

interface MockRecording {
  id: string;
  sizeMB: number;
  title: string;
  date: string;
}

const mockRecordings: MockRecording[] = [
  { id: "1", sizeMB: 67.5, title: "Saved recording", date: "1/12/26, 05:25" },
  { id: "2", sizeMB: 16.5, title: "All right, are there any outstanding questions that anyone has...", date: "1/9/26, 08:23" },
  { id: "3", sizeMB: 13.1, title: "And I did share it with the team. However, I do still have some...", date: "1/7/26, 13:25" },
  { id: "4", sizeMB: 8.2, title: "Meeting notes from standup", date: "1/5/26, 09:00" },
  { id: "5", sizeMB: 4.3, title: "Quick voice memo about project timeline", date: "1/3/26, 14:12" },
];

const SWIPE_THRESHOLD = 80;

const SettingsSheet = ({ open, onClose }: SettingsSheetProps) => {
  const [settings, setSettings] = useState(() => getSettings());
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [view, setView] = useState<"main" | "data" | "memory">("main");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [storageFilter, setStorageFilter] = useState<StorageFilter>("all");

  // Sync settings from localStorage when sheet opens
  useEffect(() => {
    if (open) setSettings(getSettings());
  }, [open]);

  const updateSetting = useCallback((updates: Partial<typeof settings>) => {
    const next = updateSettings(updates);
    setSettings(next);
  }, []);

  // Swipe-back gesture
  const dragX = useMotionValue(0);
  const panelX = useTransform(dragX, [0, 400], [0, 400]);
  const opacity = useTransform(dragX, [0, 300], [1, 0.3]);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setDarkMode(!darkMode);
  };

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      setView("main");
      setShowClearConfirm(false);
    }, 300);
  }, [onClose]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 500) {
      handleClose();
    }
  }, [handleClose]);

  const handleClearAll = () => {
    setShowClearConfirm(false);
  };

  const autoDeleteLabels: Record<AutoDeleteOption, string> = {
    off: "Off",
    "30": "30 Days",
    "90": "90 Days",
    "365": "1 Year",
  };

  const totalStorageMB = mockRecordings.reduce((sum, r) => sum + r.sizeMB, 0);
  const recordingCount = mockRecordings.length;

  const sortedRecordings = [...mockRecordings].sort((a, b) =>
    storageFilter === "largest" ? b.sizeMB - a.sizeMB : 0
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={{ left: 0, right: 0.6 }}
          onDragEnd={handleDragEnd}
          style={{ x: panelX, opacity }}
          className="fixed inset-0 z-50 bg-background max-w-[430px] mx-auto flex flex-col overflow-hidden"
        >
          {/* Swipe indicator bar at left edge */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 rounded-r-full bg-muted-foreground/20 z-10" />

          <div className="flex-1 flex flex-col min-h-0 safe-top safe-bottom">
            <div className="overflow-y-auto flex-1 min-h-0 px-5 pb-8">
              <AnimatePresence mode="wait">
                {view === "main" ? (
                  <motion.div
                    key="main"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 pt-4">
                      <button
                        onClick={handleClose}
                        className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                      </button>
                      <h2 className="text-lg font-semibold text-foreground">Settings</h2>
                      <div className="w-9" /> {/* Spacer for centering */}
                    </div>

                    {/* Settings groups */}
                    <div className="space-y-5">
                      {/* General */}
                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                          General
                        </h3>
                        <div className="glass rounded-2xl divide-y divide-border">
                          <SettingRow
                            icon={darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                            label="Dark Mode"
                            trailing={
                              <button
                                onClick={toggleDarkMode}
                                className={`relative w-12 h-7 rounded-full transition-colors ${
                                  darkMode ? "bg-primary" : "bg-muted"
                                }`}
                              >
                                <motion.div
                                  className="absolute top-0.5 w-6 h-6 rounded-full bg-card shadow-sm"
                                  animate={{ left: darkMode ? 22 : 2 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                />
                              </button>
                            }
                          />
                          <SettingRow
                            icon={<Globe className="w-4 h-4" />}
                            label="Language"
                            trailing={
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <span className="text-sm">English</span>
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            }
                          />
                          <SettingRow
                            icon={<Mic className="w-4 h-4" />}
                            label="Transcription Mode"
                            trailing={
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <span className="text-sm">Accurate</span>
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            }
                          />
                          <SettingRow
                            icon={<Play className="w-4 h-4" />}
                            label="Auto Record on Open"
                            trailing={
                              <button
                                onClick={() => updateSetting({ autoRecord: !settings.autoRecord })}
                                className={`relative w-12 h-7 rounded-full transition-colors ${
                                  settings.autoRecord ? "bg-primary" : "bg-muted"
                                }`}
                              >
                                <motion.div
                                  className="absolute top-0.5 w-6 h-6 rounded-full bg-card shadow-sm"
                                  animate={{ left: settings.autoRecord ? 22 : 2 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                />
                              </button>
                            }
                          />
                          <SettingRow
                            icon={<HardDrive className="w-4 h-4" />}
                            label="Save Audio Recording"
                            trailing={
                              <button
                                onClick={() => updateSetting({ saveAudio: !settings.saveAudio })}
                                className={`relative w-12 h-7 rounded-full transition-colors ${
                                  settings.saveAudio ? "bg-primary" : "bg-muted"
                                }`}
                              >
                                <motion.div
                                  className="absolute top-0.5 w-6 h-6 rounded-full bg-card shadow-sm"
                                  animate={{ left: saveAudio ? 22 : 2 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                />
                              </button>
                            }
                          />
                        </div>
                      </div>

                      {/* Privacy */}
                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                          Privacy
                        </h3>
                        <div className="glass rounded-2xl p-4">
                          <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Silo works completely offline — even in airplane mode. Your
                              recordings never leave your device, and we never request
                              network access. Your privacy is absolutely protected.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Data */}
                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                          Data
                        </h3>
                        <div className="glass rounded-2xl divide-y divide-border">
                          <button onClick={() => setView("data")} className="w-full">
                            <SettingRow
                              icon={<Database className="w-4 h-4" />}
                              label="Disk Management"
                              trailing={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : view === "data" ? (
                  <motion.div
                    key="data"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Data Management Header */}
                    <div className="flex items-center justify-between mb-6 pt-4">
                      <button
                        onClick={() => { setView("main"); setShowClearConfirm(false); }}
                        className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                      </button>
                      <h2 className="text-lg font-semibold text-foreground">Disk Management</h2>
                      <div className="w-9" />
                    </div>

                    <div className="space-y-5">
                      {/* Memory / Storage */}
                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                          Disk
                        </h3>
                        <div className="glass rounded-2xl divide-y divide-border">
                          <button onClick={() => setView("memory")} className="w-full">
                            <SettingRow
                              icon={<HardDrive className="w-4 h-4" />}
                              label="Memory"
                              trailing={
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <span className="text-sm">{totalStorageMB.toFixed(1)} MB</span>
                                  <ChevronRight className="w-4 h-4" />
                                </div>
                              }
                            />
                          </button>
                        </div>
                      </div>

                      {/* Auto-delete */}
                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                          Auto-Delete Old Messages
                        </h3>
                        <div className="glass rounded-2xl divide-y divide-border">
                          {(["off", "30", "90", "365"] as AutoDeleteOption[]).map((option) => (
                            <button
                              key={option}
                              onClick={() => setAutoDelete(option)}
                              className="w-full"
                            >
                              <SettingRow
                                icon={<Clock className="w-4 h-4" />}
                                label={autoDeleteLabels[option]}
                                trailing={
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                      autoDelete === option
                                        ? "border-primary bg-primary"
                                        : "border-muted-foreground/40"
                                    }`}
                                  >
                                    {autoDelete === option && (
                                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                                    )}
                                  </div>
                                }
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Clear All */}
                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                          Danger Zone
                        </h3>
                        {!showClearConfirm ? (
                          <button
                            onClick={() => setShowClearConfirm(true)}
                            className="w-full glass rounded-2xl"
                          >
                            <SettingRow
                              icon={<Trash2 className="w-4 h-4 text-destructive" />}
                              label="Clear All Data"
                              labelClassName="text-destructive"
                              trailing={<ChevronRight className="w-4 h-4 text-destructive" />}
                            />
                          </button>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass rounded-2xl p-4 border border-destructive/30"
                          >
                            <div className="flex items-start gap-3 mb-4">
                              <Trash2 className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-foreground mb-1">
                                  Delete all data?
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  This will permanently delete all your voice notes, transcriptions,
                                  and chat history. This action cannot be undone.
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowClearConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleClearAll}
                                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                              >
                                Delete Everything
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="memory"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Memory Header */}
                    <div className="flex items-center justify-between mb-6 pt-4">
                      <button
                        onClick={() => setView("data")}
                        className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                      </button>
                      <h2 className="text-lg font-semibold text-foreground">Memory</h2>
                      <div className="w-9" />
                    </div>

                    {/* Total Storage Card */}
                    <div className="glass rounded-2xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Total Memory</span>
                      </div>
                      <div className="h-px bg-border mb-3" />
                      <div className="flex flex-col items-center py-2">
                        <Activity className="w-5 h-5 text-primary mb-1" />
                        <span className="text-sm font-semibold text-foreground">{totalStorageMB.toFixed(1)} MB</span>
                        <span className="text-xs text-muted-foreground">{recordingCount}</span>
                      </div>
                    </div>

                    {/* Keep transcription toggle */}
                    <div className="glass rounded-2xl p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Keep transcription when deleting</p>
                          <p className="text-xs text-muted-foreground">Only delete audio files, keep text</p>
                        </div>
                        <button
                          onClick={() => setKeepTranscription(!keepTranscription)}
                          className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${
                            keepTranscription ? "bg-primary" : "bg-muted"
                          }`}
                        >
                          <motion.div
                            className="absolute top-0.5 w-6 h-6 rounded-full bg-card shadow-sm"
                            animate={{ left: keepTranscription ? 22 : 2 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Filter tabs */}
                    <div className="flex gap-2 mb-4">
                      {([
                        { key: "all" as StorageFilter, label: `All ${recordingCount}` },
                        { key: "recordings" as StorageFilter, label: `Recordings ${recordingCount}` },
                        { key: "largest" as StorageFilter, label: "Largest" },
                      ]).map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setStorageFilter(key)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            storageFilter === key
                              ? "bg-primary text-primary-foreground"
                              : "glass text-muted-foreground"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Recording list */}
                    <div className="space-y-2">
                      {sortedRecordings.map((recording) => (
                        <div key={recording.id} className="glass rounded-2xl p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-primary mb-0.5">{recording.sizeMB} MB</p>
                              <p className="text-sm text-foreground truncate">{recording.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{recording.date}</p>
                            </div>
                            <button className="p-2 shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                              <Play className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SettingRow = ({
  icon,
  label,
  labelClassName,
  trailing,
}: {
  icon: React.ReactNode;
  label: string;
  labelClassName?: string;
  trailing?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between px-4 py-3">
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground">{icon}</span>
      <span className={`text-sm font-medium ${labelClassName || "text-foreground"}`}>{label}</span>
    </div>
    {trailing}
  </div>
);

export default SettingsSheet;
