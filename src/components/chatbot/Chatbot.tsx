"use client";

import { MessageCircle, Phone, Send, X } from "lucide-react";
import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/types";
import { contact } from "@/content/contact";
import { getChatAnswer, type ChatTopic } from "./chatbotData";

type ChatMessage = { from: "bot" | "user"; text: string };

export function Chatbot({ t, locale, onBook }: { t: Dictionary; locale: Locale; onBook: () => void }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ from: "bot", text: t.chatbot.intro }]);
  const topics = Object.keys(t.chatbot.quick) as ChatTopic[];

  function ask(topic: ChatTopic) {
    setMessages((current) => [
      ...current,
      { from: "user", text: t.chatbot.quick[topic] },
      { from: "bot", text: getChatAnswer(topic, locale) }
    ]);
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 md:bottom-6">
      {open ? (
        <div className="mb-3 w-[min(92vw,360px)] overflow-hidden rounded-lg border border-white/25 bg-[#f7f4ed] shadow-glow">
          <div className="flex items-center justify-between bg-treeGreen p-4 text-white">
            <p className="font-bold">{t.chatbot.title}</p>
            <button className="focus-ring rounded-full p-1" onClick={() => setOpen(false)} aria-label={t.actions.close}><X size={18} /></button>
          </div>
          <div className="max-h-72 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((message, index) => (
              <div key={index} className={`rounded-lg p-3 text-sm ${message.from === "bot" ? "bg-white text-greenGray" : "ml-8 bg-hotelBlue text-white"}`}>{message.text}</div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-charcoal/10 p-3">
            {topics.map((topic) => <button key={topic} className="focus-ring rounded-full bg-softWhite px-3 py-2 text-xs font-bold text-greenGray" onClick={() => ask(topic)}>{t.chatbot.quick[topic]}</button>)}
          </div>
          <div className="grid grid-cols-3 gap-2 p-3 pt-0">
            <a className="focus-ring rounded-full bg-treeGreen px-3 py-2 text-center text-xs font-bold text-white" href={`tel:${contact.phone.replaceAll(" ", "")}`} aria-label={t.actions.call}><Phone size={15} className="mx-auto" /></a>
            <button className="focus-ring rounded-full bg-coralBase px-3 py-2 text-xs font-bold text-white" onClick={onBook}>{t.nav.book}</button>
            <a className="focus-ring rounded-full bg-hotelBlue px-3 py-2 text-center text-xs font-bold text-white" href={contact.googleMapsUrl} target="_blank" rel="noopener noreferrer" aria-label={t.actions.map}><Send size={15} className="mx-auto" /></a>
          </div>
        </div>
      ) : null}
      <button className="focus-ring ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-coralBase text-white shadow-glow" onClick={() => setOpen(!open)} aria-label={t.chatbot.title}>
        <MessageCircle />
      </button>
    </div>
  );
}
