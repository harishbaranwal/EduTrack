import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Sparkles, Trash2, Bot } from "lucide-react";
import API from "../utils/api";

const SUGGESTIONS = [
  "What is photosynthesis?",
  "Explain Newton's laws of motion",
  "How does the internet work?",
  "What is the Pythagorean theorem?",
];

/** Render very basic markdown: **bold**, `code`, and line breaks */
const renderMarkdown = (text) => {
  if (!text) return "";
  const lines = text.split("\n");
  const elements = [];

  lines.forEach((line, i) => {
    let processed = line;

    // Bold **text**
    processed = processed.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold">$1</strong>'
    );

    // Inline code `text`
    processed = processed.replace(
      /`(.*?)`/g,
      '<code class="bg-gray-200 text-indigo-700 px-1 py-0.5 rounded text-xs font-mono">$1</code>'
    );

    // Bullet points
    if (/^[\-\*]\s/.test(processed)) {
      processed = `<span class="flex items-start gap-1.5"><span class="text-indigo-400 mt-0.5 shrink-0">•</span><span>${processed.replace(
        /^[\-\*]\s/,
        ""
      )}</span></span>`;
    }

    // Numbered lists
    if (/^\d+\.\s/.test(processed)) {
      const num = processed.match(/^(\d+)\./)[1];
      processed = `<span class="flex items-start gap-1.5"><span class="text-indigo-500 font-semibold shrink-0">${num}.</span><span>${processed.replace(
        /^\d+\.\s/,
        ""
      )}</span></span>`;
    }

    elements.push(
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: processed }} />
        {i < lines.length - 1 && <br />}
      </span>
    );
  });

  return elements;
};

const TypingIndicator = () => (
  <div className="flex items-end gap-2 mb-4">
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
      <Bot className="w-3.5 h-3.5 text-white" />
    </div>
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
      <div className="flex gap-1.5 items-center">
        <span
          className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  </div>
);

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi there! 👋 I'm **EduBot**, your education assistant.\n\nAsk me anything about any subject — Science, Math, History, or any concept you're curious about!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isLoading) return;

    const userMsg = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Build history from previous messages (skip initial greeting)
      const history = messages
        .filter((_, i) => i > 0)
        .map((m) => ({
          role: m.role === "user" ? "user" : "model",
          text: m.text,
        }));

      const { data } = await API.post("/chatbot/ask", {
        message: trimmed,
        history,
      });

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.data.reply },
      ]);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Sorry, I couldn't process your question. Please try again.";
      setMessages((prev) => [...prev, { role: "bot", text: `⚠️ ${errorMsg}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "bot",
        text: "Chat cleared! 🗑️ Ask me anything about any subject.",
      },
    ]);
  };

  return (
    <>
      {/* ==================== CHAT WINDOW ==================== */}
      <div
        className={`fixed bottom-20 right-4 sm:right-6 z-[9999] w-[calc(100vw-2rem)] sm:w-[400px] md:w-[420px]
          transition-all duration-300 ease-out origin-bottom-right
          ${
            isOpen
              ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
              : "scale-90 opacity-0 translate-y-4 pointer-events-none"
          }`}
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/60 flex flex-col overflow-hidden"
          style={{
            height: "min(550px, calc(100vh - 8rem))",
            boxShadow:
              "0 25px 60px -12px rgba(79,70,229,0.25), 0 0 0 1px rgba(79,70,229,0.05)",
          }}
        >
          {/* ---- Header ---- */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-4 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-600" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm leading-none">
                  EduBot
                </h3>
                <p className="text-indigo-200 text-xs mt-0.5">
                  AI Education Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ---- Messages ---- */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-gradient-to-b from-gray-50/50 to-white/50"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#c7d2fe transparent",
            }}
          >
            {messages.map((msg, idx) =>
              msg.role === "user" ? (
                /* ---- User Bubble ---- */
                <div key={idx} className="flex justify-end mb-3">
                  <div className="max-w-[80%] bg-gradient-to-br from-indigo-500 to-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-br-md shadow-md text-sm leading-relaxed">
                    {msg.text}
                  </div>
                </div>
              ) : (
                /* ---- Bot Bubble ---- */
                <div key={idx} className="flex items-end gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="max-w-[80%] bg-white/80 backdrop-blur-sm border border-gray-200/60 text-gray-800 px-4 py-2.5 rounded-2xl rounded-bl-md shadow-sm text-sm leading-relaxed">
                    {renderMarkdown(msg.text)}
                  </div>
                </div>
              )
            )}

            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* ---- Suggestions (only when few messages) ---- */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-full border border-indigo-100 transition-colors whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* ---- Input ---- */}
          <div className="border-t border-gray-200/60 px-3 py-3 bg-white/80 backdrop-blur shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask any education question…"
                rows={1}
                className="flex-1 resize-none rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 transition-all bg-gray-50/50 max-h-24"
                style={{ minHeight: "40px" }}
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-md
                  ${
                    input.trim() && !isLoading
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white scale-100"
                      : "bg-gray-100 text-gray-400 scale-95 shadow-none"
                  }`}
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1.5">
              Powered by Gemini AI • Education topics only
            </p>
          </div>
        </div>
      </div>

      {/* ==================== FLOATING BUBBLE ==================== */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-5 right-4 sm:right-6 z-[9999] group transition-all duration-300
          ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}
        title="Ask EduBot"
        aria-label="Open EduBot chatbot"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-20" />
        {/* Glow */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 opacity-40 blur-md group-hover:opacity-60 transition-opacity" />
        {/* Button */}
        <span className="relative w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-xl group-hover:shadow-indigo-500/40 transition-shadow">
          <MessageCircle className="w-6 h-6 text-white" />
        </span>
      </button>

      {/* ==================== CLOSE PILL (when chat is open) ==================== */}
      <button
        onClick={() => setIsOpen(false)}
        className={`fixed bottom-5 right-4 sm:right-6 z-[9999] transition-all duration-300
          ${isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"}`}
        title="Close chat"
        aria-label="Close EduBot chatbot"
      >
        <span className="relative w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <X className="w-6 h-6 text-white" />
        </span>
      </button>
    </>
  );
};

export default Chatbot;
