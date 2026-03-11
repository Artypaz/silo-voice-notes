import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Sparkles, FileText, Mic, MicOff, Loader2 } from "lucide-react";
import { generateChatResponse } from "@/services/aiService";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isThinking?: boolean;
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
  const [isThinking, setIsThinking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

  const handleSend = async (text?: string) => {
    const content = text || input.trim();
    if (!content || isThinking) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    // Add user message + thinking indicator
    const thinkingMsg: Message = {
      id: "thinking",
      role: "assistant",
      content: "",
      isThinking: true,
    };

    setMessages((prev) => [...prev, userMsg, thinkingMsg]);
    setInput("");
    setIsThinking(true);

    try {
      const aiContent = await generateChatResponse(content);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiContent,
      };

      setMessages((prev) => prev.filter((m) => m.id !== "thinking").concat(aiMsg));
    } catch {
      setMessages((prev) =>
        prev.filter((m) => m.id !== "thinking").concat({
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        })
      );
    } finally {
      setIsThinking(false);
    }
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-3 space-y-3 scrollbar-none">
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
                {msg.isThinking ? (
                  <div className="flex items-center gap-2 py-1">
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                    <span className="text-[13px] text-muted-foreground">Thinking...</span>
                  </div>
                ) : (
                  <p className="text-[13px] leading-relaxed whitespace-pre-line">{msg.content}</p>
                )}
              </div>

              {/* Action buttons */}
              {msg.actions && !msg.isThinking && (
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
            disabled={isThinking}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
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
            disabled={!input.trim() || isThinking}
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
