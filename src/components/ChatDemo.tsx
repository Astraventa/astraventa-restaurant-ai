import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";
import { createSupabaseForClient } from "@/lib/supabase";
import { useClientId } from "@/hooks/use-client-id";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatDemo = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const clientId = useClientId();
  const [conversationId, setConversationId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Ensure a conversation exists
    const ensureConversation = async () => {
      if (!clientId || conversationId) return;
      const sb = createSupabaseForClient(clientId);
      const { data, error } = await sb
        .from("conversations")
        .insert([{ client_id: clientId, channel: "web" }])
        .select("id")
        .single();
      if (!error && data?.id) setConversationId(data.id);
    };
    ensureConversation();

    // Show initial demo conversation
    const demoMessages: Message[] = [
      { role: "user", content: "What's your signature dish?" },
      {
        role: "assistant",
        content: "Our signature dish is the Truffle Risotto with seared scallops and aged parmesan. It's been featured in Michelin Guide! Would you like to reserve a table to try it?",
      },
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < demoMessages.length && demoMessages[index]) {
        const m = demoMessages[index];
        setMessages((prev) => [...prev, m]);
        // Persist to Supabase if conversation exists
        if (conversationId) {
          const sb = createSupabaseForClient(clientId);
          void sb
            .from("messages")
            .insert([
              {
                conversation_id: conversationId,
                role: m.role,
                content: m.content,
                model: "demo-simulated",
              },
            ])
            ;
        }
        index++;
      } else {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Persist user message
    if (conversationId) {
      const sb = createSupabaseForClient(clientId);
      void sb
        .from("messages")
        .insert([
          { conversation_id: conversationId, role: "user", content: userMessage.content, model: "user-input" },
        ])
        ;
    }

    try {
      const sb = createSupabaseForClient(clientId);
      const conversationHistory: Message[] = messages.slice(-6);
      const { data, error } = await sb.functions.invoke("chat-ai", {
        body: {
          messages: [...conversationHistory, userMessage].map(m => ({ role: m.role, content: m.content })),
          conversation_id: conversationId,
        },
      });

      if (error) throw error;

      const aiResponse = (data as any)?.content || (data as any)?.fallback || "I apologize, but I'm having trouble processing that right now. Could you please rephrase your question?";
      const model = (data as any)?.model || "unknown";

      const assistantMessage: Message = { role: "assistant", content: aiResponse };
      setMessages((prev) => [...prev, assistantMessage]);

      if (conversationId) {
        const sb = createSupabaseForClient(clientId);
        void sb
          .from("messages")
          .insert([
            {
              conversation_id: conversationId,
              role: "assistant",
              content: aiResponse,
              model: model,
              latency_ms: (data as any)?.latency || null,
            },
          ])
          ;
      }
    } catch (e) {
      console.error("AI chat error:", e);
      const fallbackMessage: Message = {
        role: "assistant",
        content: "I'd be delighted to help! Our signature dish is the Truffle Risotto with seared scallops. Would you like to reserve a table?",
      };
      setMessages((prev) => [...prev, fallbackMessage]);
      if (conversationId) {
        const sb = createSupabaseForClient(clientId);
        void sb
          .from("messages")
          .insert([{ conversation_id: conversationId, role: "assistant", content: fallbackMessage.content, model: "fallback" }])
          ;
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <section id="demo" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Try Our <span className="bg-gradient-premium bg-clip-text text-transparent">AI Assistant</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience how our AI chatbot handles customer inquiries instantly
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-3xl shadow-strong border border-border overflow-hidden animate-slide-up">
            {/* Chat Header */}
            <div className="bg-gradient-premium p-4 sm:p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse-soft"></div>
              <div className="flex items-center space-x-3 relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-glow border border-white/30">
                  <Bot className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">La Bella Vista</h3>
                  <p className="text-white/90 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Online • Instant replies
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-[400px] sm:h-[500px] overflow-y-auto p-4 sm:p-6 space-y-4 bg-background">
              {messages.filter(m => m && m.role && m.content).map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 animate-fade-in ${
                    message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "user"
                        ? "bg-primary"
                        : "bg-gradient-premium"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="text-white" size={18} />
                    ) : (
                      <Bot className="text-white" size={18} />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] p-4 rounded-2xl shadow-soft ${
                      message.role === "user"
                        ? "bg-primary text-white"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm sm:text-base leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-start space-x-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-gradient-premium flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white" size={18} />
                  </div>
                  <div className="bg-muted p-4 rounded-2xl shadow-soft">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse-soft"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse-soft" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse-soft" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 sm:p-6 border-t border-border bg-card">
              <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about our menu, hours, or reservations..."
                  className="flex-1 rounded-full border-border focus:border-primary transition-colors"
                />
                <Button
                  onClick={handleSend}
                  size="icon"
                  className="rounded-full bg-gradient-gold hover:opacity-90 transition-opacity shadow-glow w-12 h-12"
                >
                  <Send size={20} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatDemo;
