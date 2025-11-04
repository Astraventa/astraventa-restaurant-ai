import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatDemo = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Show initial demo conversation
    const demoMessages: Message[] = [
      { role: "user", content: "What's today's special?" },
      {
        role: "assistant",
        content: "Today's Chef Special is Grilled Salmon with Lemon Butter Sauce. It comes with roasted vegetables and your choice of side. Would you like to make a reservation?",
      },
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < demoMessages.length) {
        setMessages((prev) => [...prev, demoMessages[index]]);
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

    // Simulate AI response (will be replaced with actual API call)
    setTimeout(() => {
      const responses = [
        "I'd be happy to help you with that! Let me check our menu for you.",
        "Great question! Our restaurant specializes in fresh, locally-sourced ingredients.",
        "I can definitely assist with your reservation. What date and time works best for you?",
        "Our opening hours are Monday-Sunday, 11am-11pm. Would you like to book a table?",
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: randomResponse },
      ]);
      setIsTyping(false);
    }, 1000);
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
            <div className="bg-gradient-premium p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Astraventa AI Assistant</h3>
                  <p className="text-white/80 text-sm">Online • Instant replies</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-[400px] sm:h-[500px] overflow-y-auto p-4 sm:p-6 space-y-4 bg-background">
              {messages.map((message, index) => (
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
                  className="rounded-full bg-gradient-premium hover:opacity-90 transition-opacity shadow-soft w-12 h-12"
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
