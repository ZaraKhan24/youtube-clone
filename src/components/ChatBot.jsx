import React, { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import robotIcon from "../assets/robot.png";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function renderInlineBold(lineText) {
  const parts = lineText.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={index} style={{ fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={index}>{part.replace(/\*+/g, "")}</React.Fragment>;
  });
}

function FormattedMessage({ content }) {
  const lines = String(content || "").split("\n");
  return (
    <div style={{ whiteSpace: "pre-wrap" }}>
      {lines.map((line, idx) => (
        <React.Fragment key={idx}>
          {renderInlineBold(line)}
          {idx < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
}

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! Ask me about the uploaded videos here (like the latest video title) or how to upload, search, or manage videos in this app.",
    },
  ]);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const updatedMessages = [...messages, { role: "user", content: text }];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: updatedMessages.slice(-6),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Could not get reply");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "No response received." },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err.message || "Sorry, I couldn't respond right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open AI Chatbot"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: "fixed",
          bottom: "22px",
          right: "22px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          border: "1px solid #e5e5e5",
          backgroundColor: "#ffffff",
          padding: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.22)",
          cursor: "pointer",
          zIndex: 1300,
        }}
      >
        {isOpen ? (
          <X size={24} color="#0f0f0f" />
        ) : (
          <img
            src={robotIcon}
            alt="AI Assistant"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "88px",
            right: "22px",
            width: "340px",
            maxWidth: "calc(100vw - 32px)",
            height: "430px",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e5e5",
            borderRadius: "14px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1300,
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              borderBottom: "1px solid #efefef",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#fafafa",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img
                src={robotIcon}
                alt="Video Assistant"
                style={{
                  width: "24px",
                  height: "24px",
                  objectFit: "contain",
                  flexShrink: 0,
                }}
              />
              <span
                style={{ fontWeight: 600, fontSize: "14px", color: "#0f0f0f" }}
              >
                Youtube Assistant
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#606060",
                display: "flex",
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div
            style={{
              flex: 1,
              padding: "12px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "82%",
                  padding: "9px 12px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  lineHeight: 1.4,
                  backgroundColor: msg.role === "user" ? "#0f0f0f" : "#f2f2f2",
                  color: msg.role === "user" ? "#ffffff" : "#0f0f0f",
                }}
              >
                <FormattedMessage content={msg.content} />
              </div>
            ))}
            {loading && (
              <div style={{ fontSize: "12.5px", color: "#606060" }}>
                Thinking...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSend}
            style={{
              display: "flex",
              gap: "8px",
              padding: "10px",
              borderTop: "1px solid #efefef",
            }}
          >
            <input
              type="text"
              placeholder="Ask about videos or app..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "20px",
                border: "1px solid #d9d9d9",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              aria-label="Send message"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: "#cc0000",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default ChatBot;