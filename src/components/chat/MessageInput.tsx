import React, { useState } from 'react';
import { Send, Paperclip, Zap, Sparkles, Smile, Lock } from 'lucide-react';
import { QuickReply } from '../../types';

interface MessageInputProps {
  onSendMessage: (text: string, isNote?: boolean) => void;
  quickReplies: QuickReply[];
  onOpenQuickReplies?: () => void;
  contactName?: string;
  departmentName?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  quickReplies,
  contactName,
  departmentName
}) => {
  const [text, setText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    onSendMessage(text, isInternalNote);
    setText('');
    setIsInternalNote(false);
  };

  const handleGenerateAiReply = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/suggest-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: contactName || 'Cliente',
          departmentName: departmentName || 'Atendimento'
        })
      });
      const data = await res.json();
      if (data.suggestion) {
        setText(data.suggestion);
      }
    } catch (e) {
      console.warn('AI reply fail:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="p-3 bg-gray-900 border-t border-gray-800 shrink-0 space-y-2">
      {/* Quick Replies Popup Menu */}
      {showQuickMenu && (
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-2 mb-2 max-h-48 overflow-y-auto divide-y divide-gray-800 text-xs shadow-xl">
          <div className="font-semibold text-gray-400 p-1 text-[10px] uppercase">Respostas Rápidas</div>
          {quickReplies.map((qr) => (
            <button
              key={qr.id}
              onClick={() => {
                setText(qr.content);
                setShowQuickMenu(false);
              }}
              className="w-full text-left p-2 hover:bg-gray-800 rounded-lg text-gray-200 transition-all flex items-center justify-between"
            >
              <span className="font-semibold text-emerald-400">{qr.shortcut}</span>
              <span className="text-gray-400 truncate max-w-xs">{qr.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Mode Switch & AI Suggestion Bar */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsInternalNote(false)}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              !isInternalNote ? 'bg-emerald-600 text-white shadow' : 'text-gray-400 hover:text-gray-200 bg-gray-800'
            }`}
          >
            Resposta WhatsApp
          </button>
          <button
            type="button"
            onClick={() => setIsInternalNote(true)}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
              isInternalNote ? 'bg-amber-600 text-white shadow' : 'text-gray-400 hover:text-gray-200 bg-gray-800'
            }`}
          >
            <Lock className="w-3 h-3" />
            Nota Interna
          </button>
        </div>

        <button
          type="button"
          onClick={handleGenerateAiReply}
          disabled={isAiLoading}
          className="flex items-center gap-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer text-[11px]"
        >
          <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isAiLoading ? 'animate-spin' : ''}`} />
          {isAiLoading ? 'IA Gerando...' : 'IA Sugerir Resposta'}
        </button>
      </div>

      {/* Input Box Form */}
      <form onSubmit={handleSend} className="flex items-end gap-2">
        <div className="flex-1 bg-gray-950 border border-gray-800 rounded-2xl p-2.5 flex items-center gap-2 focus-within:border-emerald-500 transition-all">
          <button
            type="button"
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            title="Respostas Rápidas"
            className="p-1 text-gray-400 hover:text-emerald-400 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4" />
          </button>

          <textarea
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isInternalNote ? 'Escreva uma nota interna visível apenas para a equipe...' : 'Digite sua mensagem para o cliente...'}
            className="flex-1 bg-transparent border-none text-xs text-gray-100 placeholder-gray-500 focus:outline-none resize-none max-h-24"
          />
        </div>

        <button
          type="submit"
          className={`p-3 rounded-2xl text-white transition-all shadow-lg cursor-pointer ${
            isInternalNote
              ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/40'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
