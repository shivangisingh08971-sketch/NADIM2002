
import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage, SystemSettings } from '../types';
import { Send, Trash2, Edit2, Shield, MessageCircle, Lock, Clock, Coins, Crown, Ban } from 'lucide-react';

interface Props {
  currentUser: User;
  onUserUpdate: (user: User) => void;
  isAdminView?: boolean;
  settings?: SystemSettings;
}

export const UniversalChat: React.FC<Props> = ({ currentUser, onUserUpdate, isAdminView = false, settings }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const CHAT_COST = settings?.chatCost ?? 1;
  const COOLDOWN_MINS = settings?.chatCooldownMinutes ?? 360; // Default 6 hours
  const IS_ENABLED = settings?.isChatEnabled ?? true;

  useEffect(() => {
    const loadMessages = () => {
      const stored = localStorage.getItem('nst_universal_chat');
      if (stored) setMessages(JSON.parse(stored));
    };
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const canSendMessage = () => {
      if (currentUser.role === 'ADMIN') return { allowed: true };
      if (currentUser.isChatBanned) return { allowed: false, reason: "Banned from chat" };
      if (!IS_ENABLED) return { allowed: false, reason: "Chat disabled" };
      if (CHAT_COST > 0 && currentUser.credits < CHAT_COST && !currentUser.isPremium) return { allowed: false, reason: `Insufficient Credits (Need ${CHAT_COST})` };
      
      if (currentUser.lastChatTime && !currentUser.isPremium) {
          const lastTime = new Date(currentUser.lastChatTime).getTime();
          const diffMins = (Date.now() - lastTime) / (1000 * 60);
          if (diffMins < COOLDOWN_MINS) {
              const remaining = COOLDOWN_MINS - diffMins;
              const h = Math.floor(remaining / 60);
              const m = Math.floor(remaining % 60);
              return { allowed: false, reason: `Cooldown: Wait ${h > 0 ? h+'h ' : ''}${m}m` };
          }
      }
      return { allowed: true };
  };

  const handleSend = () => {
      if (!inputText.trim()) return;
      const check = canSendMessage();
      if (!check.allowed) { setErrorMsg(check.reason); return; }

      if (currentUser.role !== 'ADMIN' && !currentUser.isPremium) {
          const updatedUser = { ...currentUser, credits: currentUser.credits - CHAT_COST, lastChatTime: new Date().toISOString() };
          onUserUpdate(updatedUser);
      }

      const newMessage: ChatMessage = {
          id: Date.now().toString(), userId: currentUser.id, userName: currentUser.name, userRole: currentUser.role,
          text: inputText, timestamp: new Date().toISOString()
      };
      const updated = [...messages, newMessage];
      setMessages(updated);
      localStorage.setItem('nst_universal_chat', JSON.stringify(updated));
      setInputText('');
      setErrorMsg(null);
  };

  const handleDelete = (id: string) => {
    if(window.confirm("Delete msg?")) {
        const up = messages.map(m => m.id === id ? {...m, isDeleted: true} : m);
        setMessages(up);
        localStorage.setItem('nst_universal_chat', JSON.stringify(up));
    }
  };

  const statusCheck = canSendMessage();

  return (
    <div className="flex flex-col h-[75vh] bg-white rounded-[40px] shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg"><MessageCircle size={24} /></div>
                <div>
                    <h3 className="font-black text-xl leading-none">Global Chat</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Community Support</p>
                </div>
            </div>
            {!isAdminView && !currentUser.isPremium && CHAT_COST > 0 && (
                <div className="text-right hidden md:block">
                    <div className="text-[9px] font-black text-slate-500 uppercase">Message Policy</div>
                    <div className="text-xs font-bold text-blue-400">{CHAT_COST} Cr / {Math.round(COOLDOWN_MINS / 60)}h</div>
                </div>
            )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 custom-scrollbar">
            {messages.filter(m => !m.isDeleted).map((msg) => (
                <div key={msg.id} className={`flex ${msg.userId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-[28px] p-4 shadow-sm relative group ${msg.userId === currentUser.id ? 'bg-blue-600 text-white rounded-tr-none' : msg.userRole === 'ADMIN' ? 'bg-purple-100 text-purple-900 border-2 border-purple-200 rounded-tl-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'}`}>
                        <div className="flex justify-between items-center gap-4 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{msg.userName}</span>
                            <span className="text-[9px] opacity-40">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                        {currentUser.role === 'ADMIN' && (
                            <button onClick={() => handleDelete(msg.id)} className="absolute -top-2 -right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12} /></button>
                        )}
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-white border-t border-slate-100">
            {errorMsg && <div className="mb-3 text-center animate-bounce"><span className="bg-red-50 text-red-600 text-[10px] font-black px-4 py-1.5 rounded-full border border-red-100">{errorMsg}</span></div>}
            <div className="flex gap-3">
                <input value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder={statusCheck.allowed ? "Say something..." : statusCheck.reason} disabled={!statusCheck.allowed} className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
                <button onClick={handleSend} disabled={!statusCheck.allowed || !inputText.trim()} className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 transition-all active:scale-90 disabled:bg-slate-200"><Send size={24} /></button>
            </div>
        </div>
    </div>
  );
};
