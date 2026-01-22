"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'bot' }>>([]);
  const [inputValue, setInputValue] = useState("");

  const quickActions = [
    { label: "Start Fresh", action: "start_fresh" },
    { label: "Import Last Year", action: "import_last_year" },
    { label: "Talk to a Human", action: "talk_to_human" },
  ];

  const handleQuickAction = (action: string) => {
    let response = "";
    switch (action) {
      case "start_fresh":
        response = "Great! Let's start measuring your carbon footprint from scratch. I'll guide you through the process step by step.";
        break;
      case "import_last_year":
        response = "I can help you import your data from last year. Please upload your previous emissions report or connect your data source.";
        break;
      case "talk_to_human":
        response = "Connecting you with a human expert. A member of our team will be with you shortly.";
        break;
    }

    setMessages([...messages,
      { text: quickActions.find(qa => qa.action === action)?.label || "", sender: 'user' },
      { text: response, sender: 'bot' }
    ]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    setMessages([...messages,
      { text: inputValue, sender: 'user' },
      { text: "Thanks for your message! I'm here to help you measure and reduce your carbon footprint. How can I assist you today?", sender: 'bot' }
    ]);
    setInputValue("");
  };

  return (
    <>
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full p-4 shadow-2xl hover:scale-110 transition-transform duration-300 group"
          aria-label="Open chat assistant"
        >
          <MessageCircle className="h-6 w-6 group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] flex flex-col shadow-2xl border-2">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">CarbonScope Assistant</h3>
                <p className="text-xs opacity-90">Always here to help</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary-foreground/20 text-primary-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="bg-card p-3 rounded-lg shadow-sm">
                  <p className="text-sm">
                    👋 Hi! I'm your CarbonScope Assistant. How can I help you today?
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Quick Actions:</p>
                  {quickActions.map((action) => (
                    <button
                      key={action.action}
                      onClick={() => handleQuickAction(action.action)}
                      className="w-full text-left bg-card hover:bg-accent p-3 rounded-lg text-sm transition-colors border border-border/40"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-background">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
