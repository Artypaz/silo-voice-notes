import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hi! I'm Aura, your local AI assistant. I can summarize your notes, answer questions about them, or help you organize your thoughts. Everything stays on your device.",
  },
];

const ChatView = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content:
        "I've analyzed your recent voice notes. Here's what I found: You have 4 recordings from today covering meeting notes, personal reflections, and task reminders. Would you like me to create a summary?",
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
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

            {/* Bubble */}
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                msg.role === "assistant"
                  ? "glass"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              <p className="text-[13px] leading-relaxed">
                {msg.content}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="shrink-0 pb-2">
        <div className="glass-strong rounded-2xl flex items-center gap-2 px-3 py-2">
          <input
            type="text"
            placeholder="Ask about your notes..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={handleSend}
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
