import { useState } from "react";
import { Send, Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: "1",
    type: "ai",
    content: "Hi! I've analyzed your pitch deck. Your market sizing section could use stronger TAM/SAM/SOM breakdown with cited sources. Want me to suggest improvements?",
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: "2",
    type: "user",
    content: "Yes, please show me what a strong market sizing slide looks like.",
    timestamp: new Date(Date.now() - 3500000),
  },
  {
    id: "3",
    type: "ai",
    content: "Great question! Top-performing decks typically start with a credible third-party TAM estimate, then show a bottom-up SAM calculation using your specific customer segments. I'd recommend citing Gartner or similar for the TAM, then walking through your serviceable market math step by step.",
    timestamp: new Date(Date.now() - 3400000),
  },
];

export function VCInsightChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = async () => {
  if (!input.trim()) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    type: "user",
    content: input,
    timestamp: new Date(),
  };

  // Show user message immediately
  setMessages((prev) => [...prev, userMessage]);
  setInput("");

  try {
    const response = await fetch(
      "https://pema7476.app.n8n.cloud/webhook-test/ChatBOT",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
        }),
      }
    );

    const data = await response.json();

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "ai",
      content: data.message ?? "No response from AI",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessage]);
  } catch (error) {
    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      },
    ]);
  }
};

  return (
    <div className="glass-card rounded-2xl h-full flex flex-col gradient-border">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">VC Insight</h3>
          <p className="text-xs text-muted-foreground">AI-powered pitch advisor</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.type === "user" && "flex-row-reverse"
            )}
          >
            {message.type === "ai" && (
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                message.type === "ai"
                  ? "bg-secondary text-foreground rounded-tl-md"
                  : "bg-primary text-primary-foreground rounded-tr-md"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your pitch..."
            className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
          <button
            onClick={handleSend}
            className="p-3 bg-primary hover:bg-primary/90 rounded-xl transition-colors shadow-lg shadow-primary/25"
          >
            <Send className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
