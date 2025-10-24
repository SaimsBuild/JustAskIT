import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, User, Send, Trash2, ArrowDown, Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import type { Message } from "@shared/schema";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showTosDialog, setShowTosDialog] = useState(true);
  const [tosAccepted, setTosAccepted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    const minHeight = 60;
    const maxHeight = 200;
    
    textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
  }, [input]);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom && messages.length > 0);
  };

  const handleAcceptTos = () => {
    setTosAccepted(true);
    setShowTosDialog(false);
    toast({
      title: "Terms Accepted",
      description: "You can now use JustAskIT.",
    });
  };

  const handleDeclineTos = () => {
    setShowTosDialog(false);
    toast({
      title: "Terms Declined",
      description: "You must accept the Terms of Service to use this application.",
      variant: "destructive",
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !tosAccepted) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantMessage.content += parsed.content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessage.id
                        ? { ...m, content: assistantMessage.content }
                        : m
                    )
                  );
                }
              } catch (e) {
                console.error("Error parsing SSE data:", e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setShowClearDialog(false);
    toast({
      title: "Chat cleared",
      description: "Your conversation has been cleared.",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sampleQuestions = [
    "Explain quantum computing",
    "Write a Python function to sort a list",
    "Plan a 3-day trip to Tokyo",
    "What are the benefits of meditation?",
  ];

  const handleSampleClick = (question: string) => {
    setInput(question);
    textareaRef.current?.focus();
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (!tosAccepted && !showTosDialog) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-4">
        <Bot className="h-16 w-16 text-primary mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-foreground">
          Terms Required
        </h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          You must accept the Terms of Service to use JustAskIT.
        </p>
        <Button onClick={() => setShowTosDialog(true)} data-testid="button-show-tos">
          Review Terms of Service
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto h-full px-3 sm:px-4 flex items-center justify-between max-w-4xl gap-2">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground truncate" data-testid="text-app-title">
              JustAskIT
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block" data-testid="text-app-tagline">
              Powered by Dolphin Mistral AI
            </p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              data-testid="button-theme-toggle"
              className="h-9 w-9"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClearDialog(true)}
                data-testid="button-clear-chat"
                className="hidden sm:flex"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear conversation
              </Button>
            )}
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowClearDialog(true)}
                data-testid="button-clear-chat-mobile"
                className="sm:hidden h-9 w-9"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        <div className="container mx-auto max-w-4xl px-3 sm:px-4 py-4 sm:py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]" data-testid="empty-state">
              <div className="mb-6">
                <Bot className="h-16 w-16 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-foreground">
                Welcome to JustAskIT
              </h2>
              <p className="text-muted-foreground mb-6 sm:mb-8 text-center px-4">
                Ask me anything and I'll help you find answers
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-2xl px-4">
                {sampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSampleClick(question)}
                    className="px-3 sm:px-4 py-2 rounded-full bg-muted hover-elevate active-elevate-2 text-xs sm:text-sm text-foreground transition-colors min-h-[36px]"
                    data-testid={`button-sample-${index}`}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                  data-testid={`message-${message.role}-${message.id}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Bot className="h-5 w-5 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] md:max-w-2xl lg:max-w-3xl ${
                      message.role === "user" ? "ml-auto" : "mr-auto"
                    }`}
                  >
                    <div
                      className={`p-3 md:p-4 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                          : "bg-muted text-foreground rounded-2xl rounded-bl-sm"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="text-xs font-medium mb-1 text-muted-foreground">
                          JustAskIT
                        </div>
                      )}
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-base">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-base whitespace-pre-wrap break-words font-normal">
                          {message.content}
                        </p>
                      )}
                    </div>
                    <div
                      className={`text-xs text-muted-foreground mt-1 ${
                        message.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-5 w-5 text-secondary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start" data-testid="loading-indicator">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="max-w-[85%] md:max-w-2xl lg:max-w-3xl">
                    <div className="p-3 md:p-4 bg-muted text-foreground rounded-2xl rounded-bl-sm">
                      <div className="text-xs font-medium mb-1 text-muted-foreground">
                        JustAskIT
                      </div>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-foreground/60 rounded-full animate-pulse" />
                        <span className="w-2 h-2 bg-foreground/60 rounded-full animate-pulse [animation-delay:0.2s]" />
                        <span className="w-2 h-2 bg-foreground/60 rounded-full animate-pulse [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom()}
          className="fixed bottom-24 right-4 md:right-8 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg hover-elevate active-elevate-2 flex items-center justify-center z-20 transition-opacity"
          data-testid="button-scroll-bottom"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}

      {/* Input Area */}
      <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-4xl p-3 sm:p-4">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tosAccepted ? "Ask me anything..." : "Accept Terms of Service to use this app"}
              className="min-h-[60px] max-h-[200px] resize-none rounded-2xl text-base flex-1"
              rows={3}
              disabled={isLoading || !tosAccepted}
              data-testid="input-message"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || !tosAccepted}
              size="icon"
              className="h-10 w-10 rounded-xl flex-shrink-0"
              data-testid="button-send"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground" data-testid="text-built-by">
              Built by Saim
            </p>
          </div>
        </div>
      </div>

      {/* Clear Chat Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all messages in your current conversation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-clear">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearChat} data-testid="button-confirm-clear">
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Terms of Service Dialog */}
      <AlertDialog open={showTosDialog} onOpenChange={setShowTosDialog}>
        <AlertDialogContent className="rounded-3xl max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">Terms of Service</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Please read and accept these terms to use JustAskIT
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="overflow-y-auto flex-1 pr-4 my-4">
            <div className="space-y-4 text-sm text-foreground">
              <section>
                <h3 className="font-semibold text-base mb-2">1. Acceptance of Terms</h3>
                <p className="text-muted-foreground">
                  By accessing and using JustAskIT, you acknowledge that you have read, understood, 
                  and agree to be bound by these Terms of Service. If you do not agree to these terms, 
                  you may not use this application.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">2. AI-Generated Content Disclaimer</h3>
                <p className="text-muted-foreground mb-2">
                  JustAskIT uses an uncensored artificial intelligence model. You acknowledge and agree that:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>The AI may generate content that is inaccurate, offensive, harmful, or inappropriate</li>
                  <li>The AI responses do not represent the views or opinions of the service provider</li>
                  <li>You use the AI-generated content entirely at your own risk</li>
                  <li>The service provider makes no warranties about the accuracy, reliability, or appropriateness of any AI responses</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">3. No Liability</h3>
                <p className="text-muted-foreground mb-2">
                  The owner and operator of JustAskIT ("Saim") shall not be held liable for:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Any content generated by the AI system</li>
                  <li>Any actions taken based on AI-generated responses</li>
                  <li>Any damages, losses, or harm resulting from use of this service</li>
                  <li>Any offensive, illegal, or harmful content produced by the AI</li>
                  <li>Any decisions made based on information provided by the AI</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">4. User Responsibility</h3>
                <p className="text-muted-foreground">
                  You are solely responsible for how you use this service and any AI-generated content. 
                  You agree to verify any important information independently and not to rely solely on 
                  AI responses for critical decisions. You will not hold the service provider responsible 
                  for any consequences arising from your use of this application.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">5. No Professional Advice</h3>
                <p className="text-muted-foreground">
                  JustAskIT does not provide professional advice of any kind, including but not limited to 
                  legal, medical, financial, or therapeutic advice. Any information provided by the AI should 
                  not be considered professional advice.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">6. Indemnification</h3>
                <p className="text-muted-foreground">
                  You agree to indemnify and hold harmless Saim and JustAskIT from any claims, damages, 
                  losses, or expenses arising from your use of this service or any AI-generated content.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">7. Service Provided "As Is"</h3>
                <p className="text-muted-foreground">
                  This service is provided on an "as is" and "as available" basis without any warranties 
                  of any kind, either express or implied. The service provider disclaims all warranties, 
                  including but not limited to merchantability, fitness for a particular purpose, and 
                  non-infringement.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">8. Changes to Terms</h3>
                <p className="text-muted-foreground">
                  These terms may be modified at any time. Continued use of the service constitutes 
                  acceptance of any modified terms.
                </p>
              </section>
            </div>
          </div>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel onClick={handleDeclineTos} data-testid="button-decline-tos">
              Decline
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAcceptTos} data-testid="button-accept-tos">
              I Accept the Terms of Service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
