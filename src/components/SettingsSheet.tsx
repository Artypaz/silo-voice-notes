import { X, Globe, Moon, Sun, Mic, Shield, Database, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
}

const SettingsSheet = ({ open, onClose }: SettingsSheetProps) => {
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setDarkMode(!darkMode);
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
            onClick={onClose}
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

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Settings</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-muted/50 transition-colors">
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
                        Aura works completely offline — even in airplane mode. Your
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
                    <SettingRow
                      icon={<Database className="w-4 h-4" />}
                      label="Data Management"
                      trailing={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    />
                  </div>
                </div>
              </div>
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
  trailing,
}: {
  icon: React.ReactNode;
  label: string;
  trailing?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between px-4 py-3">
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
    {trailing}
  </div>
);

export default SettingsSheet;
