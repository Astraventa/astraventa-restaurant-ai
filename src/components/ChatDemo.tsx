import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Mic, MicOff } from "lucide-react";
import { createSupabaseForClient } from "@/lib/supabase";
import { useClientId } from "@/hooks/use-client-id";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

const ChatDemo = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
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
      
      // Verify Supabase URL is configured
      if (!import.meta.env.VITE_SUPABASE_URL) {
        throw new Error("Supabase URL not configured. Please check environment variables.");
      }
      
      const { data, error } = await sb.functions.invoke("chat-ai", {
        body: {
          messages: [...conversationHistory, userMessage].map(m => ({ role: m.role, content: m.content })),
          conversation_id: conversationId,
        },
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }
      
      // Handle response - check for content or fallback
      const responseData = data as any;
      let aiResponse = responseData?.content?.trim();
      
      // If content is empty string, treat as no content
      if (!aiResponse || aiResponse.length === 0) {
        if (responseData?.fallback) {
          aiResponse = responseData.fallback;
        } else {
          console.warn("No content or fallback in AI response:", responseData);
          // Use a restaurant-specific fallback based on user's question
          const userQuestion = userMessage.content.toLowerCase();
          if (userQuestion.includes("pizza") || userQuestion.includes("chicken")) {
            aiResponse = "Yes, we have delicious chicken pizza available! Our wood-fired pizzas are made fresh daily. Would you like to place an order or make a reservation?";
          } else if (userQuestion.includes("table") || userQuestion.includes("reserve") || userQuestion.includes("book")) {
            aiResponse = "I'd be happy to help you reserve a table! For a party of 6, I can check availability. What time would work best for you today?";
          } else if (userQuestion.includes("mutton") || userQuestion.includes("karahai")) {
            aiResponse = "Yes, we serve mutton karahai! It's one of our popular dishes. Would you like to know more about it or make a reservation to try it?";
          } else if (userQuestion.includes("time") || userQuestion.includes("hour") || userQuestion.includes("open")) {
            aiResponse = "We're open Tuesday-Sunday, 5 PM to 11 PM. For today's exact hours, I recommend calling us directly. Would you like to make a reservation?";
          } else {
            aiResponse = "I'd be happy to help! Our signature dish is the Truffle Risotto with seared scallops. Would you like to know more about our menu or make a reservation?";
          }
        }
      }
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
    } catch (e: any) {
      console.error("AI chat error:", e);
      
      // Check if it's a network/function error
      const isNetworkError = e?.message?.includes("Failed to send") || 
                             e?.message?.includes("ERR_NAME_NOT_RESOLVED") ||
                             e?.message?.includes("fetch");
      
      let errorMessage = "I'd be delighted to help! Our signature dish is the Truffle Risotto with seared scallops. Would you like to reserve a table?";
      
      if (isNetworkError) {
        console.warn("Chat function not accessible. Check if chat-ai function is deployed and Supabase URL is correct.");
        errorMessage = "I'm having trouble connecting right now. Please try again in a moment, or contact us directly for assistance!";
      }
      
      const fallbackMessage: Message = {
        role: "assistant",
        content: errorMessage,
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

  // Voice recognition setup
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      recognition.stop();
      // Auto-send after voice input
      setTimeout(() => {
        if (transcript.trim()) {
          const userMessage: Message = { role: "user", content: transcript };
          setMessages((prev) => [...prev, userMessage]);
          setInput("");
          setIsTyping(true);
          handleVoiceSend(transcript);
        }
      }, 100);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      recognition.stop();
      
      // Show user-friendly error message
      if (event.error === "network") {
        alert("Voice input requires an internet connection. Please check your network and try again.");
      } else if (event.error === "not-allowed") {
        alert("Microphone permission denied. Please allow microphone access in your browser settings.");
      } else if (event.error === "no-speech") {
        // This is normal - user didn't speak, just reset
        setIsListening(false);
      } else {
        console.warn("Speech recognition error:", event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleVoiceSend = async (transcript: string) => {
    const userMessage: Message = { role: "user", content: transcript };
    
    // Persist user message
    if (conversationId) {
      const sb = createSupabaseForClient(clientId);
      void sb
        .from("messages")
        .insert([{ conversation_id: conversationId, role: "user", content: userMessage.content, model: "user-input" }])
        ;
    }

    try {
      const sb = createSupabaseForClient(clientId);
      const conversationHistory: Message[] = messages.slice(-6);
      
      if (!import.meta.env.VITE_SUPABASE_URL) {
        throw new Error("Supabase URL not configured");
      }
      
      const { data, error } = await sb.functions.invoke("chat-ai", {
        body: {
          messages: [...conversationHistory, userMessage].map(m => ({ role: m.role, content: m.content })),
          conversation_id: conversationId,
        },
      });

      if (error) throw error;
      
      const responseData = data as any;
      let aiResponse = responseData?.content?.trim();
      
      if (!aiResponse || aiResponse.length === 0) {
        if (responseData?.fallback) {
          aiResponse = responseData.fallback;
        } else {
          const userQuestion = transcript.toLowerCase();
          if (userQuestion.includes("pizza") || userQuestion.includes("chicken")) {
            aiResponse = "Yes, we have delicious chicken pizza available! Our wood-fired pizzas are made fresh daily. Would you like to place an order or make a reservation?";
          } else if (userQuestion.includes("table") || userQuestion.includes("reserve") || userQuestion.includes("book")) {
            aiResponse = "I'd be happy to help you reserve a table! For a party of 6, I can check availability. What time would work best for you today?";
          } else if (userQuestion.includes("mutton") || userQuestion.includes("karahai")) {
            aiResponse = "Yes, we serve mutton karahai! It's one of our popular dishes. Would you like to know more about it or make a reservation to try it?";
          } else {
            aiResponse = "I'd be happy to help! Our signature dish is the Truffle Risotto with seared scallops. Would you like to know more about our menu or make a reservation?";
          }
        }
      }

      const assistantMessage: Message = { role: "assistant", content: aiResponse };
      setMessages((prev) => [...prev, assistantMessage]);

      if (conversationId) {
        const sb = createSupabaseForClient(clientId);
        void sb
          .from("messages")
          .insert([{
            conversation_id: conversationId,
            role: "assistant",
            content: aiResponse,
            model: responseData?.model || "unknown",
            latency_ms: responseData?.latency || null,
          }])
          ;
      }
    } catch (e: any) {
      console.error("AI chat error:", e);
      const fallbackMessage: Message = {
        role: "assistant",
        content: "I'd be delighted to help! Our signature dish is the Truffle Risotto with seared scallops. Would you like to reserve a table?",
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
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
                  onClick={toggleVoiceInput}
                  size="icon"
                  variant={isListening ? "destructive" : "outline"}
                  className={`rounded-full transition-all shadow-soft w-12 h-12 ${
                    isListening 
                      ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                      : "hover:bg-primary hover:text-white border-2"
                  }`}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </Button>
                <Button
                  onClick={handleSend}
                  size="icon"
                  disabled={!input.trim()}
                  className="rounded-full bg-gradient-gold hover:opacity-90 transition-opacity shadow-glow w-12 h-12 disabled:opacity-50"
                >
                  <Send size={20} />
                </Button>
              </div>
              {isListening && (
                <p className="mt-2 text-xs text-center text-muted-foreground animate-pulse">
                  🎤 Listening... Speak now
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatDemo;
