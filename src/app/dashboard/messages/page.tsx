"use client";
import { useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase";

type Conversation = {
  id: string;
  participantName: string;
  participantRole: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
  avatar?: string;
};

type Message = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }

    sb.auth.getSession().then(async ({ data }) => {
      if (!data.session) { setLoading(false); return; }
      setUserId(data.session.user.id);
      const { data: rows } = await sb
        .from("conversations")
        .select("id, participant_name, participant_role, last_message, last_at, unread_count, avatar")
        .eq("user_id", data.session.user.id)
        .order("last_at", { ascending: false });

      const convs: Conversation[] = (rows ?? []).map((r: Record<string, unknown>) => ({
        id: String(r.id),
        participantName: String(r.participant_name ?? ""),
        participantRole: String(r.participant_role ?? ""),
        lastMessage: String(r.last_message ?? ""),
        lastAt: String(r.last_at ?? ""),
        unread: Number(r.unread_count ?? 0),
        avatar: r.avatar ? String(r.avatar) : undefined,
      }));
      setConversations(convs);
      setLoading(false);
    });
  }, []);

  async function openConversation(conv: Conversation) {
    setActiveConv(conv);
    setMessages([]);
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb
      .from("messages")
      .select("id, sender_id, body, created_at")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true });
    setMessages((data ?? []).map((m: Record<string, unknown>) => ({
      id: String(m.id),
      senderId: String(m.sender_id),
      body: String(m.body),
      createdAt: String(m.created_at),
    })));
    // mark read
    await sb.from("conversations").update({ unread_count: 0 }).eq("id", conv.id);
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c));
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !activeConv) return;
    const sb = getSupabase();
    if (!sb) return;
    const body = draft.trim();
    setDraft("");
    const { data: msg } = await sb
      .from("messages")
      .insert({ conversation_id: activeConv.id, sender_id: userId, body })
      .select("id, sender_id, body, created_at")
      .single();
    if (msg) {
      setMessages(prev => [...prev, { id: msg.id, senderId: msg.sender_id, body: msg.body, createdAt: msg.created_at }]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  const initials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-stone-900">Messages</h1>
      </div>

      <div className="flex flex-1 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        {/* Conversation list */}
        <div className={`flex w-full flex-col border-r border-stone-100 md:w-72 ${activeConv ? "hidden md:flex" : "flex"}`}>
          <div className="border-b border-stone-100 p-3">
            <input
              type="search"
              placeholder="Search conversations…"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-amber-400"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-2 p-3">
                {[1, 2, 3].map(i => <div key={i} className="h-14 animate-pulse rounded-xl bg-stone-100" />)}
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-2xl mb-2">💬</p>
                <p className="text-sm font-semibold text-stone-600">No messages yet</p>
                <p className="mt-1 text-xs text-stone-400">Contact a service provider to start a conversation.</p>
              </div>
            ) : conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => openConversation(conv)}
                className={`flex w-full items-center gap-3 p-3 text-left transition hover:bg-stone-50 ${activeConv?.id === conv.id ? "bg-amber-50" : ""}`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                  {initials(conv.participantName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-stone-800 truncate">{conv.participantName}</p>
                    <p className="shrink-0 text-[10px] text-stone-400">{fmtTime(conv.lastAt)}</p>
                  </div>
                  <p className="text-xs text-stone-500 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        {activeConv ? (
          <div className={`flex flex-1 flex-col ${activeConv ? "flex" : "hidden md:flex"}`}>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-stone-100 px-4 py-3">
              <button onClick={() => setActiveConv(null)} className="md:hidden rounded-lg p-1 text-stone-400 hover:bg-stone-100">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                {initials(activeConv.participantName)}
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800">{activeConv.participantName}</p>
                <p className="text-xs text-stone-400 capitalize">{activeConv.participantRole}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => {
                const isMe = msg.senderId === userId;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm ${isMe ? "bg-amber-600 text-white rounded-br-sm" : "bg-stone-100 text-stone-800 rounded-bl-sm"}`}>
                      <p>{msg.body}</p>
                      <p className={`mt-1 text-[10px] ${isMe ? "text-amber-200" : "text-stone-400"}`}>{fmtTime(msg.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="border-t border-stone-100 p-3 flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white transition hover:bg-amber-700 disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </form>
          </div>
        ) : (
          <div className="hidden flex-1 items-center justify-center md:flex">
            <div className="text-center">
              <p className="text-3xl mb-3">💬</p>
              <p className="font-semibold text-stone-600">Select a conversation</p>
              <p className="mt-1 text-sm text-stone-400">Choose a conversation from the left to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
