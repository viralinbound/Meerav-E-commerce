import { useMemo, useState } from "react";
import { useCatalog } from "../context/CatalogContext";
import { brand } from "../data/staticContent";

export default function ChatAssistant() {
  const { faqs } = useCatalog();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: `Namaste! I'm the Meerav Taste Assistant. Ask me anything about our snacks, or tap a question below.` },
  ]);

  const quickQuestions = useMemo(
    () => [
      { q: "Do you use palm oil?", a: faqs.find((f) => f.category === "quality")?.answer },
      { q: "How fresh is the crunch?", a: faqs.find((f) => f.id === "f2")?.answer },
      { q: "What are shipping charges?", a: faqs.find((f) => f.category === "shipping")?.answer },
      { q: "Is it Jain-friendly?", a: faqs.find((f) => f.category === "dietary")?.answer },
    ],
    [faqs]
  );

  function ask(question, answer) {
    setMessages((m) => [
      ...m,
      { from: "user", text: question },
      { from: "bot", text: answer || "Let me connect you to our team on WhatsApp for that one!" },
    ]);
  }

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel">
          <div className="chat-panel-header">
            <div>
              <strong>Meerav Taste Assistant</strong>
              <span>Usually replies instantly</span>
            </div>
            <button onClick={() => setOpen(false)}>Close</button>
          </div>
          <div className="chat-panel-body">
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.from}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="chat-quick-questions">
            {quickQuestions.map((q) => (
              <button key={q.q} onClick={() => ask(q.q, q.a)}>
                {q.q}
              </button>
            ))}
          </div>
          <a
            href={`https://wa.me/${brand.phone.replace(/\D/g, "")}`}
            className="chat-whatsapp-cta"
          >
            Chat with a human on WhatsApp
          </a>
        </div>
      )}
      <button className="chat-fab" onClick={() => setOpen((o) => !o)}>
        {open ? "Close" : "Ask Us"}
      </button>
    </div>
  );
}
