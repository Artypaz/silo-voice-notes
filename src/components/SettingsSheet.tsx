import { X, Globe, Moon, Sun, Mic, Shield, Database, ChevronRight, ArrowLeft, Trash2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
}

type AutoDeleteOption = "off" | "30" | "90" | "365";

const SettingsSheet = ({ open, onClose }: SettingsSheetProps) => {
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [view, setView] = useState<"main" | "data">("main");
  const [autoDelete, setAutoDelete] = useState<AutoDeleteOption>("off");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setDarkMode(!darkMode);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setView("main");
      setShowClearConfirm(false);
    }, 300);
  };

  const handleClearAll = () => {
    // TODO: implement actual data clearing
    setShowClearConfirm(false);
  };

  const autoDeleteLabels: Record<AutoDeleteOption, string> = {
    off: "Off",
    "30": "30 Days",
    "90": "90 Days",
    "365": "1 Year",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto"
          >
            <div className="glass-strong rounded-t-3xl px-5 pt-3 pb-8 safe-bottom">
              {/* Handle */}
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

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
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-foreground">Settings</h2>
                      <button onClick={handleClose} className="p-2 rounded-full hover:bg-muted/50 transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                      </button>
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
                              label="Data Management"
                              trailing={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="data"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Data Management Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setView("main"); setShowClearConfirm(false); }}
                          className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors"
                        >
                          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <h2 className="text-lg font-semibold text-foreground">Data Management</h2>
                      </div>
                      <button onClick={handleClose} className="p-2 rounded-full hover:bg-muted/50 transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>

                    <div className="space-y-5">
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
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
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
