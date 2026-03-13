import { Mic, FileText, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

type Tab = "record" | "notes" | "chat";

interface BottomTabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: typeof Mic }[] = [
  { id: "notes", label: "Notes", icon: FileText },
  { id: "record", label: "Record", icon: Mic },
  { id: "chat", label: "Chat", icon: MessageCircle },
];

const BottomTabBar = ({ activeTab, onTabChange }: BottomTabBarProps) => {
  return (
    <nav className="shrink-0 safe-bottom glass-strong">
      <div className="flex items-end justify-around px-4 pt-2 pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isRecord = tab.id === "record";

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-0.5 relative min-w-[64px] py-1 transition-colors"
            >
              {isRecord ? (
                <motion.div
                  className={`relative flex items-center justify-center w-14 h-14 -mt-3 rounded-full ${
                    isActive ? "bg-primary glow-primary" : "bg-muted"
                  }`}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <tab.icon
                    className={`w-6 h-6 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
                  />
                </motion.div>
              ) : (
                <tab.icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              )}
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? (isRecord ? "text-primary" : "text-primary") : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
