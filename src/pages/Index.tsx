import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Settings } from "lucide-react";
import RecordButton from "@/components/RecordButton";
import VoiceNotesList from "@/components/VoiceNotesList";
import ChatView from "@/components/ChatView";
import BottomTabBar from "@/components/BottomTabBar";
import SettingsSheet from "@/components/SettingsSheet";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"record" | "notes" | "chat">("record");
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex flex-col h-[100dvh] bg-background max-w-[430px] mx-auto relative overflow-hidden">
      {/* Header */}
      <header className="safe-top px-5 pb-2 flex items-end justify-between shrink-0">
        <h1 className="text-gradient text-xl font-bold tracking-tight text-center font-mono mx-0">​Silo</h1>
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 -mr-2 rounded-full hover:bg-muted/50 transition-colors">
          
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
      </header>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === "notes" ? -20 : activeTab === "chat" ? 20 : 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-1 flex flex-col min-h-0">
          
          {activeTab === "record" && <RecordButton />}
          {activeTab === "notes" && <VoiceNotesList />}
          {activeTab === "chat" && <ChatView />}
        </motion.div>
      </AnimatePresence>

      {/* Bottom tab bar */}
      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Settings sheet */}
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>);

};

export default Index;