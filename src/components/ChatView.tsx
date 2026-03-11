import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, User, Sparkles, FileText, Mic, MicOff } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: { label: string; icon: React.ReactNode; action: string }[];
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hi! I'm Silo, your local AI assistant. I can summarize your notes, answer questions about them, or help you organize your thoughts. Everything stays on your device.",
    actions: [
      { label: "Summarize my notes", icon: <Sparkles className="w-3.5 h-3.5" />, action: "summarize" },
      { label: "Show recent notes", icon: <FileText className="w-3.5 h-3.5" />, action: "recent" },
    ],
  },
];

const ChatView = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };
  const handleSend = (text?: string) => {
    const content = text || input.trim();
    if (!content) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    let aiContent = "I can help with that! What specifically would you like to know about your notes?";
    let aiActions: Message["actions"] | undefined;

    if (content.toLowerCase().includes("summarize")) {
      aiContent =
        "Here's a summary of your recent notes:\n\n• Personal reflection on slowing down and appreciating life\n• Daily workflow using voice memos while walking\n• Winter preparation and garden maintenance planning\n• Product launch meeting — designs due Friday, manufacturing by month end";
    } else if (content.toLowerCase().includes("recent")) {
      aiContent =
        "You have 4 voice notes from the last 2 days. Would you like me to summarize them or search for something specific?";
      aiActions = [
        { label: "Summarize all", icon: <Sparkles className="w-3.5 h-3.5" />, action: "summarize" },
      ];
    }

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: aiContent,
      actions: aiActions,
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  };

  const handleAction = (action: string) => {
    const labels: Record<string, string> = {
      summarize: "Summarize my notes",
      recent: "Show recent notes",
    };
    handleSend(labels[action] || action);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 px-4">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 scrollbar-none">
        {messages.map((msg, index) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "assistant" ? "bg-primary/15" : "bg-muted"
              }`}
            >
              {msg.role === "assistant" ? (
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              ) : (
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>

            {/* Bubble + actions */}
            <div className="max-w-[80%] space-y-2">
              <div
                className={`rounded-2xl px-3.5 py-2.5 ${
                  msg.role === "assistant"
                    ? "glass"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <p className="text-[13px] leading-relaxed whitespace-pre-line">{msg.content}</p>
              </div>

              {/* Action buttons */}
              {msg.actions && (
                <div className="flex flex-wrap gap-1.5">
                  {msg.actions.map((a) => (
                    <button
                      key={a.action}
                      onClick={() => handleAction(a.action)}
                      className="glass rounded-full px-3 py-1.5 flex items-center gap-1.5 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-primary">{a.icon}</span>
                      <span className="text-xs font-medium text-foreground">{a.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="shrink-0 pb-2">
        <div className="glass-strong rounded-2xl flex items-center gap-2 px-3 py-2">
          <input
            type="text"
            placeholder={isListening ? "Listening..." : "Ask about your notes..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={toggleListening}
            className={`p-2 rounded-full transition-colors ${
              isListening ? "bg-destructive" : "hover:bg-muted/50"
            }`}
          >
            {isListening ? (
              <MicOff className="w-3.5 h-3.5 text-destructive-foreground" />
            ) : (
              <Mic className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={() => { stopListening(); handleSend(); }}
            disabled={!input.trim()}
            className="p-2 rounded-full bg-primary disabled:opacity-30 transition-opacity"
          >
            <Send className="w-3.5 h-3.5 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
